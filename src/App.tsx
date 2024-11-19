import './App.css'
import { useState, useEffect, useRef } from 'react';
import { getCodeFeedback } from './networks/gpt';
import FeedbackPoint from './Feedback';
import { FeedbackModel, FeedbackPointModel } from './models/FeedbackModel';
import CodeEditor from '@uiw/react-textarea-code-editor';
import rehypePrism from 'rehype-prism-plus';
import rehypeRewrite from "rehype-rewrite";



function App() {
  const [code, setCode] = useState<string | undefined>(undefined);
  const [performanceLoading, setPerformanceLoading] = useState<boolean>(false);
  const [readabilityLoading, setReadabilityLoading] = useState<boolean>(false);
  const [advancedLoading, setAdvancedLoading] = useState<boolean>(false);

  const [performanceFeedback, setPerformanceFeedback] = useState<FeedbackModel | undefined>(undefined);
  const [readabilityFeedback, setReadabilityFeedback] = useState<FeedbackModel | undefined>(undefined);
  const [advancedFeedback, setAdvancedFeedback] = useState<FeedbackModel | undefined>(undefined);
  const [hoveredPoint, setHoveredPoint] = useState<FeedbackPointModel | undefined>(undefined);

  useEffect(() => {
    if (!code) {
      return;
    }

    const fetchFeedback = async () => {
      try {
        setAdvancedLoading(true);
        setPerformanceLoading(true);
        setReadabilityLoading(true);
        getCodeFeedback(code, "Performance").then((feedback) => {
          setPerformanceFeedback(feedback)
          setPerformanceLoading(false);
        });
        getCodeFeedback(code, "Readability").then((feedback) => {
          setReadabilityFeedback(feedback)
          setReadabilityLoading(false);
        });
        getCodeFeedback(code, "Advanced").then((feedback) => {
          setAdvancedFeedback(feedback)
          setAdvancedLoading(false);
        });
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    fetchFeedback();
  }, [code]);

  const getLinesToHighlight = (lineNumbers: string): number[] => {
    const lines: number[] = [];
    const parts = lineNumbers.split(',');

    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          lines.push(i);
        }
      } else {
        lines.push(Number(part));
      }
    });

    return lines;
  };

  const codeEditorRef = useRef<HTMLDivElement>(null);

  const scrollToDepth = (depth: number) => {
    if (codeEditorRef.current) {
      codeEditorRef.current.scrollTo({
        top: depth,
        behavior: 'smooth',
      });
    }
  };

  const getFeedbackComponent = (feedback: FeedbackModel | undefined) => {
    if (feedback?.feedbackType === "Performance" && performanceLoading) {
      return <p>Loading performance feedback...</p>;
    } else if (feedback?.feedbackType === "Readability" && readabilityLoading) {
      return <p>Loading readability feedback...</p>;
    } else if (feedback?.feedbackType === "Advanced" && advancedLoading) {
      return <p>Loading advanced feedback...</p>;
    }

    if (!feedback) {
      return <p>No feedback available</p>;
    }

    return feedback.feedbackPoints.map((point: FeedbackPointModel, index: number) => (
      <FeedbackPoint key={point.title} language={feedback.language} initialCode={code} point={point} onLeave={() => {
        setHoveredPoint(undefined);
      }} onHover={(hoveredPoint) => {
        setHoveredPoint(hoveredPoint);
        scrollToDepth(hoveredPoint.getLinesToHighlight()[0] * 21);
      }} />
    ));
  }

  return (
    <div style={{ display: 'flex', height: '100vh', margin: '12px' }}>
      <div ref={codeEditorRef} style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <h1>Code</h1>
        <CodeEditor
          value={code}
          language={performanceFeedback?.language || readabilityFeedback?.language || advancedFeedback?.language || "text"}
          placeholder="Copy and paste your code here"
          onChange={(evn) => setCode(evn.target.value)}
          padding={15}
          rehypePlugins={[
            [rehypePrism, { ignoreMissing: true }],
            [
              rehypeRewrite,
              {
                rewrite: (node: any, index: number) => {
                  if (node.properties?.className?.includes("code-line")) {
                    if (hoveredPoint && hoveredPoint.line_numbers) {
                      const linesToHighlight = getLinesToHighlight(hoveredPoint.line_numbers);

                      if (linesToHighlight.includes(index + 1)) {
                        node.properties.className.push("code_highlighted");
                      } else {
                        node.properties.className.push("code_greyed");
                      }

                    }
                  }
                }
              }
            ]
          ]}
          style={{
            backgroundColor: "#f5f5f5",
            fontSize: 14,
            fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          }}
        />
      </div>
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <h1>Feedback</h1>
        <h2>Performance</h2>
        {getFeedbackComponent(performanceFeedback)}
        <h2>Readability</h2>
        {getFeedbackComponent(readabilityFeedback)}
        <h2>Advanced</h2>
        {getFeedbackComponent(advancedFeedback)}
      </div>
    </div >
  );
}
export default App
