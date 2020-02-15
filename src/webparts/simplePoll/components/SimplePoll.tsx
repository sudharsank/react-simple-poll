import * as React from 'react';
import styles from './SimplePoll.module.scss';
import * as strings from 'SimplePollWebPartStrings';
import { escape } from '@microsoft/sp-lodash-subset';
import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { DefaultButton, PrimaryButton, ButtonType, IButtonProps, Button } from 'office-ui-fabric-react/lib/Button';
import { ISimplePollProps } from './ISimplePollProps';
import { ISimplePollState } from './ISimplePollState';
import OptionsContainer from './OptionsContainer/OptionsContainer';
import { IQuestionDetails, IResponseDetails } from '../../../Models';
import SPHelper from '../../../Common/SPHelper';

export default class SimplePoll extends React.Component<ISimplePollProps, ISimplePollState> {
  private helper: SPHelper = null;
  constructor(props: ISimplePollProps) {
    super(props);
    this.state = {
      PollQuestions: [],
      UserResponse: [],
      displayQuestionId: "",
      enableSubmit: true,
      enableChoices: true,
      showOptions: false,
      showProgress: false,
      showChart: false,
      showChartProgress: false,
      PollAnalytics: undefined,
      showMessage: false,
      isError: false,
      MsgContent: "",
      showSubmissionProgress: false
    }
    this.helper = new SPHelper();
  }

  public componentDidMount = () => {
    this.getQuestions();
    this.bindPolls();
  }

  public componentWillReceiveProps = (nextProps: ISimplePollProps): boolean => {
    if (this.props.pollQuestions != nextProps.pollQuestions) {
      this.getQuestions(nextProps.pollQuestions);
      return true;
    }
  }

  private getQuestions = (questions?: any[]): void => {
    let pquestions: IQuestionDetails[] = [];
    let tmpQuestions: any[] = (questions) ? questions : this.props.pollQuestions;
    if (tmpQuestions && tmpQuestions.length > 0) {
      tmpQuestions.map((question) => {
        pquestions.push({
          Id: question.uniqueId,
          DisplayName: question.QTitle,
          Choices: question.QOptions
        });
      });
    }
    this.setState({ PollQuestions: pquestions, displayQuestionId: pquestions[0].Id });
  }

  private bindPolls = () => {
    this.setState({
      showProgress: false,
      enableSubmit: true,
      enableChoices: true,
      showOptions: false,
      showChart: false,
      showChartProgress: false,
      PollAnalytics: undefined,
      showMessage: false,
      isError: false,
      MsgContent: "",
      showSubmissionProgress: false
    });
    //this.getAllUsersResponse();
  }

  private _onChange = (ev: React.FormEvent<HTMLInputElement>, option: any): void => {
    let prevUserResponse = this.state.UserResponse;
    let userresponse: IResponseDetails;
    userresponse = {
      PollQuestionId: this.state.PollQuestions[0].Id,
      PollQuestion: this.state.PollQuestions[0].DisplayName,
      PollResponse: option.key,
      UserID: this.props.currentUserInfo.ID,
      UserDisplayName: this.props.currentUserInfo.DisplayName,
      UserLoginName: this.props.currentUserInfo.LoginName,
      PollMultiResponse: []
    };
    if (prevUserResponse.length > 0) {
      let filRes = this.getUserResponse(prevUserResponse);
      if (filRes.length > 0) {
        filRes[0].PollResponse = option.key;
      } else {
        prevUserResponse.push(userresponse);
      }
    } else {
      prevUserResponse.push(userresponse);
    }
    this.setState({
      ...this.state,
      UserResponse: prevUserResponse
    });
  }

  private _getSelectedKey = (): string => {
    let selKey: string = "";
    if (this.state.UserResponse && this.state.UserResponse.length > 0) {
      var userResponses = this.state.UserResponse;
      var userRes = this.getUserResponse(userResponses);
      if (userRes.length > 0) {
        selKey = userRes[0].PollResponse;
      }
    }
    return selKey;
  }

  private _submitVote = async () => {
    this.setState({
      ...this.state,
      enableSubmit: false,
      enableChoices: false,
      showSubmissionProgress: true
    });
    var curUserRes = this.getUserResponse(this.state.UserResponse);
    await this.helper.submitResponse(curUserRes[0]);
  }

  private getUserResponse(UserResponses: IResponseDetails[]): IResponseDetails[] {
    let retUserResponse: IResponseDetails[];
    retUserResponse = UserResponses.filter((res) => { return res.UserID == this.props.currentUserInfo.ID });
    return retUserResponse;
  }

  public render(): React.ReactElement<ISimplePollProps> {
    //const { pollQuestions } = this.props;
    const { showProgress, enableChoices, showSubmissionProgress, showChartProgress, PollQuestions } = this.state;
    return (
      <div className={styles.simplePoll}>
        {PollQuestions.length <= 0 &&
          <Placeholder iconName='Edit'
            iconText={strings.PlaceholderIconText}
            description={strings.PlaceholderDescription}
            buttonLabel={strings.PlaceholderButtonLabel}
            onConfigure={this.props.openPropertyPane} />
        }
        {showProgress &&
          <ProgressIndicator label={strings.QuestionLoadingText} description={strings.PlsWait} />
        }
        {PollQuestions.length > 0 &&
          <div className="ms-Grid" dir="ltr">
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-lg12 ms-md12 ms-sm12">
                <div className="ms-textAlignLeft ms-font-m-plus ms-fontWeight-semibold">
                  {PollQuestions[0].DisplayName}
                </div>
              </div>
            </div>
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-lg12 ms-md12 ms-sm12">
                <div className="ms-textAlignLeft ms-font-m-plus ms-fontWeight-semibold">
                  <OptionsContainer disabled={!enableChoices}
                    selectedKey={this._getSelectedKey}
                    options={PollQuestions[0].Choices}
                    label="Pick One"
                    onChange={this._onChange}
                  />
                </div>
              </div>
            </div>
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-lg12 ms-md12 ms-sm12">
                <div className="ms-textAlignCenter ms-font-m-plus ms-fontWeight-semibold">
                  <PrimaryButton disabled={!this.state.enableSubmit} text="Submit Vote"
                    onClick={this._submitVote.bind(this)} />
                </div>
              </div>
            </div>
            {showSubmissionProgress && !showChartProgress &&
              <ProgressIndicator label={strings.SubmissionLoadingText} description={strings.PlsWait} />
            }
          </div>
        }
      </div>
    );
  }
}
