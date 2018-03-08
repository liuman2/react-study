import React, { PropTypes } from 'react';
import { Link } from 'react-router';

class ManagementExamSection extends React.Component {
  static contextTypes = {
    intl: PropTypes.object,
    router: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.renderEmpty = ::this.renderEmpty;
  }

  renderEmpty() {
    return (
      <div className="empty">
        <div className="empty-title">
          {this.context.intl.messages['app.management.section.examEmptyMsg']}
        </div>
        <Link to="/management/exam/guid">
          {this.context.intl.messages['app.management.section.examdSend']}
        </Link>
      </div>
    );
  }

  renderList() {
    const { items } = this.props;
    return (
      <ul className="exam-list">
        {
          items.map(item => (
            <li key={`${item.task_id}${item.plan_id}${item.quiz_id}`} onClick={() => this.context.router.push(`management/exams/quiz/${item.quiz_id}/plan/${item.plan_id}`)}>
              <div className="exam-item mt-24 ml-24">
                <div className="exam-img">
                  <img src={item.source_img_url} alt={item.source_name} />
                  <div className={`exam-img-corner ${item.plan_type}`}>{this.context.intl.messages[`app.management.exam.${item.plan_type}`]}</div>
                </div>
                <div className="exam-info">
                  <div className="exam-info-title">{item.exam_name}</div>
                  <div className="exam-info-desc">
                    <span className="source">{item.source_name}</span>
                  </div>
                  <div className="exam-info-desc">
                    <span>{this.context.intl.messages['app.management.exam.passRate']}：</span><span className="pass-rate">{item.pass_rate}%</span>
                    <span>{this.context.intl.messages['app.management.exam.finishRate']}：</span><span>{item.finish_rate}%</span>
                  </div>
                </div>
              </div>
            </li>
            ))
          }
      </ul>
    );
  }

  render() {
    const { items } = this.props;
    let listEl = null;
    if (items.length) {
      listEl = this.renderList();
    } else {
      listEl = this.renderEmpty();
    }

    return (
      <div>
        {listEl}
      </div>
    );
  }
}

ManagementExamSection.propTypes = {
  items: React.PropTypes.array,
};

export default ManagementExamSection;
