import React, { PropTypes } from 'react';
import ManagementReportSection from './section-report';
import ManagementRequiredSection from './section-required';
import ManagementExamSection from './section-exam';

class ManagementSection extends React.Component {
  static contextTypes = {
    intl: PropTypes.object,
    router: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.renderSection = ::this.renderSection;
    this.getTotal = ::this.getTotal;
    this.onMore = ::this.onMore;
  }

  onMore() {
    const { type, total } = this.props;
    const router = this.context.router;
    const reportUrl = total === 0 ? '/management/report/guid' : '/report/dept?type=login';

    switch (type) {
      case 'report':
        router.push(router.createPath(reportUrl));
        break;
      case 'required':
        router.push(router.createPath('/distribution/required'));
        break;
      case 'exam':
        router.push(router.createPath('management/exams'));
        break;
      default:
        break;
    }
  }

  getTotal() {
    const { type, total } = this.props;
    return this.context.intl.formatMessage({ id: `app.management.total.${type}` }, {
      num: total.toString(),
    });
  }

  renderSection() {
    const { type, items, reports } = this.props;
    switch (type) {
      case 'report':
        return <ManagementReportSection reports={reports} />;
      case 'required':
        return <ManagementRequiredSection items={items} />;
      case 'exam':
        return <ManagementExamSection items={items} />;
      default:
        return null;
    }
  }

  render() {
    const { type } = this.props;
    return (
      <div className="section">
        <div className="section-header" onClick={this.onMore}>
          <div className="title">{this.context.intl.messages[`app.management.section.${type}`]}</div>
          <div className="more">{this.getTotal()}</div>
        </div>
        <div className="section-body">
          {this.renderSection()}
        </div>
      </div>
    );
  }
}

ManagementSection.propTypes = {
  type: React.PropTypes.string,
  total: React.PropTypes.number,
  items: React.PropTypes.array,
  reports: React.PropTypes.object,
};

export default ManagementSection;
