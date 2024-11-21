import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FeedbackPointModel } from './models/FeedbackModel';
import { continueConversation } from './networks/gpt';
import Markdown from 'react-markdown'



interface FeedbackModalProps {
    point: FeedbackPointModel;
    language: string;
    initialCode: string | undefined;
    isModalOpen: boolean;
    onModalClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ point, isModalOpen, language, initialCode, onModalClose }) => {
    const [messages, setMessages] = React.useState<string[]>([]);

    const convertFeedbackPointToString = (feedback_point: FeedbackPointModel): string => {
        return `${feedback_point.title}\n${feedback_point.description}\n${feedback_point.questions}\n${feedback_point.code_example}`;
    }

    const onEnterPressed = async (newMessage: string, feedback_point: FeedbackPointModel) => {
        setMessages([...messages, newMessage]);

        continueConversation(initialCode, convertFeedbackPointToString(feedback_point), messages, newMessage).then((response) => {
            setMessages((prevMessages) => [...prevMessages, response]);
        })
    }

    const handleClose = () => {
        setMessages([]);
        onModalClose();
    };

    console.log(isModalOpen)

    return (
        <>
            {<div className={`modal fade ${isModalOpen ? 'show' : ''}`} style={{ display: isModalOpen ? 'block' : 'none', position: 'fixed', top: 0, right: 0, width: '50%', height: '100%', marginLeft: 'auto' }}>
                <div className="modal-dialog modal-dialog-scrollable" style={{ height: '100%', margin: 0, maxWidth: '100%' }}>
                    <div className="modal-content" style={{ height: '100%' }}>
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="staticBackdropLabel">{point.title}</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleClose}></button>
                        </div>
                        <div className="modal-body" style={{ overflowY: 'auto' }}>
                            <p>{point.description}</p>
                            <p>{point.questions}</p>
                            <SyntaxHighlighter language={language} style={docco} wrapLongLines={true}>
                                {point.code_example}
                            </SyntaxHighlighter>
                            <div>
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
                                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>}
        </>
    );
};

export default FeedbackModal;