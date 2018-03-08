import React, { Component } from 'react';
import { locationShape } from 'react-router';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import moment from 'moment';
import { setTitle } from 'utils/dx/nav';
import withAuth from 'hocs/withAuth';
import api from 'utils/api';

import messages from './messages';
import './OtherReport.styl';
import iconReceive from './imgs/icon-clock.png';


function transform(data) {
  return {
    shouldEnterDeptRank: data.show_dept_ranking_entry, // 点击我在部门排名是否进入部门排行
    userId: data.user_id || 0,
    userName: data.user_name || 'xxx',
    receivedNum: data.received_count || 0,
    finishedNum: data.finish_count || 0,
    finishedRate: data.finish_rate || 0,
    onlineDays: data.login_days || 0,
    onlineTime: data.online_time ? data.online_time.toFixed(1) : 0, // 单位分钟
    first: data.first,
    second: data.second,
    third: data.third,
    rankInDept: data.ranking_in_dept || 0,
    rankInTenant: data.ranking_in_tenant || 0,
    date: moment(data.date).format('YYYY-MM-DD') || new Date().toJSON().substring(0, 10),
  };
}

class OtherReport extends Component {
  constructor() {
    super();
    this.state = {
      initialed: false,
      report: {},
    };
  }

  async componentDidMount() {
    // setTitle({ title: this.getIntl('otherTitle') });
    const userId = this.props.location.query.userId;
    try {
      const { data } = await api({
        url: `/training/report/user/brief/detail?user_id=${userId}`,
      });
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({
        report: transform(data),
        initialed: true,
      });
      setTitle({ title: data.user_name + this.getIntl('otherTitle') });
    } catch (e) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ report: transform({}), initialed: true });
    }
  }

  getIntl = id => this.context.intl.messages[`app.report.my.${id}`];

  render() {
    const { initialed, report } = this.state;
    if (!initialed) return null;

    const {
      userName,
      finishedRate,
      receivedNum,
      finishedNum,
      onlineDays,
      onlineTime,
      rankInDept,
      rankInTenant,
      date,
    } = report;


    return (
      <div className="my-report">
        <header>
          <FormattedMessage {...messages.finishRequiredRate} />
          <div className="days">
            <span className="value">{finishedRate}</span>
            <span className="unit">%</span>
          </div>
          <div className="duration">
            <div className="item">
              <img src={iconReceive} role="presentation" />
              <FormattedMessage {...messages.receivedCourse} values={{ receivedNum }} />
            </div>
            <span>|</span>
            <div className="item">
              <img src={iconReceive} role="presentation" />
              <FormattedMessage {...messages.finishedCourse} values={{ finishedNum }} />
            </div>
          </div>
        </header>

        <section className="list-item mt20">
          {userName}<FormattedMessage {...messages.rankInCompanyOther} /><span className="bold">{rankInTenant || <FormattedMessage {...messages.noData} />}</span>
        </section>

        <section className="list-item mt20">
          <FormattedHTMLMessage {...messages.onlineDays} values={{ onlineDays }} />
        </section>

        <section className="list-item">
          <FormattedHTMLMessage {...messages.onlineTime} values={{ onlineTime }} />
        </section>

        <section className="data-remark">
          <FormattedMessage {...messages.deadline} values={{ date }} />
        </section>
      </div>
    );
  }
}

OtherReport.contextTypes = {
  intl: React.PropTypes.object,
};

OtherReport.propTypes = {
  location: locationShape,
};

const mapStateToProps = state => ({
  userId: state.account.user.id.user,
});

export default compose(connect(mapStateToProps), withAuth)(OtherReport);

// 部门数小于3时, 不显示右剪头 <section className={`list-item ${shouldEnterDeptRank ? 'link' : ''}`} >
