import React, { PropTypes } from 'react';

class ManagementReportSection extends React.Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  render() {
    const { reports } = this.props;

    if (reports.loginNum === undefined) {
      reports.loginNum = '';
    }
    if (reports.onlineRate === undefined) {
      reports.onlineRate = '';
    }
    if (reports.onlineTime === undefined) {
      reports.onlineTime = '';
    }

    if (reports.jobNum === undefined) {
      reports.jobNum = '';
    }

    return (
      <div className="report">
        <ul>
          <li>
            <div className="data">
              {
                (reports.loginNum - 0) > 0 && this.context.intl.formatMessage({ id: 'app.management.report.loginNum' }, {
                  num: reports.loginNum.toString(),
                })
              }
              {
                (reports.loginNum - 0) === 0 && '-'
              }
            </div>
            <div className="desc">{this.context.intl.messages['app.management.report.loginTitle']}</div>
          </li>
          <li>
            { (reports.onlineRate - 0) > 0 && <div className="data">{reports.onlineRate}%</div> }
            {
              (reports.onlineRate - 0) === 0 && '-'
            }
            <div className="desc">{this.context.intl.messages['app.management.report.onlineRateTitle']}</div>
          </li>
          {
            !__platform__.dingtalk ?
              <li>
                <div className="data">
                  {(reports.onlineTime - 0) > 0 && this.context.intl.formatMessage({ id: 'app.management.report.onlineTime' }, {
                    num: reports.onlineTime.toString(),
                  })}
                  {
                    (reports.onlineTime - 0) === 0 && '-'
                  }
                </div>
                <div className="desc">{this.context.intl.messages['app.management.report.onlineTimeTitle']}</div>
              </li> : null
          }
        </ul>
        <div className="total">
          { reports.message
            /* {this.context.intl.formatMessage({ id: 'app.management.report.total' }, {
            num: reports.jobNum.toString(),
          })} */}
        </div>
      </div>
    );
  }
}

ManagementReportSection.propTypes = {
  reports: React.PropTypes.object,
};

export default ManagementReportSection;
