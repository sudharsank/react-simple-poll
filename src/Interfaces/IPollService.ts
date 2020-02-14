import { IQuestionDetails } from "../Models";

export interface IPollService {
	getPollQuestions(listid: string): Promise<IQuestionDetails[]>;
	getPollQuestionById(listID: string, questionID: string): Promise<IQuestionDetails>;
}