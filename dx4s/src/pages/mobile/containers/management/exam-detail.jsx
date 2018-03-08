/**
 * 试卷成绩详情
 */

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setTitle } from 'utils/dx/nav';
import api from 'utils/api';
import './management.styl';
import RefreshLoad from '../../components/refreshload';

class ManagementExamDetail extends Component {
  static propTypes() {
    return {
      params: PropTypes.object.isRequired,
    };
  }

  constructor() {
    super();
    this.state = {
      index: 1,
      list: [],
      hasMoreData: false,
      info: null,
      percent: '100%',
    };
  }

  componentDidMount() {
    this.fetchExamInfo();
    // this.fetchList();
  }

  onReszie() {
    if (!this.header || !this.wraper) return;
    const head = this.header.getBoundingClientRect();
    const wrap = this.wraper.getBoundingClientRect();
    this.area.height = wrap.height - head.height;
    const percent = `${((this.area.height / wrap.height) * 100)}%`;
    // eslink_disabled_next_line
    this.setState({ percent }, () => this.listBox.refresh());
  }

  async fetchExamInfo() {
    const { params } = this.props;
    const { data } = await api({
      url: '/training/exam/score/detail',
      params: {
        quiz_id: params.quizId,
        plan_id: params.planId,
      },
    });
    this.setState(Object.assign({}, this.state, {
      info: data,
    }));
    this.fetchList();

    // if (this.listBox) this.listBox.refresh();
  }

  async fetchList(index = this.state.index) {
    const size = 10;
    const { params } = this.props;
    const { data } = await api({
      url: '/training/exam/score/get-exam-score-user-list',
      params: {
        index,
        size,
        quiz_id: params.quizId,
        plan_id: params.planId,
      },
    });

    const list = index === 1 ? data.respList : this.state.list.concat(data.respList);
    const hasMoreData = data.respList.length >= 10;
    this.setState(Object.assign({}, this.state, {
      list,
      index,
      hasMoreData,
    }));
    // if (index === 1 && this.listBox) this.listBox.refresh();

    if (index === 1 && this.listBox) this.onReszie();

    return data.respList;
  }

  renderInfo() {
    const { info } = this.state;

    if (info === null) {
      return null;
    }
    if (info.total_count === null) {
      info.total_count = 0;
    }

    return (
      <ul className="exam-detail">
        <li className="exam-detail-item ml-24">
          <div className="exam-detail-title">{this.context.intl.messages['app.management.exam.title']}</div>
          <div className="exam-detail-info">{info.exam_name}</div>
        </li>
        <li className="exam-detail-item ml-24">
          <div className="exam-detail-title">{this.context.intl.messages['app.management.exam.source']}</div>
          <div className="exam-detail-info">{info.source_name}</div>
        </li>
        <li className="exam-detail-item pl-24">
          <div className="exam-detail-title">{this.context.intl.messages['app.management.exam.passType']}</div>
          <div className="exam-detail-info">{info.pass_line}/{info.score} ({this.context.intl.messages[`app.management.exam.${info.pass_type}`]})</div>
        </li>
        <li className="exam-detail-item pl-24">
          <div className="exam-detail-title">{this.context.intl.messages['app.management.exam.releaseCount']}</div>
          <div className="exam-detail-info">
            {info.plan_type === 'training' && this.context.intl.formatMessage({ id: 'app.management.exam.releaseNum' }, {
              num: info.total_count.toString(),
            })}
            {info.plan_type === 'elective' && '全员'}
          </div>
        </li>
      </ul>
    );
  }

  renderTotal() {
    const { list, info } = this.state;
    if (info === null) {
      return null;
    }

    return (
      <div className="exam-total">
        <div className="exam-total-title">{this.context.intl.messages['app.management.exam.info']}</div>
        <div className="exam-total-info">
          <span>
            {this.context.intl.messages['app.management.exam.passRate']}：
          </span>
          {list.length > 0 && <span className="pass-rate">{info.pass_rate}%</span>}
          {!list.length && <span className="pass-rate">-</span>}
          <span className="ml-24">
            {this.context.intl.messages['app.management.exam.finishRate']}：
          </span>
          {list.length > 0 && <span>{info.finish_rate}%</span>}
          {!list.length && <span>-</span>}
        </div>
      </div>
    );
  }

