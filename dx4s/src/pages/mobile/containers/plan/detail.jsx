import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RelativeLink } from 'react-router-relative-links';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { nav } from 'utils/dx';
import api from 'utils/api';
import Ribbon from '../../../../components/ribbon';
import { staffTask as staffTaskActions } from '../../actions';

import './styles.styl';
import messages from './messages';
import iconDivider from './img/icon-divider.png';
import { Alert } from '../../../../components/modal';

const setNav = (title) => {
  nav.setTitle({
    title,
  });
};

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
    this.productType = {
      live: <FormattedMessage {...messages.live} />,
      course: <FormattedMessage {...messages.micro} />,
      series: <FormattedMessage {...messages.series} />,
      exam: <FormattedMessage {...messages.exam} />,
      solution: <FormattedMessage {...messages.series} />,
    };
    this.bgColor = {
      live: '#F84E4E',
      course: '#38ACFF',
      series: '#82C650',
      solution: '#82C650',
    };
    this.linkTo = ::this.linkTo;
    this.renderValidStatus = ::this.renderValidStatus;
    this.onAlertConfirm = ::this.onAlertConfirm;
    this.state = {
      isAlertOpen: false,
      clickedCard: null,
    };
  }

  componentDidMount() {
    const { fetchParams, actions } = this.props;
    actions.fetchStaffTaskDetail(fetchParams);
    setNav(this.context.intl.messages['app.staffTask.title.detail']);
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

  renderValidStatus(courseInfo) {

    // if (courseInfo.task_type === 'live') {
    //   return null;
    // }

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
    if (Object.keys(detail).length === 0) return null;
    let expEl = null;
    const { gold, experience: exp, valid_time_end: timeEnd, valid_time_start: timeStart } = detail;
    const shouldExpElShow = gold !== 0 || exp !== 0;
    const shouldShowTime = (timeStart !== null || timeEnd !== null);

    if (shouldExpElShow) {
      expEl = (
        <div className={`staffTask-detail-exp ${shouldShowTime ? '' : 'tip-height'}`}>
          <div className="left">
            <FormattedMessage {...messages.rewardTip} />
          </div>
          <div className="middle">
            <img src={iconDivider} alt="" />
          </div>
          <div className="right">
            <FormattedHTMLMessage
              {...messages.reward}
              values={{ gold, exp }}
            />
          </div>
        </div>
      );
    }

    let validTimeEl = null;
    if (shouldShowTime) {
      if (timeStart && timeEnd) {
        validTimeEl = (
          <div className="info-validtime">
            <span className="info-validtime-title"><FormattedMessage id="app.staffTask.studyTime" />：</span>
            <span className="info-validtime-time">{timeStart}</span>
            <span className="info-validtime-title"><FormattedMessage id="app.course.studyTimeTo" /></span>
            <span className="info-validtime-time">{timeEnd}</span>
          </div>
        );
      } else if (timeStart) {
        validTimeEl = (
          <div className="info-validtime">
            <span className="info-validtime-title"><FormattedMessage id="app.staffTask.studyTime" />：</span>
            <span className="info-validtime-time">{timeStart}</span>
            <span className="info-validtime-title"><FormattedMessage id="app.course.studyTimeAfter" /></span>
          </div>
        );
      } else {
        validTimeEl = (
          <div className="info-validtime">
            <span className="info-validtime-title"><FormattedMessage id="app.staffTask.studyTime" />：</span>
            <span className="info-validtime-time">{timeEnd}</span>
            <span className="info-validtime-title"><FormattedMessage id="app.course.studyTimeEnd" /></span>
          </div>
        );
      }
    }

    return (
      <div className="staffTask">
        {(() => {
          if (Object.keys(detail).length) {
            return (
              <div className="staffTask-detail">
                <header className="staffTask-detail-header">
                  <img alt="" src={detail.plan_img_url} className="play-img" />
                  <div className="play-name">{detail.plan_name}</div>
                </header>
                {
                  (shouldExpElShow || shouldShowTime) ?
                    <div className="staffTask-detail-tip">
                      {validTimeEl}
                      {expEl}
                    </div> : null
                }

                <ul className="task-list">
                  {detail.my_task_items.map(item => (
                    <li className="task-item" key={item.task_id}>
                      <a
                        to={item.is_lock ? '' : this.linkTo(item.task_type, item.task_id)}
                        onClick={() => { this.toDetail(item); }}
                        className="task-href">
                        <div className="task-item-img" style={{ position: 'relative' }}>
                          <img className="task-item-img" alt="" src={item.task_img_url} />
                          {(() => {
                            if (item.task_type !== 'course') {
                              return (
                                <Ribbon
                                  text={this.productType[item.task_type]}
                                  backgroundColor={this.bgColor[item.task_type]}
                                />
                              );
                            }

                            return null;
                          })()}
                        </div>
                        <div className="task-item-info">
                          <div className="task-item-name">{item.task_name}</div>
                          {(() => {
                            if (item.is_lock) {
                              return <div className="task-item-lock">
                                <FormattedMessage {...messages.locked} /></div>;
                            } else if (item.pass_state === 'passed') {
                              /*return <div className="task-item-complete">
                                <FormattedMessage {...messages.completed} /></div>;*/
                            } else if (item.pass_state === 'inread') {
                              return <div className="task-item-inread">
                                <FormattedMessage {...messages.inread} /></div>;
                            }
                            return null;
                          })()}
                          {this.renderValidStatus(item)}
                        </div>

                      </a>
                    </li>
                  ))}
                </ul>
              </div>
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
