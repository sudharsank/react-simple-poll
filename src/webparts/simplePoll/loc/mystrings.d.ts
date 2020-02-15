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
  SuccessfullVoteSubmission: string;
  FailedVoteSubmission: string;
}

declare module 'SimplePollWebPartStrings' {
  const strings: ISimplePollWebPartStrings;
  export = strings;
}
