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
import PollService from '../../DataProviders/PollService';
import { IPollService } from '../../Interfaces/IPollService';

export interface ISimplePollWebPartProps {
  pollQuestions: any[];
}

export default class SimplePollWebPart extends BaseClientSideWebPart<ISimplePollWebPartProps> {
  pollservice: IPollService;

  protected async onInit(): Promise<void> {
    await super.onInit();
    let _serviceScope: ServiceScope;
    _serviceScope = this.context.serviceScope;

    _serviceScope.whenFinished((): void => {
      this.pollservice = _serviceScope.consume(PollService.serviceKey as any) as IPollService;
    });
    // other init code may be present
    sp.setup(this.context);
  }

  public render(): void {
    const element: React.ReactElement<ISimplePollProps> = React.createElement(
      SimplePoll,
      {
        pollQuestions: this.properties.pollQuestions,
        userLoginName: this.context.pageContext.user.loginName,
        userDisplayName: this.context.pageContext.user.displayName,
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
                    }
                  ],
                  disabled: false
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
