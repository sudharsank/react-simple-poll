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

export default class SimplePoll extends React.Component<ISimplePollProps, ISimplePollState> {

  constructor(props: ISimplePollProps) {
    super(props);
    this.state = {
      PollQuestions: [],
      UserResponse: [],
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
  }

  public componentDidMount = () => {
    if (this.props.pollQuestions.length > 0) {
      this.setState({
        showProgress: false
      });
    }
  }

  // private _onChange = (ev: React.FormEvent<HTMLInputElement>, option: any): void => {
  //   let prevUserResponse = this.state.UserResponse;
  //   let userresponse: any;
  //   userresponse = {
  //     PollQuestion: this.state.PollQuestions[0].DisplayName,
  //     PollQuestionIN: this.state.PollQuestions[0].InternalName,
  //     PollResponse: option.key,
  //     UserID: this.props.currentContext.pageContext.user.loginName,
  //     UserName: this.props.currentContext.pageContext.user.displayName
  //   };
  //   if (prevUserResponse.length > 0) {
  //     let filRes = this.getUserResponse(prevUserResponse);
  //     //prevUserResponse.filter((response) => { return response.UserID == this.props.currentContext.pageContext.user.loginName });
  //     if (filRes.length > 0) {
  //       filRes[0].PollResponse = option.key;
  //     } else {
  //       prevUserResponse.push(userresponse);
  //     }
  //   } else {
  //     prevUserResponse.push(userresponse);
  //   }
  //   this.setState({
  //     ...this.state,
  //     UserResponse: prevUserResponse
  //   });
  // }

  private _submitVote = (): void => {
    this.setState({
      ...this.state,
      enableSubmit: false,
      enableChoices: false,
      showSubmissionProgress: true
    });
  }

  public render(): React.ReactElement<ISimplePollProps> {
    const { pollQuestions } = this.props;
    const { showProgress, enableChoices, showSubmissionProgress, showChartProgress } = this.state;
    return (
      <div className={styles.simplePoll}>
        {pollQuestions.length <= 0 &&
          <Placeholder iconName='Edit'
            iconText={strings.PlaceholderIconText}
            description={strings.PlaceholderDescription}
            buttonLabel={strings.PlaceholderButtonLabel}
            onConfigure={this.props.openPropertyPane} />
        }
        {showProgress &&
          <ProgressIndicator label={strings.QuestionLoadingText} description={strings.PlsWait} />
        }
        {pollQuestions.length > 0 &&
          <div className="ms-Grid" dir="ltr">
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-lg12 ms-md12 ms-sm12">
                <div className="ms-textAlignCenter ms-font-m-plus ms-fontWeight-semibold">
                  {pollQuestions[0].QTitle}
                </div>
              </div>
            </div>
            <div className="ms-Grid-row">
              <div className="ms-Grid-col ms-lg12 ms-md12 ms-sm12">
                <div className="ms-textAlignLeft ms-font-m-plus ms-fontWeight-semibold">
                  <OptionsContainer disabled={!enableChoices}
                    //selectedKey={this._getSelectedKey}
                    options={pollQuestions[0].QOptions}
                    label="Pick One"
                  //onChange={this._onChange} 
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
