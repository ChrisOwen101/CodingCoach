import './App.css'
import { useState, useEffect, useRef } from 'react';
import { getCodeFeedback } from './networks/gpt';
import FeedbackPoint from './FeedbackPoint';
import { FeedbackModel, FeedbackPointModel } from './models/FeedbackModel';
import CodeEditor from '@uiw/react-textarea-code-editor';
import rehypePrism from 'rehype-prism-plus';
import rehypeRewrite from "rehype-rewrite";
import FeedbackModal from './FeedbackModal';



const App = () => {
  const [code, setCode] = useState<string | undefined>(undefined);
  const [performanceLoading, setPerformanceLoading] = useState<boolean>(false);
  const [readabilityLoading, setReadabilityLoading] = useState<boolean>(false);
  const [advancedLoading, setAdvancedLoading] = useState<boolean>(false);

  const [performanceFeedback, setPerformanceFeedback] = useState<FeedbackModel | undefined>(undefined);
  const [readabilityFeedback, setReadabilityFeedback] = useState<FeedbackModel | undefined>(undefined);
  const [advancedFeedback, setAdvancedFeedback] = useState<FeedbackModel | undefined>(undefined);
  const [hoveredPoint, setHoveredPoint] = useState<FeedbackPointModel | undefined>(undefined);
  const [expandedPoint, setExpandedPoint] = useState<FeedbackPointModel | undefined>(undefined);
  const [expandedPointModalOpen, setExpandedPointModalOpen] = useState<boolean>(false);

  const onSubmit = async (code: string) => {
    if (!code) {
      return;
    }

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
  }

  const getFeedbackSidePanel = () => {
    return <div> {getFeedbackComponent(readabilityFeedback, "Readability")}
      {getFeedbackComponent(performanceFeedback, "Performance")}
      {getFeedbackComponent(advancedFeedback, "Advanced")}
      <FeedbackModal point={expandedPoint || { title: 'Loading', description: '', questions: '', line_numbers: '', code_example: '', summary: '' } as FeedbackPointModel} language={performanceFeedback?.language || readabilityFeedback?.language || advancedFeedback?.language || "text"} initialCode={code} isModalOpen={expandedPointModalOpen} onModalClose={
        () => {
          setExpandedPointModalOpen(false);
          setExpandedPoint(undefined);
        }
      } />
    </div>
  }

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
      const containerHeight = codeEditorRef.current.clientHeight;
      const scrollTop = depth - containerHeight / 2;
      codeEditorRef.current.scrollTo({
        top: scrollTop < 0 ? 0 : scrollTop,
        behavior: 'smooth',
      });
    }
  };

  const getIntroPanel = () => {
    return <div>
      <h1>Code Feedback</h1>
      <p>Submit your code to get feedback on performance, readability and advanced topics.</p>
      <button onClick={() => {
        onSubmit(code || '');
      }}>
        Submit
      </button>
    </div>
  }

  const getFeedbackComponent = (feedback: FeedbackModel | undefined, type: string) => {
    const loadingState: { [key: string]: boolean } = {
      "Performance": performanceLoading,
      "Readability": readabilityLoading,
      "Advanced": advancedLoading
    };

    if (loadingState[type]) {
      return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className='spinner' />
        <p style={{ marginLeft: '10px' }}>Loading {type.toLowerCase()} feedback...</p>
      </div>
      );
    }

    if (!feedback) {
      return <p></p>;
    }

    return feedback.feedbackPoints.map((point: FeedbackPointModel, _: number) => (
      <FeedbackPoint key={point.title} point={point} onLeave={() => {
        setHoveredPoint(undefined);
      }} onHover={(hoveredPoint) => {
        setHoveredPoint(hoveredPoint);
        scrollToDepth(hoveredPoint.getLinesToHighlight()[0] * 21);
      }} onExpandClicked={() => {
        setExpandedPoint(point);
        setExpandedPointModalOpen(true);
      }} />
    ));
  }

  const showIntroPanel = !performanceFeedback && !readabilityFeedback && !advancedFeedback && !performanceLoading && !readabilityLoading && !advancedLoading;

  return (
    <div style={{ display: 'flex', height: '100vh', margin: expandedPointModalOpen ? "0px" : '12px', position: 'relative' }}>
      {expandedPointModalOpen && <div style={{ position: 'fixed', top: 0, right: 0, width: '50%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }}></div>}
      <div ref={codeEditorRef} style={{ position: 'relative', flex: expandedPointModalOpen ? '0 0 50%' : 1, padding: expandedPointModalOpen ? '0px' : '12px', overflowY: 'auto', zIndex: expandedPointModalOpen ? 2 : 0 }}>
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
                    const point = hoveredPoint || expandedPoint;

                    if (point && point.line_numbers) {
                      const linesToHighlight = getLinesToHighlight(point.line_numbers);

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
            minHeight: '100%',
            fontSize: 14,
            fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          }}
        />
      </div>
      <div style={{ flex: expandedPointModalOpen ? '0 0 50%' : 1, padding: '12px', overflowY: 'auto', zIndex: expandedPointModalOpen ? 2 : 0 }}>
        {showIntroPanel ? getIntroPanel() : getFeedbackSidePanel()}
      </div>
    </div >
  );
}
export default App
