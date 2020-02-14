export interface ISimplePollState {
	PollQuestions: any[]; //IQuestionDetails[];
	UserResponse: any[]; //IResponseDetails[];
	enableSubmit: boolean;
	enableChoices: boolean;
	showOptions: boolean;
	showProgress: boolean;
	showChart: boolean;
	showChartProgress: boolean;
	showMessage: boolean;
	isError: boolean;
	MsgContent: string;
	PollAnalytics: any; //IPollAnalyticsInfo;
	showSubmissionProgress: boolean;
}