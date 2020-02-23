declare interface ISimplePollWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  PlaceholderIconText: string;
  PlaceholderDescription: string;
  PlaceholderButtonLabel: string;
  QuestionLoadingText: string;
  SubmissionLoadingText: string;
  PlsWait: string;
  PollQuestionsLabel: string;
  PollQuestionsPanelHeader: string;
  PollQuestionsManageButton: string;
  MsgAfterSubmissionLabel: string;
  MsgAfterSubmissionDescription: string;
  MsgAfterSubmissionPlaceholder: string;
  ResponseMsgToUserLabel: string;
  ResponseMsgToUserDescription: string;
  ResponseMsgToUserPlaceholder: string;
  DefaultResponseMsgToUser: string;
  SuccessfullVoteSubmission: string;
  FailedVoteSubmission: string;
  BtnSumbitVote: string;
  BtnSumbitVoteLabel: string;
  BtnSumbitVoteDescription: string;
  BtnSumbitVotePlaceholder: string;
  ChartFieldLabel: string;
  ChartFieldCalloutText:string;

  Q_Title_Title: string;
  Q_Title_Placeholder: string;
  Q_Options_Title: string;
  Q_Options_Placeholder: string;
  MultiChoice_Title: string;
}

declare module 'SimplePollWebPartStrings' {
  const strings: ISimplePollWebPartStrings;
  export = strings;
}
