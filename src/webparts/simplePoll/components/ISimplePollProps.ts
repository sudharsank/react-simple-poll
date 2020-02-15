import { IUserInfo } from "../../../Models";

export interface ISimplePollProps {
  pollQuestions: any[];
  SuccessfullVoteSubmissionMsg: string;
  currentUserInfo: IUserInfo;
  openPropertyPane: () => void;
}
