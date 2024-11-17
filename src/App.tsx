import './App.css'
import React, { useState } from 'react';
import { useEffect } from 'react';
import { getCodeFeedback } from './networks/gpt';
import Feedback from './Feedback';
import { FeedbackModel, FeedbackPointModel } from './models/FeedbackModel';
import CodeEditor from '@uiw/react-textarea-code-editor';
import rehypePrism from 'rehype-prism-plus';
import rehypeRewrite from "rehype-rewrite";


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

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '10px' }}>
        <h2>Code</h2>
        <CodeEditor
          value={code}
          language="python"
          placeholder="Please enter python code."
          onChange={(evn) => setCode(evn.target.value)}
          padding={15}
          rehypePlugins={[
            [rehypePrism, { ignoreMissing: true }],
            [
              rehypeRewrite,
              {
                rewrite: (node, index, parent) => {
                  if (node.properties?.className?.includes("code-line")) {
                    if (hoveredPoint && hoveredPoint.line_numbers) {
                      const linesToHighlight = getLinesToHighlight(hoveredPoint.line_numbers);
                      console.log(linesToHighlight);
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
      <div style={{ flex: 1, padding: '10px' }}>
        <h2>Feedback</h2>
        {loading && <p>Loading...</p>}
        {feedback && <Feedback feedback_points={feedback.feedback_points} onLeave={() => {
          setHoveredPoint(undefined);
        }} onHover={(hovered_point) => {
          setHoveredPoint(hovered_point);
        }} />}
      </div>
    </div>
  );
}
export default App
