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
}

declare module 'SimplePollWebPartStrings' {
  const strings: ISimplePollWebPartStrings;
  export = strings;
}
