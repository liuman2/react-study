import React, { PropTypes } from 'react';
import { Link } from 'react-router';

class ManagementRequiredSection extends React.Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.renderEmpty = ::this.renderEmpty;
  }

  renderEmpty() {
    return (
      <div className="empty">
        <div className="empty-title">
          {this.context.intl.messages['app.management.section.requiredEmptyMsg']}
        </div>
        <Link to="/distribution/required">
          {this.context.intl.messages['app.management.section.requiredSend']}
        </Link>
      </div>
    );
  }

  renderList() {
    const { items } = this.props;

    return (
      <div className="required-list">
        {
          items.map(plan => (
            <div className="required-item" key={plan.id}>
              <div className="item-title">{plan.name}</div>
              <div className="item-info">
                <div className="info-time">
                  <span className="caption">{this.context.intl.messages['app.distribution.plan.deadline']}: </span>
                  <span className={`${plan.is_ending ? 'time' : 'caption'}`}>{plan.end === null ? this.context.intl.messages['app.management.section.notEnd'] : plan.end}</span>
                </div>
                <div className="num">
                  <span className="caption">{this.context.intl.messages['app.distribution.plan.course']}: </span>
                  <span className="caption">{plan.course_num}</span>
                </div>
              </div>
            </div>
          ))
        }
      </div>
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

ManagementRequiredSection.propTypes = {
  items: React.PropTypes.array,
};

export default ManagementRequiredSection;
