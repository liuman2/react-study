import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import moment from 'moment';
import { setTitle } from 'utils/dx/nav';
import withAuth from 'hocs/withAuth';
import api from 'utils/api';
import { Link } from 'react-router';

import messages from './messages';
import './MyReport.styl';
import iconReceive from './imgs/icon-clock.png';
import iconRank from './imgs/icon-rank.png';
import iconRank1 from './imgs/rank-1.png';
import iconRank2 from './imgs/rank-2.png';
import iconRank3 from './imgs/rank-3.png';
import iconDefaultAvatar from './imgs/icon-default-avatar.png';
import headDefaultAvatar from './imgs/head-default.png';

function transform(data) {
  return {
    shouldEnterDeptRank: data.show_dept_ranking_entry, // 点击我在部门排名是否进入部门排行
    userId: data.user_id || 0,
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

class MyReport extends Component {
  constructor() {
    super();
    this.state = {
      initialed: false,
      report: {},
    };
  }

  async componentDidMount() {
    setTitle({ title: this.getIntl('title') });
    const { userId } = this.props;
    try {
      const { data } = await api({
        url: `/training/report/user/brief/detail?user_id=${userId}`,
      });
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({
        report: transform(data),
        initialed: true,
      });
    } catch (e) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({ report: transform({}), initialed: true });
    }
  }

  getIntl = id => this.context.intl.messages[`app.report.my.${id}`];

  // eslint-disable-next-line class-methods-use-this
  renderRankUser(rankUser, rank) {
    let rate;
    let name;
    let avatar;
    if (rankUser && !rankUser.user_id) {
      name = <FormattedMessage {...messages.noData} />;
      rate = '0';
      avatar = iconDefaultAvatar;
    } else {
      name = rankUser.user_name;
      rate = rankUser.finish_rate.toFixed(1);
      avatar = rankUser.header_url || headDefaultAvatar;
    }

    let rankBorder;
    if (rank === 1) rankBorder = iconRank1;
    else if (rank === 2) rankBorder = iconRank2;
    else rankBorder = iconRank3;
    return ([
      <Link className="avatar-box" to={`report/other?userId=${rankUser.user_id}`}>
        <img className="face" src={avatar} alt="face" />
        <img className="box" src={rankBorder} alt="avatar" />
      </Link>,
      <div key="rate" className="rank-user">{name}</div>,
      <div key="name" className="rank-value">{rate}%</div>,
    ]);
  }

  render() {
    const { initialed, report } = this.state;
    if (!initialed) return null;

    const {
      receivedNum,
      finishedNum,
      finishedRate,
      onlineDays,
      onlineTime,
      first,
      second,
      third,
      rankInDept,
      rankInTenant,
      date,
      shouldEnterDeptRank,
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

        <section className="section-rank">
          <div className="title">
            <img src={iconRank} role="presentation" />
            <FormattedMessage {...messages.rankHeader} />
          </div>
          <div className="card-group">
            <div className="left card">
              <div className="shadow-triangle shadow-triangle-right" />
              {this.renderRankUser(second, 2)}
            </div>
            <div className="top card">
              {this.renderRankUser(first, 1)}
            </div>
            <div className="right card">
              <div className="shadow-triangle shadow-triangle-left" />
              {this.renderRankUser(third, 3)}
            </div>
          </div>
        </section>

        <section className="list-item link">
          <Link to={`report/my-rank?type=tenant&showDept=${shouldEnterDeptRank}`}>
            <FormattedMessage {...messages.rankInCompany} /><span className="bold">{rankInTenant || <FormattedMessage {...messages.noData} />}</span>
          </Link>
        </section>

        <section className="list-item link">
          <Link to="report/my-rank?type=dept">
            <FormattedMessage {...messages.rankInDept} /><span className="bold">{rankInDept || <FormattedMessage {...messages.noData} />}</span>
          </Link>
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

const { object, number } = React.PropTypes;
MyReport.contextTypes = {
  intl: object,
};

MyReport.propTypes = {
  userId: number.isRequired,
};

const mapStateToProps = state => ({
  userId: state.account.user.id.user,
});

export default compose(connect(mapStateToProps), withAuth)(MyReport);

// 部门数小于3时, 不显示右剪头 <section className={`list-item ${shouldEnterDeptRank ? 'link' : ''}`} >
