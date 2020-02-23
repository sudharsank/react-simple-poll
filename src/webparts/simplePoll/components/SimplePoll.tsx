import * as React from 'react';
import styles from './SimplePoll.module.scss';
import * as strings from 'SimplePollWebPartStrings';
import { escape } from '@microsoft/sp-lodash-subset';
import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { ISimplePollProps } from './ISimplePollProps';
import { ISimplePollState } from './ISimplePollState';
import OptionsContainer from './OptionsContainer/OptionsContainer';
import MessageContainer from './MessageContainer/MessageContainer';
import QuickPollChart from './ChartContainer/QuickPollChart';
import { IQuestionDetails, IResponseDetails, IPollAnalyticsInfo } from '../../../Models';
import SPHelper from '../../../Common/SPHelper';
import { MessageScope } from '../../../Common/enumHelper';
import * as _ from 'lodash';

export default class SimplePoll extends React.Component<ISimplePollProps, ISimplePollState> {
  private helper: SPHelper = null;
  private disQuestionId: string;
  private currentUserResponse: JSX.Element = null;
  constructor(props: ISimplePollProps) {
    super(props);
    this.state = {
      listExists: false,
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
      showSubmissionProgress: false,
      currentPollResponse: ""
    };
    this.helper = new SPHelper();
  }

  public componentDidMount = () => {
    this.checkAndCreateList();
  }

  public componentDidUpdate = (prevProps: ISimplePollProps) => {
    if (prevProps.pollQuestions !== this.props.pollQuestions) this.getQuestions(this.props.pollQuestions);
    if (prevProps.chartType !== this.props.chartType) {
      let newPollAnalytics: IPollAnalyticsInfo = this.state.PollAnalytics;
      newPollAnalytics.ChartType = this.props.chartType;
      this.setState({
        PollAnalytics: newPollAnalytics
      }, this.bindResponseAnalytics);
    }
  }

  private async checkAndCreateList() {
    this.helper = new SPHelper();
    let listCreated = await this.helper.checkListExists();
    if (listCreated) {
      this.setState({ listExists: true }, () => {
        this.getQuestions();
      });
    }
  }

  // public componentWillReceiveProps = (nextProps: ISimplePollProps) => {
  //   if (this.props.pollQuestions != nextProps.pollQuestions) {
  //     this.getQuestions(nextProps.pollQuestions);
  //   }
  //   if (this.props.chartType != nextProps.chartType) {
  //     let newPollAnalytics: IPollAnalyticsInfo = this.state.PollAnalytics;
  //     newPollAnalytics.ChartType = nextProps.chartType;
  //     this.setState({
  //       PollAnalytics: newPollAnalytics
  //     }, this.bindResponseAnalytics);
  //   }
  // }

