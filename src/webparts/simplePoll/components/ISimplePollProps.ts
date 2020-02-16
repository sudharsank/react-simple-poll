import { IUserInfo } from "../../../Models";
import { ChartType } from "@pnp/spfx-controls-react/lib/ChartControl";

export interface ISimplePollProps {
  pollQuestions: any[];
  SuccessfullVoteSubmissionMsg: string;
  BtnSubmitVoteText: string;
  chartType: ChartType;
  currentUserInfo: IUserInfo;
  openPropertyPane: () => void;
}
