import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FeedbackPointModel } from './models/FeedbackModel';


interface FeedbackProps {
    feedback_points: FeedbackPointModel[];
    onHover?: (point: FeedbackPointModel) => void;
    onLeave?: () => void;
    language: string;
}

const formatLineString = (line_numbers: string): string => {
    if (line_numbers.includes('-') || line_numbers.includes(',')) {
        return `Lines ${line_numbers}`;
    } else {
        return `Line ${line_numbers}`;
    }
}

const Feedback: React.FC<FeedbackProps> = ({ feedback_points, onHover, onLeave, language }) => {
    return (
        <div onMouseLeave={onLeave}>
            {feedback_points.map((point, index) => (
                <div key={index} style={{ marginBottom: '20px' }} onMouseEnter={() => {
                    if (onHover) {
                        onHover(point);
                    }
                }}>
                    <h3>{point.title} <i>({formatLineString(point.line_numbers)})</i></h3>
                    <p>{point.description}</p>
                    <p>{point.questions}</p>
                    <SyntaxHighlighter language={language} style={docco} wrapLongLines={true}>
                        {point.code_example}
                    </SyntaxHighlighter>
                </div>
            ))}
        </div>
    );
};

export default Feedback;