import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import messages from './messages';
import './style.styl';
import Ribbon from '../../../../components/ribbon';

function Card(props) {
  const { imageURL, alt, type, content, externalClass, to, isNew, typeInfo, statusInfo, courseInfo, showValidStatus, cardClick } = props;

  function getLabelMessage() {
    if (isNew) {
      return (
        <FormattedMessage {...messages.new} />
      );
    }
    if (type === 'course') {
      return (
        <FormattedMessage {...messages.course} />
      );
    } else if (type === 'exam') {
      return (
        <FormattedMessage {...messages.exam} />
      );
    } else if (type === 'live') {
      return (
        <FormattedMessage {...messages.live} />
      );
    } else if (type === 'meeting') {
      return (
        <FormattedMessage {...messages.meeting} />
      );
    }
    else {
      return (
        <FormattedMessage {...messages.series} />
      );
    }
  }

  function getBgColor() {
    if (isNew) {
      return '#F48644';
    }
    if (type === 'course') {
      return '#38ACFF';
    } else if (type === 'solution') {
      return '#82C650';
    } else if (type === 'live') {
      return '#6ab48c';
    } else if (type === 'meeting') {
      return '#bcb25c';
    }

    return '#CBAC51';  // 考试     //问卷 #658AE9
  }

  let playTypeStr = null;
  if (typeInfo) {
    playTypeStr = (
      <span className={typeInfo.cls}>
        <FormattedMessage {...messages[typeInfo.msgKey]} />
      </span>
    );
  }

  const renderValidStatus = function getValidStatus() {
    if (!showValidStatus) {
      return null;
    }

    if (courseInfo.exam_unchecked === true) {
      return (
        /* 未批阅*/
        <div className="valid-status not-mark">
          <FormattedMessage id="app.exams.validStatusNotMark" />
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

    // const willInvalidEl = (
    //   <div className="valid-status will-invalid">{validTime}</div>
    // );

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

            // if (validTimeStart === null && validTimeEnd === null) {
            //   return null;
            // }

            return null;
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
    <div className={`card ${externalClass} ${showValidStatus ? '' : 'height258'}`} onClick={() => cardClick(courseInfo)}>
      <div className="card-face">
        {
          type !== 'course' || isNew ? <Ribbon text={getLabelMessage()} backgroundColor={getBgColor()} /> : null
        }
        <a>
          <img src={imageURL} alt={alt} />
          {
            (() => {
              if (statusInfo) {
                return <p className="status-info">{statusInfo}</p>;
              }
              return null;
            })()
          }

        </a>
      </div>
      <div className="card-content">
        {playTypeStr}
        <div className="card-title">{content}</div>
        {renderValidStatus()}
      </div>
    </div>
  );
}

Card.propTypes = {
  imageURL: React.PropTypes.string,
  alt: React.PropTypes.string,
  type: React.PropTypes.string,
  content: React.PropTypes.string,
  externalClass: React.PropTypes.string,
  to: React.PropTypes.string,
  isNew: React.PropTypes.bool,
  typeInfo: React.PropTypes.object,   // eslint-disable-line react/forbid-prop-types
  statusInfo: React.PropTypes.string, // 比如直播时间的显示
  courseInfo: React.PropTypes.object,  // eslint-disable-line
  showValidStatus: React.PropTypes.bool,
  cardClick: React.PropTypes.func,
};

Card.defaultProps = {
  type: 'new', // TODO type class
  isNew: false,
  typeInfo: null, // 'training',
};

export default Card;