  private getQuestions = (questions?: any[]) => {
    let pquestions: IQuestionDetails[] = [];
    let tmpQuestions: any[] = (questions) ? questions : (this.props.pollQuestions) ? this.props.pollQuestions : [];
    if (tmpQuestions && tmpQuestions.length > 0) {
      tmpQuestions.map((question) => {
        pquestions.push({
          Id: question.uniqueId,
          DisplayName: question.QTitle,
          Choices: question.QOptions,
          UseDate: question.QUseDate,
          StartDate: new Date(question.QStartDate),
          EndDate: new Date(question.QEndDate),
          MultiChoice: question.QMultiChoice
        });
      });
    }
    this.disQuestionId = (pquestions && pquestions.length > 0) ? pquestions[0].Id : '';
    this.setState({ PollQuestions: pquestions, displayQuestionId: this.disQuestionId }, this.bindPolls);
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
    }, this.getAllUsersResponse);
  }

  private _onChange = (ev: any, option: any, isMultiSel: boolean): void => {
    let prevUserResponse = this.state.UserResponse;
    let userresponse: IResponseDetails;
    userresponse = {
      PollQuestionId: this.state.PollQuestions[0].Id,
      PollQuestion: this.state.PollQuestions[0].DisplayName,
      PollResponse: !isMultiSel ? option.key : '',
      UserID: this.props.currentUserInfo.ID,
      UserDisplayName: this.props.currentUserInfo.DisplayName,
      UserLoginName: this.props.currentUserInfo.LoginName,
      PollMultiResponse: isMultiSel ? option.key : [],
      IsMulti: isMultiSel
    };
    if (prevUserResponse.length > 0) {
      let filRes = this.getUserResponse(prevUserResponse);
      if (filRes.length > 0) {
        !isMultiSel ? filRes[0].PollResponse = option.key : filRes[0].PollMultiResponse = option.key;
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
        MsgContent: (this.props.SuccessfullVoteSubmissionMsg && this.props.SuccessfullVoteSubmissionMsg.trim()) ? this.props.SuccessfullVoteSubmissionMsg.trim() : strings.SuccessfullVoteSubmission,
        showChartProgress: true
      }, this.getAllUsersResponse);
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
    var filRes = _.filter(usersResponse, (o) => { return o.UserID == this.props.currentUserInfo.ID; });
    if (filRes.length > 0) {
      this.setState({
        showChartProgress: true,
        showChart: true,
        showOptions: false,
        showProgress: false,
        UserResponse: usersResponse,
        currentPollResponse: usersResponse[0].Response ? usersResponse[0].Response : usersResponse[0].MultiResponse.join(',')
      }, this.bindResponseAnalytics);
    } else {
      this.setState({
        showProgress: false,
        showOptions: true,
        showChartProgress: false,
        showChart: false
      });
    }
  }

  private bindResponseAnalytics = () => {
    const { PollQuestions } = this.state;
    let tmpUserResponse: any = this.state.UserResponse;
    if (tmpUserResponse && tmpUserResponse.length > 0) {
      var tempData: any;
      let qChoices: string[] = PollQuestions[0].Choices.split(',');
      var finalData = [];
      if (!PollQuestions[0].MultiChoice) {
        tempData = _.countBy(tmpUserResponse, 'Response');
      } else {
        var data = [];
        tmpUserResponse.map((res: any) => {
          if (res.MultiResponse && res.MultiResponse.length > 0) {
            res.MultiResponse.map((finres: any) => {
              data.push({
                "UserID": res.UserID,
                "Response": finres
              });
            });
          }
        });
        tempData = _.countBy(data, 'Response');
      }
      qChoices.map((label) => {
        if (tempData[label] == undefined) {
          finalData.push(0);
        } else finalData.push(tempData[label]);
      });
      var pollAnalytics: IPollAnalyticsInfo;
      pollAnalytics = {
        ChartType: this.props.chartType,
        Labels: qChoices,
        Question: PollQuestions[0].DisplayName,
        PollResponse: finalData
      };
      this.setState({
        showProgress: false,
        showOptions: false,
        showChartProgress: false,
        showChart: true,
        PollAnalytics: pollAnalytics
      });
    }
  }

  private getUserResponse(UserResponses: IResponseDetails[]): IResponseDetails[] {
    let retUserResponse: IResponseDetails[];
    retUserResponse = UserResponses.filter((res) => { return res.UserID == this.props.currentUserInfo.ID; });
    return retUserResponse;
  }

  public render(): React.ReactElement<ISimplePollProps> {
    const { pollQuestions, BtnSubmitVoteText, ResponseMsgToUser } = this.props;
    const { showProgress, enableChoices, showSubmissionProgress, showChartProgress, PollQuestions, showMessage, MsgContent, isError,
      showOptions, showChart, PollAnalytics, currentPollResponse, enableSubmit, listExists } = this.state;
    const showConfig: boolean = (!pollQuestions || pollQuestions.length <= 0 && (!PollQuestions || PollQuestions.length <= 0)) ? true : false;
    let userResponseCaption: string = (ResponseMsgToUser && ResponseMsgToUser.trim()) ? ResponseMsgToUser.trim() : strings.DefaultResponseMsgToUser;
    let submitButtonText: string = (BtnSubmitVoteText && BtnSubmitVoteText.trim()) ? BtnSubmitVoteText.trim() : strings.BtnSumbitVote;
    return (
      <div className={styles.simplePoll}>
        {!listExists ? (
          <ProgressIndicator label={strings.ListCreationText} description={strings.PlsWait} />
        ) : (
            <>
              {showConfig &&
                <Placeholder iconName='Edit'
                  iconText={strings.PlaceholderIconText}
                  description={strings.PlaceholderDescription}
                  buttonLabel={strings.PlaceholderButtonLabel}
                  onConfigure={this.props.openPropertyPane} />
              }
              {showProgress && !showChart &&
                <ProgressIndicator label={strings.QuestionLoadingText} description={strings.PlsWait} />
              }
              {PollQuestions && PollQuestions.length > 0 && showOptions &&
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
                        <OptionsContainer disabled={!enableChoices} multiSelect={PollQuestions[0].MultiChoice}
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
                        <PrimaryButton disabled={!enableSubmit} text={submitButtonText}
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
                <>
                  <QuickPollChart PollAnalytics={PollAnalytics} />
                  <MessageContainer MessageScope={MessageScope.Info} Message={`${userResponseCaption}: ${currentPollResponse}`} />
                </>
              }
            </>
          )
        }
      </div>
    );
  }
}
