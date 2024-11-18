export class FeedbackPointModel {
    title: string;
    description: string;
    questions: string;
    line_numbers: string;
    code_example: string;

    constructor(title: string, description: string, questions: string, line_numbers: string, code_example: string) {
        this.title = title;
        this.description = description;
        this.questions = questions;
        this.line_numbers = line_numbers;
        this.code_example = code_example;
    }

    getLinesToHighlight(): number[] {
        const lines: number[] = [];
        const parts = this.line_numbers.split(',');

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
    }
}

export interface FeedbackModel {
    feedback_points: FeedbackPointModel[];
    language: string;
}