import axios from 'axios';
import { FeedbackModel, FeedbackPointModel } from '../models/FeedbackModel';

const API_URL = 'https://api.openai.com/v1/chat/completions';

//const MODEL_GPT_4O = 'gpt-4o';
const MODEL_GPT_4O_MINI = 'gpt-4o-mini';
// const MODEL_GPT_35_TURBO = 'gpt-3.5-turbo';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const getBaseCoach = (area: string): string => (
    `You are a coding coach who is trained to give feedback only on "${area}". Your task is to provide constructive feedback on the code provided by the user.  You will be given code in the first message. You should reply with a JSON object containing feedback on the code only on the area that you have been assigned to below.
    
    All feedback should be in markdown format. All titles used should use H3 as the largest heading.`
)

const getAdvancedTechniquesCoach = (): ChatMessage => ({
    role: 'system',
    content: `${getBaseCoach("advanced techniques and best practices")}
    
    You should focus only on teaching the user advanced techniques and best practices. Explain how they could improve their code by using techniques, approaches, syntax, patterns and language features that they might not be familiar with.
    
    Do not feature feedback from any other possible area. Only give feedback on the above area.`
});

const getReadabilityCoach = (): ChatMessage => ({
    role: 'system',
    content: `${getBaseCoach("Readability and Code Quality")}

    You should focus on the Readability of the code and general code quality. This might include things like variable names, comments, code structure, and overall readability.
    
    Do not feature feedback from any other possible area. Only give feedback on the above area.`
});

const getPerformanceCoach = (): ChatMessage => ({
    role: 'system',
    content: `${getBaseCoach("Performance")}

    You should focus on the Performance of the code. This might include things like algorithmic complexity, memory usage, and execution speed. Some red flags might be inefficient loops, unnecessary memory allocations, or slow algorithms.
    
    Do not feature feedback from any other possible area. Only give feedback on the above area.`
});

const getConversationalCoach = (): ChatMessage => ({
    role: 'system',
    content: `You are a coding coach. Your task is to provide constructive feedback on the code provided by the user. 
    
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
                            "summary": {
                                "type": "string",
                                "description": "A very short summary of the problem, expained in the context of a beginner coder, without using any of the words in the title."
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
                            }, "type": {
                                "type": "string",
                                "enum": ["Performance", "Readability", "Advanced"]
                            }
                        },
                        "required": [
                            "title",
                            "description",
                            "code_example",
                            "questions",
                            "line_numbers",
                            "summary",
                            "type"
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

export const getCodeFeedback = async (code: string, feedbackType: string): Promise<FeedbackModel> => {
    const messages: ChatMessage[] = [
        {
            role: 'user',
            content: addLineNumbers(code),
        },
    ];

    if (feedbackType.toLowerCase() === 'readability') {
        messages.unshift(getReadabilityCoach());
    } else if (feedbackType.toLowerCase() === 'advanced') {
        messages.unshift(getAdvancedTechniquesCoach());
    } else if (feedbackType.toLowerCase() === 'performance') {
        messages.unshift(getPerformanceCoach());
    }

    try {
        const response = await axios.post(
            API_URL,
            {
                model: MODEL_GPT_4O_MINI,
                messages: messages,
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

        const feedbackData = JSON.parse(response.data.choices[0].message.content);
        const feedbackPoints = feedbackData.feedback_points.map((point: any) => new FeedbackPointModel(
            point.title,
            point.description,
            point.questions,
            point.line_numbers,
            point.code_example,
            point.summary,
            point.type));

        return {
            feedbackType: feedbackType,
            feedbackPoints: feedbackPoints,
            language: feedbackData.language,
        } as FeedbackModel;
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