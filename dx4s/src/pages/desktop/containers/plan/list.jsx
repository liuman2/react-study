import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RelativeLink } from 'react-router-relative-links';
import { FormattedMessage } from 'react-intl';
import api from 'utils/api';
import DxHeader from '../../components/header';
import DxFooter from '../../components/footer';
import Confirm from '../../components/confirm';
import { staffTask as staffTaskActions } from '../../actions';
import './styles.styl';

import messages from './messages';

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
        { data.valid_time_end ? <div className="task-item-time"><FormattedMessage {...messages.endTime} />: {data.valid_time_end}</div> : null}
      </div>
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
    intl: React.PropTypes.object,
    router: React.PropTypes.object,
  };
  constructor(props, context) {
    super(props, context);
    this.nextPage = ::this.nextPage;

    this.renderValidStatus = ::this.renderValidStatus;
    this.onCardClick = ::this.onCardClick;
    this.onAlertConfirm = ::this.onAlertConfirm;
    this.state = {
      isAlertOpen: false,
      clickedCard: null,
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.resetStaffTaskPage();
    actions.fetchStaffTaskList();
  }

  nextPage() {
    const { actions } = this.props;
    actions.nextStaffTaskPage();
    actions.fetchStaffTaskList();
  }

  renderValidStatus(courseInfo) {
    const notStartEl = (
      <div className="valid-status not-started">
        {this.context.intl.messages['app.staffTask.validStatusNotStart']}
      </div>
    );

    const invalidEl = (
      <div className="valid-status invalid">
        {this.context.intl.messages['app.staffTask.validStatusInvalid']}
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

            if (validTimeEnd === null && validTimeStart === null) {
              return null;
            }

            return (
              <div className="valid-status not-study" style={{ right: '26px' }} />
            );
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

            return null;

            // if (validTimeEnd === null && validTimeStart === null) {
            //   return null;
            // }

            // return (
            //   <div className="valid-status not-study" />
            // );
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

  renderValidTime(planInfo) {
    if (!planInfo.valid_time_start && !planInfo.valid_time_end) {
      return null;
    }

    if (planInfo.valid_time_start && planInfo.valid_time_end) {
      return (
        <div className="validtime">
          <span className="title">{this.context.intl.messages['app.staffTask.studyTime']}:</span>
          <span className="time">{planInfo.valid_time_start}</span>
          <span className="title">{this.context.intl.messages['app.staffTask.studyTimeTo']}</span>
          <span className="time">{planInfo.valid_time_end}</span>
        </div>
      );
    }

    if (planInfo.valid_time_start) {
      return (
        <div className="validtime">
          <span className="title">{this.context.intl.messages['app.staffTask.studyTime']}:</span>
          <span className="time">{planInfo.valid_time_start}</span>
          <span className="title">{this.context.intl.messages['app.staffTask.studyTimeAfter']}</span>
        </div>
      );
    }

    if (planInfo.valid_time_end) {
      return (
        <div className="validtime">
          <span className="title">{this.context.intl.messages['app.staffTask.studyTime']}:</span>
          <span className="time">{planInfo.valid_time_end}</span>
          <span className="title">{this.context.intl.messages['app.staffTask.studyTimeEnd']}</span>
        </div>
      );
    }

    return null;
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

  render() {
    const { tasks, page } = this.props;
    return (
      <div>
        <DxHeader />
        <div className="staffTask">
          <div className="staff-header">
            <div className="staff-header-container">
              <div className="staff-title"><i className="icon-task" /><FormattedMessage {...messages.listTitle} /></div>
            </div>
          </div>
          {(() => {
            if (tasks.length) {
              return (
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
                            { /*task.valid_time_end ? <div className="task-item-time"><FormattedMessage {...messages.endTime} />: {task.valid_time_end}</div> : null*/}
                            {this.renderValidTime(task)}
                            {this.renderValidStatus(task)}
                          </div>
                        </a>
                      </li>
                    ))
                  }
                </ul>
              );
            }
            return null;
          })()}
          <div className="staff-footer">
            {page.end ?
              <div className="staff-next disable" onClick={this.nextPage}><FormattedMessage {...messages.noMore} /></div> :
              <div className="staff-next" onClick={this.nextPage}><FormattedMessage {...messages.loadMore} /></div>
            }
          </div>

          <Confirm
            isOpen={this.state.isAlertOpen}
            confirm={this.onAlertConfirm}
            confirmButton={this.context.intl.messages['app.course.ok']}
            buttonNum={1}
          >
            <FormattedMessage {...messages.invalidMsg} />
          </Confirm>
        </div>
        <DxFooter />
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
