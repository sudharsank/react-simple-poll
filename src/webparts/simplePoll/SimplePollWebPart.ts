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
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { sp } from "@pnp/sp/presets/all";
import * as strings from 'SimplePollWebPartStrings';
import SimplePoll from './components/SimplePoll';
import { ISimplePollProps } from './components/ISimplePollProps';
import SPHelper from '../../Common/SPHelper';
import { IUserInfo } from '../../Models';

export interface ISimplePollWebPartProps {
  pollQuestions: any[];
  MsgAfterSubmission: string;
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
                    // {
                    //   id: "QMultiResponse",
                    //   title: "Multi Response",
                    //   type: CustomCollectionFieldType.boolean,
                    //   required: true,
                    //   defaultValue: false                      
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
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
