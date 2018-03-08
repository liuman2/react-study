import React, { Component, PropTypes } from 'react';
import { Circle } from 'rc-progress';
import Loading from 'react-loading';
import classNames from 'classnames';
import api from 'utils/api';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// import Loading from '../../components/loading';
import RefreshLoad from '../../components/refreshload';

import './DeptLearningData.styl';

const size = 10;

class DeptLearningData extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      initialed: false,
      index: 1,
      list: [],
    };
    this.renderList = ::this.renderList;
  }

  async componentDidMount() {
    // setTitle({ title: this.getIntl('title') });
    await this.fetchList();
    this.asyncSetState({
      initialed: true,
    });
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.sort !== nextProps.sort || this.props.departmentId !== nextProps.departmentId) {
      this.asyncSetState({
        initialed: false,
      });
      await this.fetchList(1, nextProps.departmentId, nextProps.sort);
      this.asyncSetState({
        initialed: true,
      });
    }
  }

  getIntl = id => this.context.intl.messages[`app.report.DeptLearningData.${id}`];
  asyncSetState = obj => new Promise(resolve => this.setState(obj, resolve));

  async fetchList(
    index = this.state.index,
    departmentId = this.props.departmentId,
    sort = this.props.sort) {
    const { data } = await api({
      url: '/training/report/department/brief/get_study_rank_list',
      params: { department_id: departmentId, index, size, sort },
    });
    const list = index === 1 ? data : this.state.list.concat(data);
    const hasMoreData = data.length >= 10;
    this.setState({ list, index, hasMoreData });
    if (index === 1 && this.listBox) this.listBox.refresh();
    return data;
  }

  renderList() {
    const { list, hasMoreData } = this.state;
    return (
      list.length ?
        <RefreshLoad
          absolute
          className="dept-report-learning-data-refresh-box"
          needPullDown
          needPullUp={hasMoreData}
          pullDownCallBack={cb => this.fetchList(1).then(cb)}
          pullUpCallBack={cb => this.fetchList(this.state.index + 1).then(cb)}
          ref={(ref) => { this.listBox = ref; }}
        >
          <ul>
            {
              list.map(user => (
                <li key={user.rank}>
                  <div className="order">{user.rank}</div>
                  <div className="mid">
                    <span>{user.user_name}</span>
                    <span>{user.finish_rate}%</span>
                  </div>
                  <div className="receive"><FormattedMessage {...messages.receivedCourseCountParam} values={{ received_course_count: user.received_course_count }} /></div>
                </li>
              ))
            }
          </ul>
        </RefreshLoad> : <div style={{ textAlign: 'center', padding: '10px' }}><FormattedMessage {...messages.noData} /></div>
    );
  }

  render() {
    const options = {
      trailWidth: 4,
      strokeWidth: 4,
      trailColor: '#71dce1',
      strokeColor: '#ffffff',
    };
    const { finishRate, receivedCourseCount, finishCourseCount } = this.props;

    return (
      <div className="dept-report-learning-data">
        <header>
          <div className="left">
            <Circle percent={finishRate} {...options} />
            <div className="rate"><div><FormattedMessage {...messages.finishRate} /></div><div>{finishRate}%</div></div>
          </div>
          <div className="right">
            <div><FormattedMessage {...messages.receivedCourseCount} /></div>
            <div><span className="num">{receivedCourseCount}</span><FormattedMessage {...messages.courseUnit} /></div>
            <div style={{ marginTop: '10px' }}><FormattedMessage {...messages.finishCourseCount} /></div>
            <div><span className="num">{finishCourseCount}</span><FormattedMessage {...messages.courseUnit} /></div>
          </div>
        </header>
        {
          this.state.initialed
          ?
          this.renderList()
          :
          <div className="learning-data-loader">
            <Loading type="balls" color="#38acff" />
          </div>
        }
      </div>
    );
  }
}



DeptLearningData.contextTypes = {
  intl: PropTypes.object,
};

DeptLearningData.propTypes = {
  departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sort: PropTypes.string,
  finishRate: PropTypes.number,
  receivedCourseCount: PropTypes.number,
  finishCourseCount: PropTypes.number,
};

export default DeptLearningData;
