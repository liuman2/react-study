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

const propTypes = {
  fetchParams: PropTypes.object.isRequired,
  detail: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

class Detail extends Component {
  static contextTypes = {
    intl: PropTypes.object,
    router: React.PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.linkTo = ::this.linkTo;
    this.renderValidStatus = ::this.renderValidStatus;
    this.toDetail = ::this.toDetail;
    this.onAlertConfirm = ::this.onAlertConfirm;
    this.productType = {
      live: messages.live.id,
      course: messages.micro.id,
      series: messages.series.id,
      exam: messages.exam.id,
      solution: messages.series.id,
    };
    this.state = {
      isAlertOpen: false,
      clickedCard: null,
    };
  }

  componentDidMount() {
    const { fetchParams, actions } = this.props;
    actions.fetchStaffTaskDetail(fetchParams);
  }

  linkTo(type, id) {
    const { fetchParams: { planId } } = this.props;
    const urls = {
      course: `/plan/${planId}/series/0/courses/${id}`,
      exam: `/plan/${planId}/series/0/exams/${id}`,
      solution: `/plan/${planId}/series/${id}`,
      series: `/plan/${planId}/series/${id}`,
    };
    return urls[type];
  }

  renderValidTime() {
    const { detail: planInfo } = this.props;
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

  renderValidStatus(courseInfo) {
    if (courseInfo.exam_unchecked === true) {
      return <div className="valid-status not-mark" />;
    }

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

    const { detail } = this.props;
    const validTimeEnd = detail.valid_time_end;
    const validTimeStart = detail.valid_time_start;

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
              <div className="valid-status not-study" />
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

  toDetail(item) {
    if (item.is_lock) {
      return;
    }

    const router = this.context.router;
    const to = this.linkTo(item.task_type, item.task_id);

    if (item.task_type !== 'exam') {
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
    const { fetchParams: { planId } } = this.props;
    const confirmUrl = `/training/plan/${planId}/solution/0/quiz/${clickedCard.task_id}/invalid/confirm`;

    api({ method: 'PUT', url: confirmUrl }).then(() => {
      const to = this.linkTo(this.state.clickedCard.task_type, this.state.clickedCard.task_id);
      this.setState({ ...this.state, isAlertOpen: false, clickedCard: null });
      const router = this.context.router;
      router.push(router.createPath(to));
    });
  }

  render() {
    const { detail } = this.props;
    return (
      <div>
        <DxHeader />
        <div className="staffTask">
          {(() => {
            if (Object.keys(detail).length) {
              return (
                <div className="staffTask-detail">
                  <div className="staffTask-header">
                    <img alt="" src={detail.plan_img_url} className="play-img" />
                    <div className="play-name">
                      {detail.plan_name}
                      {this.renderValidTime()}
                    </div>
                  </div>
                  <ul className="tabs">
                    <li className="tab active"><FormattedMessage {...messages.contents} /></li>
                  </ul>
                  <ul className="staffTask-list">
                    {detail.my_task_items.map(item => (
                      <li className="staffTask-item" key={item.task_id}>
                        <a onClick={() => { this.toDetail(item); }} className="task-href">
                          <img className="staffTask-item-img" alt="" src={item.task_img_url} />
                          {
                            (() => {
                              if (item.task_type === 'course') {
                                return null;
                              }

                              return (
                                <div className={`corner ${item.task_type}`}>
                                  {this.context.intl.messages[this.productType[item.task_type]]}
                                </div>
                              );
                            })()
                          }
                          <div className="staffTask-item-info">
                            <div className="staffTask-item-name">{item.task_name}{item.is_lock ? <i className="staffTask-item-lock" /> : <i className="staffTask-item-unlock" />}</div>
                            <div className="staffTask-item-count">{item.finish_count}<FormattedMessage {...messages.haveBeenLearning} /></div>
                            {this.renderValidStatus(item)}
                          </div>
                          {/*item.pass_state === 'passed' ? <div className="staffTask-item-complete" /> : null*/}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return null;
          })()}
          <Confirm
            isOpen={this.state.isAlertOpen}
            confirm={this.onAlertConfirm}
            confirmButton={this.context.intl.messages['app.course.ok']}
            buttonNum={1}
          >
            <FormattedMessage {...messages.invalidMsg} />
          </Confirm>
          <DxFooter />
        </div>
      </div>
    );
  }
}

Detail.propTypes = propTypes;

export default connect((state, ownProps) => (
  {
    detail: state.staffTask.detail || {},
    fetchParams: {
      planId: ownProps.params.plan_id,
    },
  }
), dispatch => (
  {
    actions: bindActionCreators(staffTaskActions, dispatch),
  }
))(Detail);
