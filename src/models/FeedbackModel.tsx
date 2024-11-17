export interface FeedbackPointModel {
    title: string;
    description: string;
    questions: string;
    line_numbers: string;
    code_example: string;
}

export interface FeedbackModel {
    feedback_points: FeedbackPointModel[];
}