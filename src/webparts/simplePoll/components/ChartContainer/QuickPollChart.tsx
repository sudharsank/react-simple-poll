import * as React from 'react';
import { ChartControl, ChartType } from '@pnp/spfx-controls-react/lib/ChartControl';
import { IPollAnalyticsInfo } from '../../../../Models';

export interface IQuickPollChartProps {
  PollAnalytics: IPollAnalyticsInfo;
}

export default class QuickPollChart extends React.Component<IQuickPollChartProps, {}> {
  private charttype: ChartType = null;
  constructor(props: IQuickPollChartProps) {
    super(props);
  }

  public render(): React.ReactElement<IQuickPollChartProps> {
    return (
      <div>
        <div className="ms-Grid" dir="ltr">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-lg12 ms-md12 ms-sm12">
              <div className="ms-textAlignLeft ms-font-m-plus ms-fontWeight-semibold">
                {this.props.PollAnalytics ? this.props.PollAnalytics.Question : ''}
              </div>
            </div>
          </div>
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-lg12 ms-md12 ms-sm12">
              {this.renderChart()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  private renderChart(): JSX.Element {
    const { PollAnalytics } = this.props;
    if (undefined !== this.props.PollAnalytics) {
      this.getChartType();
      return (
        <ChartControl
          loadingtemplate={() => <div>Please wait...</div>}
          type={this.charttype}
          data={{
            labels: PollAnalytics.Labels,
            datasets: [{
              data: PollAnalytics.PollResponse
            }]
          }} />
      );
    }
  }

  private getChartType = () => {
    switch (this.props.PollAnalytics.ChartType.toLocaleLowerCase()) {
      case 'pie':
        this.charttype = ChartType.Pie;
        break;
      case 'doughnut':
        this.charttype = ChartType.Doughnut;
        break;
      case 'polararea':
        this.charttype = ChartType.PolarArea;
        break;
      default:
        this.charttype = ChartType.Doughnut;
        break;
    }
  }

  // componentDidMount(): void {
  //   if (this.props.PollAnalytics != null && undefined !== this.props.PollAnalytics) {
  //     this.renderChart();
  //   }
  // }

  // public componentWillReceiveProps(nextProps: IQuickPollChartProps): void {
  //   if (this.props.PollAnalytics !== nextProps.PollAnalytics) {
  //     this.render();
  //   }
  // }


}