import * as React from 'react';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { IOptionsContainerProps } from './IOptionsContainerProps';

export default class OptionsContainer extends React.Component<IOptionsContainerProps, {}> {
  constructor(props: IOptionsContainerProps) {
    super(props);
  }

  public render(): JSX.Element {
    const { disabled, selectedKey, label, options, onChange } = this.props;
    return (
      <div>
        <ChoiceGroup disabled={disabled}
          //selectedKey={this._getSelectedKey()}
          options={this.onRenderChoiceOptions()} required={true} label="Pick one"
          //onChange={this._onChange} 
          />
      </div>
    )
  }

  private onRenderChoiceOptions(): IChoiceGroupOption[] {
    let choices: IChoiceGroupOption[] = [];
    let tempChoices: string[] = [];
    if (this.props.options.indexOf(',') >= 0) {
      tempChoices = this.props.options.split(',');
    } else tempChoices.push(this.props.options);
    if (tempChoices.length > 0) {
      tempChoices.map((choice: any) => {
        choices.push({
          key: choice,
          text: choice
        });
      });
    } else {
      choices.push({
        key: '0',
        text: "Sorry, no choices found",
        disabled: true,
      });
    }
    return choices;
  }

  private _getSelectedKey = (): string => {
    return this.props.selectedKey();
  }

  private _onChange = (ev: React.FormEvent<HTMLInputElement>, option: any): void => {
    this.props.onChange(ev, option);
  }

}