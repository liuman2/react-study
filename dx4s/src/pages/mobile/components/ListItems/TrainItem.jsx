import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import api from 'utils/api';
import './TrainItem.styl';
import messages from './messages';
import { Alert } from '../../../../components/modal';


class TrainItem extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.onItemClick = ::this.onItemClick;
    this.onAlertConfirm = ::this.onAlertConfirm;
    this.state = {
      isAlertOpen: false,
    };
  }

  onItemClick() {
    const { trainInfo, link } = this.props;
    const router = this.context.router;
    if (trainInfo.valid_status === undefined) {
      router.push(router.createPath(link));
      return;
    }

    if (trainInfo.valid_status !== 'invalid') {
      router.push(router.createPath(link));
      return;
    }

    if (trainInfo.valid_click === true) {
      router.push(router.createPath(link));
      return;
    }

    if (!trainInfo.is_finished) {
      this.setState({ ...this.state, isAlertOpen: true });
      return;
    }

    router.push(router.createPath(link));
  }

  onAlertConfirm() {
    const { trainInfo, link } = this.props;
    const confirmUrl = `/training/plan/${trainInfo.plan_id}/invalid/confirm`;

    api({ method: 'PUT', url: confirmUrl }).then(() => {
      this.setState({ ...this.state, isAlertOpen: false });
      const router = this.context.router;
      router.push(router.createPath(link));
    });
  }

  render() {
    const courseInfo = this.props.trainInfo;

    const renderValidStatus = function getValidStatus() {
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

      const notStudyEl = <span className="not-study">未学</span>;
      const notPassEl = <span className="not-pass">未通过</span>;

      const hasStudyEl = <span className="has-study">已学</span>;
      const hasPass = <span className="has-pass">已通过</span>;

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

              if (validTimeStart === null && validTimeEnd === null) {
                return null;
              }

              return (
                <div className="valid-status">
                  {notStudyEl}
                  {notPassEl}
                </div>
              );
            }

            return isPass ? (
              <div className="valid-status">
                {hasStudyEl}
                {hasPass}
              </div>
            ) : (
              <div className="valid-status">
                {hasStudyEl}
                {notPassEl}
              </div>
            );
          }
        // 有效期
        case 'valid':
          {
            if (!isFinished) {
              if (validTime) {
                return <div className="valid-status will-invalid">{validTime}</div>;
              }

              if (validTimeStart === null && validTimeEnd === null) {
                return null;
              }

              return (
                <div className="valid-status">
                  {notStudyEl}
                  {notPassEl}
                </div>
              );
            }

            return isPass ? (
              <div className="valid-status">
                {hasStudyEl}
                {hasPass}
              </div>
            ) : (
              <div className="valid-status">
                {hasStudyEl}
                {notPassEl}
              </div>
            );
          }
        default:
          return null;
      }
    };

    return (
      <div className="train_item" onClick={this.onItemClick}>
        <div className="img">
          <a to={this.props.link}><img src={this.props.img_Url} alt={this.props.name} /></a>
        </div>
        <div className="train_info">
          <a to={this.props.link}>
            <div className="title-info">{this.props.name}</div>
            <div className="time">任务完成率: {this.props.task_rate}%</div>            
            {this.props.valid_time_end ? <div className="taskrate">{this.props.icon_text} : {this.props.valid_time_end}</div> : null}
            {renderValidStatus()}          
          </a>
        </div>
        <Alert
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isAlertOpen}
          onRequestClose={this.onAlertConfirm}
          confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
        >
          <FormattedMessage id="app.plan.invalidMsg" />
        </Alert>
      </div>
    );
  }
}
TrainItem.propTypes =
{
  link: React.PropTypes.string, // eslint-disable-line
  img_Url: React.PropTypes.string, // eslint-disable-line
  name: React.PropTypes.string, // eslint-disable-line
  icon_text: React.PropTypes.string, // eslint-disable-line
  valid_time_end: React.PropTypes.string, // eslint-disable-line
  task_rate: React.PropTypes.number, // eslint-disable-line
  trainInfo: React.PropTypes.object,  // eslint-disable-line
};

export  default  TrainItem;
