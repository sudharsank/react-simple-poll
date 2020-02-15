import { IUserInfo } from "../../../Models";

export interface ISimplePollProps {
  pollQuestions: any[];
  currentUserInfo: IUserInfo;
  openPropertyPane: () => void;
}