  renderListBlank() {
    return (
      <div className="exam-rank-empty">
        { this.context.intl.messages['app.management.exam.rankEmpty'] }
      </div>
    );
  }

  renderList() {
    const { list } = this.state;
    if (!list.length) {
      return this.renderListBlank();
    }
    return (
      <ul className="exam-rank">
        {
          list.map(item => (
            <li className="ml-24" key={item.user_id}>
              {item.rank < 4 && <div className={`icon-rank no${item.rank}`} />}
              {(item.rank > 3 && item.rank < 100) && <div className="icon-rank">{item.rank}</div>}
              <div className={`exam-rank-info ${item.rank > 99 ? 'ml-0' : ''}`}>
                <div className="exam-rank-line">
                  <p className="left">
                    {item.rank > 99 && <span className="rank">{item.rank}</span>}
                    {item.user_name}
                  </p>
                  <p className="right">
                    {item.is_finished && <span className="finish-tag">{this.context.intl.messages['app.management.exam.finished']}</span>}
                    {!item.is_finished && <span className="fail-tag">{this.context.intl.messages['app.management.exam.unfinish']}</span>}
                    {item.score !== null && <span className="finish-tag ml-16">{item.score}分</span>}
                  </p>
                </div>
                <div className={`exam-rank-line ${item.rank > 99 ? 'ml-66' : ''}`}>
                  <p className="left">
                    {item.dept_name !== null && (item.dept_name.length > 4 ? (item.dept_name.substr(0, 4) + '...') : item.dept_name)}
                    {this.context.intl.formatMessage({ id: 'app.management.exam.examTimes' }, {
                      num: item.exam_times.toString(),
                    })}
                    {this.context.intl.formatMessage({ id: 'app.management.exam.examSpend' }, {
                      num: item.time_spend,
                    })}
                  </p>
                  {item.is_passed && <p className="right pass-tag pass">{this.context.intl.messages['app.management.exam.pass']}</p>}
                  {!item.is_passed && <p className="right pass-tag fail">{this.context.intl.messages['app.management.exam.unpass']}</p>}
                </div>
              </div>
            </li>
          ))
        }
      </ul>
    );
  }

  renderPage() {
    const { hasMoreData } = this.state;
    return (
      <RefreshLoad
        relative
        needPullDown
        className="exam-rank-container"
        needPullUp={hasMoreData}
        pullDownCallBack={cb => this.fetchList(1).then(cb)}
        pullUpCallBack={cb => this.fetchList(this.state.index + 1).then(cb)}
        ref={(ref) => { this.listBox = ref; }}
      >
        { this.renderList() }
      </RefreshLoad>
    );
  }

  render() {
    setTitle({ title: this.context.intl.messages['app.management.exam.detail'] });
    const { info } = this.state;
    if (info === null) {
      return null;
    }
    if (info.total_count <= 10) {
      return (
        <div className="management">
          { this.renderInfo() }
          { this.renderTotal() }
          { this.renderList() }
        </div>
      );
    }

    return (
      <div className="management" style={{ height: '100%' }} ref={ref => (this.wraper = ref)}>
        <div ref={ref => (this.header = ref)}>
          { this.renderInfo() }
          { this.renderTotal() }
        </div>

        <div ref={ref => (this.area = ref)} style={{ height: this.state.percent }}>
          { this.renderPage() }
        </div>
      </div>
    );
  }
}

ManagementExamDetail.contextTypes = {
  intl: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  params: {
    quizId: ownProps.params.quiz_id,
    planId: ownProps.params.plan_id,
  },
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Object.assign({}),
    dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagementExamDetail);
