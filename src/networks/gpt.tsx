import axios from 'axios';
import { FeedbackModel } from '../models/FeedbackModel';

const API_URL = 'https://api.openai.com/v1/chat/completions';

// const MODEL_GPT_4O = 'gpt-4o';
const MODEL_GPT_4O_MINI = 'gpt-4o-mini';
// const MODEL_GPT_35_TURBO = 'gpt-3.5-turbo';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const getSystemMessageForCoach = (): ChatMessage => ({
    role: 'system',
    content: `You are a coding coach. Your task is to provide constructive feedback on the code provided by the user. Focus on best practices, potential improvements, and any errors or issues you notice.
    
    You will be given code in the first message. You should reply with a message providing feedback on the code. You can also ask clarifying questions or provide additional information to help the user improve their code.`
});

const getConversationalCoach = (): ChatMessage => ({
    role: 'system',
    content: `You are a coding coach. Your task is to provide constructive feedback on the code provided by the user. Focus on best practices, potential improvements, and any errors or issues you notice.
    
    You will know the codebase, the previous feedback given and then you will be answering questions and queries the trainees has about the feedback.
    
    Keep responses fairly short and conversational.`
});


const getSchema = () => (
    {
        "name": "feedback_list",
        "schema": {
            "type": "object",
            "properties": {
                "language": {
                    "type": "string",
                    "description": "The programming language of the code given in prism format."
                },
                "feedback_points": {
                    "type": "array",
                    "description": "A collection of feedback points.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "The title of the feedback point."
                            },
                            "description": {
                                "type": "string",
                                "description": "A detailed explanation of the feedback given."
                            },
                            "questions": {
                                "type": "string",
                                "description": "Acting as a coach, use questioning to help the trainee understand the feedback."
                            },
                            "line_numbers": {
                                "type": "string",
                                "description": "The line numbers in the code where the feedback applies. Denoted as a comma separated list, with individual numbers or ranges of numbers (e.g. 3,4,10-15)"
                            },
                            "code_example": {
                                "type": "string",
                                "description": "A code example providing a solution or illustration related to the feedback."
                            }
                        },
                        "required": [
                            "title",
                            "description",
                            "code_example",
                            "questions",
                            "line_numbers",
                        ],
                        "additionalProperties": false
                    }
                }
            },
            "required": [
                "feedback_points",
                "language"
            ],
            "additionalProperties": false
        },
        "strict": true
    }
);

const addLineNumbers = (code: string): string => {
    const lines = code.split('\n');
    return lines.map((line, index) => `${index + 1}: ${line}`).join('\n');
}

export const getCodeFeedback = async (code: string): Promise<FeedbackModel> => {
    const messages: ChatMessage[] = [
        {
            role: 'user',
            content: addLineNumbers(code),
        },
    ];

    try {
        const response = await axios.post(
            API_URL,
            {
                model: MODEL_GPT_4O_MINI,
                messages: [getSystemMessageForCoach(), ...messages],
                response_format: {
                    type: "json_schema",
                    json_schema: getSchema(),
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
                },
            }
        );

        return JSON.parse(response.data.choices[0].message.content) as FeedbackModel;
    } catch (error) {
        console.error('Error starting conversation:', error);
        throw error;
    }
};

export const continueConversation = async (initialCode: string | undefined, feedbackPoint: string, previousMessages: string[], newMessage: string): Promise<string> => {
    const messages: ChatMessage[] = [
        {
            role: 'user',
            content: addLineNumbers(initialCode ?? ""),
        },
        {
            role: 'assistant',
            content: feedbackPoint,
        },
        ...previousMessages.map(message => ({
            role: 'user',
            content: message,
        })) as ChatMessage[],
        {
            role: 'user',
            content: newMessage,
        },
    ];

    try {
        const response = await axios.post(
            API_URL,
            {
                model: MODEL_GPT_4O_MINI,
                messages: [getConversationalCoach(), ...messages],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content
    } catch (error) {
        console.error('Error continuing conversation:', error);
        throw error;
    }
};