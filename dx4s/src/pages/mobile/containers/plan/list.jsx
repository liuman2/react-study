import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RelativeLink } from 'react-router-relative-links';
import { FormattedMessage } from 'react-intl';
import { nav } from 'utils/dx';
import api from 'utils/api';
import { staffTask as staffTaskActions } from '../../actions';
import RefreshLoad from '../../components/refreshload';
import Pulltext from '../../../../components/pulltext';
import './styles.styl';

import messages from './messages';
import { Alert } from '../../../../components/modal';

const setNav = (title) => {
  nav.setTitle({
    title,
  });
};

const taskPropTypes = {
  data: PropTypes.object.isRequired,
};

const Task = ({ data }) => (
  <li className="task-item">
    <RelativeLink to={{ pathname: `./detail/${data.plan_id}` }} className="task-href">
      <img className="task-item-img" alt="" src={data.img_url} />
      <div className="task-item-info">
        <div className="task-item-name">{data.plan_name}</div>
        <div className="task-item-finishRate"><FormattedMessage {...messages.rateOfProgress} />: {data.finish_rate}%</div>
        {data.valid_time_end ? <div className="task-item-time"><FormattedMessage {...messages.endTime} />: {data.valid_time_end}</div> : null}
      </div>
      <i className="icon-enter" />
    </RelativeLink>
  </li>
);

Task.propTypes = taskPropTypes;

const propTypes = {
  tasks: PropTypes.array.isRequired,
  page: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

class List extends Component {
  static contextTypes = {
    intl: PropTypes.object,
    router: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.pullDownCallBack = ::this.pullDownCallBack;
    this.pullUpCallBack = ::this.pullUpCallBack;
    this.state = {
      key: 0,
      clickedCard: null,
      isAlertOpen: false,
    };
    this.renderValidStatus = ::this.renderValidStatus;

    this.onAlertConfirm = ::this.onAlertConfirm;
    this.onCardClick = ::this.onCardClick;
  }

  componentDidMount() {
    const { actions } = this.props;
    const self = this;
    actions.resetStaffTaskPage();
    actions.fetchStaffTaskList().then(() => {
      const rndNum = Math.random();
      self.setState({ key: rndNum });
    });
    setNav(this.context.intl.messages['app.staffTask.title.list']);
  }

  pullDownCallBack(cb) {
    const { actions } = this.props;
    actions.resetStaffTaskPage();
    actions.fetchStaffTaskList().then(() => {
      cb();
    });
  }

  pullUpCallBack(cb) {
    const { actions } = this.props;
    actions.nextStaffTaskPage();
    actions.fetchStaffTaskList().then(() => {
      cb();
    });
  }

  onAlertConfirm() {
    const clickedCard = this.state.clickedCard;
    const confirmUrl = `/training/plan/${clickedCard.plan_id}/invalid/confirm`;

    api({ method: 'PUT', url: confirmUrl }).then(() => {
      const to = `/plan/detail/${this.state.clickedCard.plan_id}`;
      this.setState({ ...this.state, isAlertOpen: false, clickedCard: null });
      const router = this.context.router;
      router.push(router.createPath(to));
    });
  }

  onCardClick(item) {
    const router = this.context.router;
    const to = `/plan/detail/${item.plan_id}`;

    if (item.item_type === 'live') {
      router.push(router.createPath(to));
      return;
    }
    if (item.valid_status === undefined) {
      router.push(router.createPath(to));
      return;
    }

    if (item.valid_status !== 'invalid') {
      router.push(router.createPath(to));
      return;
    }

    if (item.valid_click === true) {
      router.push(router.createPath(to));
      return;
    }

    if (!item.is_finished && item.exam_unchecked !== true) {
      this.setState({ ...this.state, isAlertOpen: true, clickedCard: item });
      return;
    }

    router.push(router.createPath(to));
  }

  renderValidStatus(courseInfo) {

    // if (courseInfo.task_type === 'live') {
    //   return null;
    // }

    const notStartEl = (
      <div className="valid-status not-started">
        <FormattedMessage {...messages.validStatusNotStart} />
      </div>
    );

    const invalidEl = (
      <div className="valid-status invalid">
        <FormattedMessage {...messages.validStatusInvalid} />
      </div>
    );

    const validStatus = courseInfo.valid_status;
    const isFinished = courseInfo.is_finished;
    const validConfirm = courseInfo.valid_click;
    const isPass = courseInfo.is_pass;
    const validTime = courseInfo.valid_time;

    const validTimeEnd = courseInfo.valid_time_end;
    const validTimeStart = courseInfo.valid_time_begin;

    switch (validStatus) {
      // 尚未开始
      case 'notStarted':
        return notStartEl;
      // 已过期
      case 'invalid':
        {
          if (!isFinished) {
            // 过期未确认
            if (!validConfirm) {
              return invalidEl;
            }

            return null;

            // if (validTimeEnd === null && validTimeStart === null) {
            //   return null;
            // }

            // return (
            //   <div className="valid-status not-study" style={{ right: '26px' }} />
            // );
          }

          return isPass ? (
            <div className="valid-status pass" />
          ) : (
            <div className="valid-status not-pass" />
          );
        }
      // 有效期
      case 'valid':
        {
          if (!isFinished) {
            if (validTime) {
              return <div className="valid-status will-invalid">{validTime}</div>;
            }

            if (validTimeEnd === null && validTimeStart === null) {
              return null;
            }

            return (
              <div className="valid-status not-study" />
            );
          }

          return isPass ? (
            <div className="valid-status pass" />
          ) : (
            <div className="valid-status not-pass" />
          );
        }
      default:
        return null;
    }
  }

  render() {
    const { tasks, page } = this.props;
    return (
      <div className="staffTask">
        {(() => {
          if (tasks.length) {
            return (
              <RefreshLoad
                needPullUp={!page.end}
                pullDownCallBack={this.pullDownCallBack}
                pullUpCallBack={this.pullUpCallBack}
                key={this.state.key}
              >
                <ul className="task-list">
                  {
                    tasks.map((task, index) => (
                      /*<Task data={task} key={index} />*/
                      <li className="task-item" key={index} onClick={() => this.onCardClick(task)}>
                        <a className="task-href">
                          <img className="task-item-img" alt="" src={task.img_url} />
                          <div className="task-item-info">
                            <div className="task-item-name">{task.plan_name}</div>
                            <div className="task-item-finishRate"><FormattedMessage {...messages.rateOfProgress} />: {task.finish_rate}%</div>
                            {/*task.valid_time_end ? <div className="task-item-time"><FormattedMessage {...messages.endTime} />: {task.valid_time_end}</div> : null*/}
                            {this.renderValidStatus(task)}
                          </div>
                          <i className="icon-enter" />
                        </a>
                      </li>
                    ))
                  }
                </ul>
                {page.end && <Pulltext isMore={false} />}
              </RefreshLoad>
            );
          }
          return null;
        })()}
        <Alert
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isAlertOpen}
          onRequestClose={this.onAlertConfirm}
          confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
        >
          <FormattedMessage id="app.home.invalidMsg" />
        </Alert>
      </div>
    );
  }
}

List.propTypes = propTypes;

export default connect(state => (
  {
    tasks: state.staffTask.tasks || [],
    page: state.staffTask.page || {},
  }
), dispatch => (
  {
    actions: bindActionCreators(staffTaskActions, dispatch),
  }
))(List);
