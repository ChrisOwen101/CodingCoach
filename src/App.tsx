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
  const [feedbackList, setFeedbackList] = useState<FeedbackPointModel[]>([]);
  const [language, setLanguage] = useState<string | undefined>(undefined);

  const [hoveredPoint, setHoveredPoint] = useState<FeedbackPointModel | undefined>(undefined);
  const [expandedPoint, setExpandedPoint] = useState<FeedbackPointModel | undefined>(undefined);
  const [expandedPointModalOpen, setExpandedPointModalOpen] = useState<boolean>(false);
  const [hasCodeChanged, setHasCodeChanged] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (code: string) => {
    if (!code) {
      return;
    }

    try {
      setHasCodeChanged(false);
      setFeedbackList([]);
      setIsLoading(true);
      Promise.all([
        getCodeFeedback(code, "Performance"),
        getCodeFeedback(code, "Readability"),
        getCodeFeedback(code, "Advanced"),
        getCodeFeedback(code, "Bug"),
      ]).then(([perf, read, adv, bug]) => {
        setLanguage(perf.language);

        const combinedPoints = [
          ...perf.feedbackPoints,
          ...read.feedbackPoints,
          ...adv.feedbackPoints,
          ...bug.feedbackPoints,
        ];

        combinedPoints.sort((a, b) => b.severity - a.severity);
        setFeedbackList(combinedPoints);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  }

  const getReloadMessage = () => {
    return <div>
      <div className="alert alert-primary" role="alert">
        Your code has changed; click submit to get new feedback.
        <br />
        <br />
        {getSubmitButton()}
      </div>
    </div>
  }

  const getLoadingPanel = () => {
    return <div className="spinner" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  }

  const getFeedbackSidePanel = () => {
    const getSeverityColor = (severity: number) => {
      switch (severity) {
        case 5: return '#f8d7da';  // critical
        case 4: return '#fff3cd';  // high
        case 3: return '#d1ecf1';  // medium
        case 2: return '#e2e3e5';  // low
        default: return '#fefefe'; // informational
      }
    };

    const getSeverityLabel = (severity: number) => {
      switch (severity) {
        case 5: return 'Critical';
        case 4: return 'High';
        case 3: return 'Medium';
        case 2: return 'Low';
        default: return 'Informational';
      }
    };

    const groupedBySeverity = feedbackList.reduce((acc, point) => {
      (acc[point.severity] = acc[point.severity] || []).push(point);
      return acc;
    }, {} as Record<number, FeedbackPointModel[]>);

    return (
      <div>
        {hasCodeChanged && getReloadMessage()}
        {Object.keys(groupedBySeverity).sort((a, b) => Number(b) - Number(a)).map(sev => {
          const severity = Number(sev);
          return (
            <div
              key={sev}
              style={{
                backgroundColor: getSeverityColor(severity),
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '8px'
              }}
            >
              <h4>{getSeverityLabel(severity)}</h4>
              {groupedBySeverity[severity].map((point, idx) => (
                <FeedbackPoint
                  key={idx}
                  point={point}
                  onLeave={() => {
                    setHoveredPoint(undefined);
                  }}
                  onHover={(hoveredPoint) => {
                    setHoveredPoint(hoveredPoint);
                    scrollToDepth(hoveredPoint.getLinesToHighlight()[0] * 21);
                  }}
                  onExpandClicked={() => {
                    setExpandedPoint(point);
                    setExpandedPointModalOpen(true);
                  }}
                />
              ))}
            </div>
          );
        })}
        <FeedbackModal point={expandedPoint || { title: 'Loading', description: '', questions: '', line_numbers: '', code_example: '', summary: '' } as FeedbackPointModel} language={language ? language : "text"} initialCode={code} isModalOpen={expandedPointModalOpen} onModalClose={
          () => {
            setExpandedPointModalOpen(false);
            setExpandedPoint(undefined);
          }
        } />
      </div>
    );
  }

  const getSubmitButton = () => {
    return <button type="button" className="btn btn-primary" onClick={() => {
      onSubmit(code || '');
    }}>
      Submit
    </button>
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
      <p>Feedback is categorized by severity:</p>
      <ul>
        <li><strong>Critical</strong>: Important issues that need attention to ensure your code runs smoothly.</li>
        <li><strong>High</strong>: Significant improvements that can enhance your code's performance or functionality.</li>
        <li><strong>Medium</strong>: Useful suggestions to make your code more efficient and effective.</li>
        <li><strong>Low</strong>: Minor tweaks that can help polish your code.</li>
        <li><strong>Informational</strong>: Helpful tips and best practices to consider.</li>
      </ul>
      {getSubmitButton()}
    </div>
  }

  const showIntroPanel = feedbackList.length === 0;

  return (
    <div style={{ display: 'flex', height: '100vh', margin: expandedPointModalOpen ? "0px" : '12px', position: 'relative' }}>
      {expandedPointModalOpen && <div style={{ position: 'fixed', top: 0, right: 0, width: '50%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }}></div>}
      <div ref={codeEditorRef} style={{ position: 'relative', flex: expandedPointModalOpen ? '0 0 50%' : 1, padding: expandedPointModalOpen ? '0px' : '12px', overflowY: 'auto', zIndex: expandedPointModalOpen ? 2 : 0 }}>
        <CodeEditor
          value={code}
          language={feedbackList.length > 0 ? language : "text"}
          placeholder="Copy and paste your code here"
          onChange={(evn) => {
            console.log(code)
            setHasCodeChanged(code !== undefined);
            setCode(evn.target.value)
          }
          }
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
        {isLoading ? getLoadingPanel() : showIntroPanel ? getIntroPanel() : getFeedbackSidePanel()}
      </div>
    </div >
  );
}
export default App
