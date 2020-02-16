import * as React from 'react';
import DatePicker from "react-datepicker";

export interface IPropertyDatePickerProps {
    onchange: (date: Date) => void;
    value: any;
}

export interface IPropertyDatePickerState {
    selectedDate: Date;
}

export default class PropertyDatePicker extends React.Component<IPropertyDatePickerProps, IPropertyDatePickerState> {

    constructor(props: IPropertyDatePickerProps) {
        super(props);
        this.state = {
            selectedDate: new Date()
        };
    }

    private setSelectedDate = (date: Date) => {
        this.setState({
            selectedDate: date
        });
        this.props.onchange(date);
    }

    public componentWillReceiveProps = (nextProps: IPropertyDatePickerProps) => {
        if (this.props.value !== nextProps.value) {
            this.setSelectedDate(nextProps.value);
        }
    }

    public render(): JSX.Element {
        const value: Date = (this.props.value) ? new Date(this.props.value) : this.state.selectedDate;
        return (
            <DatePicker
                showPopperArrow={false}
                selected={value}
                onChange={date => this.setSelectedDate(date)}
                dateFormat="MM/dd/yyyy"
            />
        );
    }
}