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
import MessageContainer from './MessageContainer/MessageContainer';
import { IQuestionDetails, IResponseDetails } from '../../../Models';
import SPHelper from '../../../Common/SPHelper';
import { MessageScope } from '../../../Common/enumHelper';
import * as _ from 'lodash';

export default class SimplePoll extends React.Component<ISimplePollProps, ISimplePollState> {
  private helper: SPHelper = null;
  private disQuestionId: string;
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
    setTimeout(() => {
      this.bindPolls();
    }, 500);
  }

  public componentWillReceiveProps = (nextProps: ISimplePollProps): boolean => {
    if (this.props.pollQuestions != nextProps.pollQuestions) {
      this.getQuestions(nextProps.pollQuestions);
      setTimeout(() => {
        this.bindPolls();
      }, 500);
      return true;
    }
  }

  private getQuestions = (questions?: any[]) => {
    let pquestions: IQuestionDetails[] = [];
    let tmpQuestions: any[] = (questions) ? questions : (this.props.pollQuestions) ? this.props.pollQuestions : [];
    if (tmpQuestions && tmpQuestions.length > 0) {
      tmpQuestions.map((question) => {
        pquestions.push({
          Id: question.uniqueId,
          DisplayName: question.QTitle,
          Choices: question.QOptions
          //MultiResponse: question.QMultiResponse
        });
      });
    }
    this.disQuestionId = (pquestions && pquestions.length > 0) ? pquestions[0].Id : '';
    this.setState({ PollQuestions: pquestions, displayQuestionId: this.disQuestionId });
  }

  private bindPolls = () => {
    this.setState({
      showProgress: (this.state.PollQuestions.length > 0) ? true : false,
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
    this.getAllUsersResponse();
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
    try {
      await this.helper.submitResponse(curUserRes[0]);
      this.setState({
        ...this.state,
        showSubmissionProgress: false,
        showMessage: true,
        isError: false,
        MsgContent: (this.props.SuccessfullVoteSubmissionMsg) ? this.props.SuccessfullVoteSubmissionMsg : strings.SuccessfullVoteSubmission,
        showChartProgress: true
      });
      this.getAllUsersResponse();
      // setTimeout(() => {

      // }, 1000);
    } catch (err) {
      console.log(err);
      this.setState({
        ...this.state,
        enableSubmit: true,
        enableChoices: true,
        showSubmissionProgress: false,
        showMessage: true,
        isError: true,
        MsgContent: strings.FailedVoteSubmission
      });
    }
  }

  private getAllUsersResponse = async () => {
    let usersResponse = await this.helper.getPollResponse((this.state.displayQuestionId) ? this.state.displayQuestionId : this.disQuestionId);
    console.log(usersResponse);
    var filRes = _.filter(usersResponse, (o) => { return o.UserID == this.props.currentUserInfo.ID; });
    if (filRes.length > 0) {
      this.setState({
        showChartProgress: true,
        showChart: true,
        showOptions: false,
        showProgress: false
      });
    } else {
      this.setState({
        showProgress: false,
        showOptions: true,
        showChartProgress: false,
        showChart: false
      });
    }
  }

  private getUserResponse(UserResponses: IResponseDetails[]): IResponseDetails[] {
    let retUserResponse: IResponseDetails[];
    retUserResponse = UserResponses.filter((res) => { return res.UserID == this.props.currentUserInfo.ID });
    return retUserResponse;
  }

  public render(): React.ReactElement<ISimplePollProps> {
    //const { pollQuestions } = this.props;
    const { showProgress, enableChoices, showSubmissionProgress, showChartProgress, PollQuestions, showMessage, MsgContent, isError,
      showOptions, showChart } = this.state;
    return (
      <div className={styles.simplePoll}>
        {(this.props.pollQuestions.length <= 0 && PollQuestions.length <= 0) &&
          <Placeholder iconName='Edit'
            iconText={strings.PlaceholderIconText}
            description={strings.PlaceholderDescription}
            buttonLabel={strings.PlaceholderButtonLabel}
            onConfigure={this.props.openPropertyPane} />
        }
        {showProgress && !showChart &&
          <ProgressIndicator label={strings.QuestionLoadingText} description={strings.PlsWait} />
        }
        {PollQuestions.length > 0 && showOptions &&
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
        {showMessage && MsgContent &&
          <MessageContainer MessageScope={(isError) ? MessageScope.Failure : MessageScope.Success} Message={MsgContent} />
        }
        {showChartProgress && !showChart &&
          <ProgressIndicator label="Loading the Poll analytics" description="Getting all the responses..." />
        }
        {showChart &&
          // <QuickPollChart PollAnalytics={PollAnalytics} />
          <div>Chart</div>
        }
      </div>
    );
  }
}
