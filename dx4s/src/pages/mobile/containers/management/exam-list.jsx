/**
 * 试卷成绩列表
 */

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setTitle } from 'utils/dx/nav';
import api from 'utils/api';
import './management.styl';
import RefreshLoad from '../../components/refreshload';
import img from './img/icon-empty-list.png';

const size = 10;

class ManagementExamList extends Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      index: 1,
      list: [],
    };
    this.renderList = ::this.renderList;
  }

  async componentDidMount() {
    await this.fetchList();
  }

  async fetchList(index = this.state.index) {
    const { data } = await api({
      url: '/training/exam/score/list',
      params: { index, size },
    });

    const list = index === 1 ? data.examScoreList : this.state.list.concat(data.examScoreList);
    const hasMoreData = data.examScoreList.length >= 10;
    this.setState({ list, index, hasMoreData });
    if (index === 1 && this.listBox) this.listBox.refresh();
    return data.examScoreList;
  }

  renderEmpty() {
    return (
      <div className="guide-page">
        <img src={img} alt={img} />
        <p className="sub-content">{this.context.intl.messages['app.management.list.empty']}</p>
      </div>
    );
  }

  renderList() {
    const { list, hasMoreData } = this.state;
    const emptyEl = this.renderEmpty();
    return (
      list.length ?
        <RefreshLoad
          needPullDown
          needPullUp={hasMoreData}
          className={`${__platform__.dingtalk ? 'refresh-container-bottom' : 'refresh-container'}`}
          pullDownCallBack={cb => this.fetchList(1).then(cb)}
          pullUpCallBack={cb => this.fetchList(this.state.index + 1).then(cb)}
          ref={(ref) => { this.listBox = ref; }}
        >
          <ul className={`exam-list ${hasMoreData ? '' : 'pb-100'}`}>
            {
              list.map(item => (
                <li
                  key={`${item.plan_id}${item.quiz_id}${item.task_id}`}
                  onClick={() => this.context.router.push(`management/exams/quiz/${item.quiz_id}/plan/${item.plan_id}`)}
                >
                  <div className="exam-item pt-24 pl-24">
                    <div className="exam-img">
                      <img src={item.source_img_url} />
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
                  <div className="exam-time pl-24 mb-16">
                    {this.context.intl.messages['app.management.exam.time']}: {item.exam_time_str}
                  </div>
                </li>
              ))
            }
          </ul>
        </RefreshLoad> : emptyEl
    );
  }

  render() {
    setTitle({ title: this.context.intl.messages['app.management.section.exam'] });
    return (
      <div className="management">
        { this.renderList() }
        <div className="dx-footer">
          <a className="dx-footer-button" onClick={() => this.context.router.push('management/exam/guid')}>
            <span className="icon-plus" />
            { this.context.intl.messages['app.management.exam.new'] }
          </a>
        </div>
      </div>
    );
  }
}

ManagementExamList.contextTypes = {
  intl: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Object.assign({}),
    dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagementExamList);
