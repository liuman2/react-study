import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Ribbon from '../../../../components/ribbon';
import deleteIcon from './img/delete-icon.png';
import messages from './messages';

class Card extends Component {
  constructor(props) {
    super(props);
    this.onClick = ::this.onClick;
  }

  formatDate(now) {
    const nowDate = new Date(now);
    const year = nowDate.getFullYear();
    let month = nowDate.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let date = nowDate.getDate();
    date = date < 10 ? `0${date}` : date;
    let hour = nowDate.getHours();
    hour = hour < 10 ? `0${hour}` : hour;
    let minute = nowDate.getMinutes();
    minute = minute < 10 ? `0${minute}` : minute;
    return `${year}-${month}-${date} ${hour}:${minute}`;
  }

  onClick() {
    const { cardClick, courseInfo } = this.props;
    cardClick(courseInfo);
  }

  render() {
    const {
      type,
      img,
      name,
      style,
      to,
      isNew,
      done,
      isDelete,
      clickDelete,
      isFaid,
      task,
      beginTime,
      liveStatus,
      onLiveNum,
      courseInfo,
      showValidStatus,
    } = this.props;
    const reDefineType = isNew ? 'new' : type;
    const getType = {
      new: <FormattedMessage {...messages.new} />,
      series: <FormattedMessage {...messages.series} />,
      solution: <FormattedMessage {...messages.series} />,
      exam: <FormattedMessage {...messages.exam} />,
    };
    const getTask = {
      training: <FormattedMessage {...messages.required} />,
      elective: <FormattedMessage {...messages.minors} />,
      personal: <FormattedMessage {...messages.ownPurchase} />,
      exchange: <FormattedMessage {...messages.exchange} />,
    };
    const getBgColor = {
      new: '#f48644',
      series: '#82c650',
      solution: '#82c650',
      exam: '#cbac51',
    };
    const color = {
      training: '#009aec',
      elective: '#ffc03c',
      personal: '#fa3c3c',
      exchange: '#fa3c3c',  // TODO
    };
    // const getStatus = {
    //   'about_to_start': '即将开始',
    //   'not_start': '未开始',
    //   'on_live': '正在进行',
    //   'over': '已结束',
    // };

    const getStatus = function() {
      switch(liveStatus) {
        case 'about_to_start':
          return '即将开始';
        case 'not_start':
          return '未开始';
        case 'on_live':
          return '正在进行';
        case 'over':
          return '已结束';
        case 'on_live_n':
          return `第${onLiveNum}期`;
      }
    };

    const renderValidStatus = function getValidStatus() {
      if (!showValidStatus) {
        return (
          <div className="valid-status" />
        );
      }

      if (courseInfo.exam_unchecked === true) {
        return (
          /* 未批阅*/
          <div className="valid-status">
            <span className="not-mark"><FormattedMessage id="app.card.validStatusNotMark" /></span>
          </div>
        );
      }

      if (courseInfo.exam_unchecked === true) {
        return (
          /* 未批阅*/
          <div className="valid-status">
            <span className="not-mark"><FormattedMessage id="app.card.validStatusNotMark" /></span>
          </div>
        );
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
      const validTimeStart = courseInfo.valid_time_start;

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
                return (
                  <div className="valid-status" />
                );
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
                return (
                  <div className="valid-status" />
                );
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
          return (
            <div className="valid-status" />
          );
      }
    };

    return (
      <div className="dx-card" style={style}>
        <a to={to} onClick={this.onClick} className="dx-card-content">
          <div className="dx-card-img">
            {(type !== 'course' && type !== 'live') || isNew ? (
              <Ribbon
                text={getType[reDefineType]}
                backgroundColor={getBgColor[reDefineType]}
                height="48px"
                ribbonHeight="24px"
              />
            ) : null}
            <img src={img} alt="" />
            {
              /*done ? (
                <div className="dx-card-done"><FormattedMessage {...messages.done} /></div>
              ) : null*/
            }
            {
              /*isFaid ? (
                <div className="dx-card-isFaid"><FormattedMessage {...messages.isFaid} /></div>
              ) : null*/
            }
            {
              isDelete ? (
                <div className="dx-card-delete" onClick={clickDelete}><img src={deleteIcon} /></div>
              ) : null
            }
          </div>
          {
            task ? (
              <div className="dx-card-name"><span style={{ color: color[task] }}>[{getTask[task]}]</span> {name}</div>
            ) : <div className="dx-card-name">{name}</div>
          }
          {
            type === 'live' ? (
              <div className="dx-card-live">
                <div className="dx-card-live-time">{this.formatDate(beginTime)}</div>
                {
                  liveStatus !== 'not_start' ? (
                    <div className={`dx-card-live-status ${liveStatus}`}>{getStatus()}</div>
                  ) : null
                }
              </div>
            ) : null
          }
          {renderValidStatus()}
        </a>
      </div>
    );
  }
}

Card.propTypes = {
  type: PropTypes.string,
  img: PropTypes.string,
  name: PropTypes.string,
  task: PropTypes.string,
  style: PropTypes.object,  // eslint-disable-line
  to: PropTypes.string,
  isNew: PropTypes.bool,
  done: PropTypes.bool,
  isFaid: PropTypes.bool,
  isDelete: PropTypes.bool,
  clickDelete: React.PropTypes.func,
  beginTime: PropTypes.number,
  liveStatus: PropTypes.string,
  onLiveNum: PropTypes.number,
  courseInfo: PropTypes.object,  // eslint-disable-line
  showValidStatus: PropTypes.bool,
  cardClick: PropTypes.func,
};

export default Card;
