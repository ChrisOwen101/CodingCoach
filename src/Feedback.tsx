import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FeedbackPointModel } from './models/FeedbackModel';
import { continueConversation } from './networks/gpt';
import Markdown from 'react-markdown'



interface FeedbackProps {
    point: FeedbackPointModel;
    onHover?: (point: FeedbackPointModel) => void;
    onLeave?: () => void;
    language: string;
    initialCode: string | undefined;
}

const formatLineString = (line_numbers: string): string => {
    if (line_numbers.includes('-') || line_numbers.includes(',')) {
        return `Lines ${line_numbers}`;
    } else {
        return `Line ${line_numbers}`;
    }
}

const FeedbackPoint: React.FC<FeedbackProps> = ({ point, onHover, onLeave, language, initialCode }) => {
    const [messages, setMessages] = React.useState<string[]>([]);
    const [isHovering, setIsHovering] = React.useState<boolean>(false);

    const convertFeedbackPointToString = (feedback_point: FeedbackPointModel): string => {
        return `${feedback_point.title}\n${feedback_point.description}\n${feedback_point.questions}\n${feedback_point.code_example}`;
    }

    const onEnterPressed = async (newMessage: string, feedback_point: FeedbackPointModel) => {
        setMessages([...messages, newMessage]);

        continueConversation(initialCode, convertFeedbackPointToString(feedback_point), messages, newMessage).then((response) => {
            setMessages((prevMessages) => [...prevMessages, response]);
        })
    }

    return (
        <>
            {
                <div key={point.title} style={{ marginBottom: '20px' }} onMouseEnter={() => {
                    if (onHover) {
                        setIsHovering(true);
                        onHover(point);
                    }
                }} onMouseLeave={() => {
                    onLeave && onLeave()
                    setIsHovering(false);
                }}>
                    <h3>{point.title} <i>({formatLineString(point.line_numbers)})</i></h3>
                    <p>{point.description}</p>
                    <p>{point.questions}</p>
                    <SyntaxHighlighter language={language} style={docco} wrapLongLines={true}>
                        {point.code_example}
                    </SyntaxHighlighter>
                    <div style={{ display: isHovering ? 'block' : 'none' }}>
                        {messages.map((message, idx) => (
                            <div key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f0f0f0' : '#ffffff', padding: '10px', borderRadius: '5px', marginBottom: '5px' }}>
                                <Markdown>{message}</Markdown>
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Ask a follow-up question"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                                onEnterPressed(e.currentTarget.value, point);
                                e.currentTarget.value = '';
                            }
                        }}
                        style={{ width: '100%', padding: '8px', marginTop: '10px', display: isHovering ? 'block' : 'none' }}
                    />
                </div>
            }
        </>
    );
};

export default FeedbackPoint;