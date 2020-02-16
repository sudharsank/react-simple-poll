import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, ServiceScope } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneDropdownOptionType,
  PropertyPaneTextField,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { CalloutTriggers } from '@pnp/spfx-property-controls/lib/PropertyFieldHeader';
import { PropertyFieldChoiceGroupWithCallout } from '@pnp/spfx-property-controls/lib/PropertyFieldChoiceGroupWithCallout';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { sp, DateTimeFieldFormatType } from "@pnp/sp/presets/all";
import * as strings from 'SimplePollWebPartStrings';
import SimplePoll from './components/SimplePoll';
import { ISimplePollProps } from './components/ISimplePollProps';
import SPHelper from '../../Common/SPHelper';
import { IUserInfo } from '../../Models';
import { ChartType } from '@pnp/spfx-controls-react/lib/ChartControl';
import PropertyDatePicker from './components/DatePicker/PropertyDatePicker';


export interface ISimplePollWebPartProps {
  pollQuestions: any[];
  MsgAfterSubmission: string;
  BtnSubmitVoteText: string;
  chartType: ChartType;
}

export default class SimplePollWebPart extends BaseClientSideWebPart<ISimplePollWebPartProps> {
  private helper: SPHelper = null;
  private userinfo: IUserInfo = null;
  protected async onInit(): Promise<void> {
    await super.onInit();
    // other init code may be present
    sp.setup(this.context);
    this.helper = new SPHelper();
    this.userinfo = await this.helper.getCurrentUserInfo();
  }

  public render(): void {
    const element: React.ReactElement<ISimplePollProps> = React.createElement(
      SimplePoll,
      {
        pollQuestions: this.properties.pollQuestions,
        SuccessfullVoteSubmissionMsg: this.properties.MsgAfterSubmission,
        BtnSubmitVoteText: this.properties.BtnSubmitVoteText,
        chartType: this.properties.chartType ? this.properties.chartType : ChartType.Doughnut,
        currentUserInfo: this.userinfo,
        openPropertyPane: this.openPropertyPane
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get disableReactivePropertyChanges() {
    return false;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private openPropertyPane = (): void => {
    this.context.propertyPane.open();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyFieldCollectionData("pollQuestions", {
                  key: "pollQuestions",
                  label: strings.PollQuestionsLabel,
                  panelHeader: strings.PollQuestionsPanelHeader,
                  manageBtnLabel: strings.PollQuestionsManageButton,
                  enableSorting: true,
                  value: this.properties.pollQuestions,
                  fields: [
                    {
                      id: "QTitle",
                      title: "Question Title",
                      type: CustomCollectionFieldType.custom,
                      required: true,
                      onCustomRender: (field, value, onUpdate, item, itemId) => {
                        return (
                          React.createElement("div", null,
                            React.createElement("textarea",
                              {
                                style: { width: "250px", height: "70px" },
                                placeholder: "Question Title",
                                key: itemId,
                                value: value,
                                onChange: (event: React.FormEvent<HTMLTextAreaElement>) => {
                                  onUpdate(field.id, event.currentTarget.value);
                                },
                              })
                          )
                        );
                      }
                    },
                    {
                      id: "QOptions",
                      title: "Choices",
                      type: CustomCollectionFieldType.custom,
                      required: true,
                      onCustomRender: (field, value, onUpdate, item, itemId) => {
                        return (
                          React.createElement("div", null,
                            React.createElement("textarea",
                              {
                                style: { width: "250px", height: "70px" },
                                placeholder: "Choices separated by comma",
                                key: itemId,
                                value: value,
                                onChange: (event: React.FormEvent<HTMLTextAreaElement>) => {
                                  onUpdate(field.id, event.currentTarget.value);
                                },
                              })
                          )
                        );
                      }
                    },
                    {
                      id: "QMultiChoice",
                      title: "Multi Selection",
                      type: CustomCollectionFieldType.boolean,
                      defaultValue: false
                    }
                    // {
                    //   id: "QUseDate",
                    //   title: "Use Date",
                    //   type: CustomCollectionFieldType.boolean,
                    //   required: true,
                    //   defaultValue: false
                    // },
                    // {
                    //   id: "QStartDate",
                    //   title: "StartDate",
                    //   type: CustomCollectionFieldType.custom,
                    //   required: true,
                    //   onCustomRender: (field, value, onUpdate, item, itemId) => {
                    //     return (
                    //       React.createElement(PropertyDatePicker, {
                    //         key: itemId,
                    //         value: value,
                    //         onchange: (datevalue: Date) => {
                    //           onUpdate(field.id, datevalue)
                    //         }
                    //       })
                    //     );
                    //   }
                    // },
                    // {
                    //   id: "QEndDate",
                    //   title: "EndDate",
                    //   type: CustomCollectionFieldType.custom,
                    //   required: true,
                    //   onCustomRender: (field, value, onUpdate, item, itemId) => {
                    //     return (
                    //       React.createElement(PropertyDatePicker, {
                    //         key: itemId,
                    //         value: value,
                    //         onchange: (datevalue: Date) => {
                    //           onUpdate(field.id, datevalue)
                    //         }
                    //       })
                    //     );
                    //   }
                    // }
                  ],
                  disabled: false
                }),
                PropertyPaneTextField('MsgAfterSubmission', {
                  label: strings.MsgAfterSubmissionLabel,
                  description: strings.MsgAfterSubmissionDescription,
                  maxLength: 150,
                  multiline: true,
                  rows: 3,
                  resizable: false,
                  placeholder: strings.MsgAfterSubmissionPlaceholder,
                  value: this.properties.MsgAfterSubmission
                }),
                PropertyPaneTextField('BtnSubmitVoteText', {
                  label: strings.BtnSumbitVoteLabel,
                  description: strings.BtnSumbitVoteDescription,
                  maxLength: 50,
                  multiline: false,
                  resizable: false,
                  placeholder: strings.BtnSumbitVotePlaceholder,
                  value: this.properties.BtnSubmitVoteText
                }),
                PropertyFieldChoiceGroupWithCallout('chartType', {
                  calloutContent: React.createElement('div', {}, strings.ChartFieldCalloutText),
                  calloutTrigger: CalloutTriggers.Hover,
                  key: 'choice_charttype',
                  label: strings.ChartFieldLabel,
                  options: [
                    // {
                    //   key: 'bar',
                    //   text: 'Bar',
                    //   checked: this.properties.chartType === 'bar',
                    //   //iconProps: { officeFabricIconFontName: 'Add' }
                    // }, 
                    {
                      key: 'pie',
                      text: 'Pie',
                      checked: this.properties.chartType === ChartType.Pie,
                      //iconProps: { officeFabricIconFontName: 'PieSingle' }
                    }, {
                      key: 'doughnut',
                      text: 'Doughnut',
                      checked: this.properties.chartType === ChartType.Doughnut,
                      //iconProps: { officeFabricIconFontName: 'DonutChart' }
                    }, {
                      key: 'polarArea',
                      text: 'PolarArea',
                      checked: this.properties.chartType === ChartType.PolarArea,
                      //iconProps: { officeFabricIconFontName: 'DonutChart' }
                    }]
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
