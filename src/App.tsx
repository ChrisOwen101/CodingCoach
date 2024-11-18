import './App.css'
import { useState } from 'react';
import { useEffect } from 'react';
import { getCodeFeedback } from './networks/gpt';
import FeedbackPoint from './Feedback';
import { FeedbackModel, FeedbackPointModel } from './models/FeedbackModel';
import CodeEditor from '@uiw/react-textarea-code-editor';
import rehypePrism from 'rehype-prism-plus';
import rehypeRewrite from "rehype-rewrite";
import { useRef } from 'react';



function App() {
  const [code, setCode] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<FeedbackModel | undefined>(undefined);
  const [hoveredPoint, setHoveredPoint] = useState<FeedbackPointModel | undefined>(undefined);

  useEffect(() => {
    if (!code) {
      return;
    }

    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await getCodeFeedback(code);
        setFeedback(response);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [code]);

  const getLinesToHighlight = (line_numbers: string): number[] => {
    const lines: number[] = [];
    const parts = line_numbers.split(',');

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

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div ref={codeEditorRef} style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        <h2>Code</h2>
        <CodeEditor
          value={code}
          language={feedback?.language || "text"}
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
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        <h2>Feedback</h2>
        {loading && <p>Loading...</p>}
        {feedback && feedback.feedback_points.map((point: FeedbackPointModel, _: number) => (
          <FeedbackPoint key={point.title} language={feedback.language} initialCode={code} point={point} onLeave={() => {
            setHoveredPoint(undefined);
          }} onHover={(hoveredPoint) => {
            setHoveredPoint(hoveredPoint);
            console.log(hoveredPoint.getLinesToHighlight()[0] * 10)
            scrollToDepth(hoveredPoint.getLinesToHighlight()[0] * 10);
          }} />
        ))}
      </div>
    </div >
  );
}
export default App
