import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import moment from 'moment';
import { NOT_START, ABOUT_TO_START, ON_LIVE, OVER } from 'dxConstants/live-type';

import { getLiveStatusI18nEl } from './helper';
import messages from './messages';
import './basic.styl';

function renderLiveTypeTag(type) {
  if (type === 'meeting') return <FormattedMessage {...messages.typeMeeting} />;
  return <FormattedMessage {...messages.typeCourse} />;
}

function renderPriceEl(live) {
  const { price, type, free, vacancyNum, seatNum, status } = live;

  // 企业会议不需要显示价格和剩余座位
  if (type === 'meeting') return null;
  // 付费公开课，只显示价格
  if (price > 0) {
    return (
      <div className="sell">
        <span className="price">￥ {price}</span>
      </div>
    );
  }
  // 免费课程显示免费，并在公开课正在进行时显示剩余座位数
  if (free && seatNum !== undefined) {
    let vacancyEl = null;
    if (status === ON_LIVE) {
      vacancyEl = (
        <span className="count">
          <FormattedMessage {...messages.remain} /> {vacancyNum}/{seatNum}
        </span>
      );
    }
    return (
      <div className="sell">
        <span className="price"><FormattedMessage {...messages.free} /></span>
        {vacancyEl}
      </div>
    );
  }

  return null;
}

function renderLiveStatus(liveItem) {
  switch (liveItem.status) {
    case 'not_start':
      return null; // <FormattedMessage {...messages.statusComing} />;
    case 'about_to_start':
      return <FormattedMessage {...messages.statusYet} />;
    case 'over':
      if (liveItem.has_record || liveItem.hasRecord) {
        return <FormattedMessage {...messages.statusRecord} />;
      }
      return <FormattedMessage {...messages.statusEnd} />;
    case 'on_live':
      return <FormattedMessage {...messages.statusGoing} />;
    default:
      return null;
  }
}

function BasicLiveContainer(props) {
  const {
    name,
    type,
    cover,
    lecturer,
    beginTime,
    status,
    onLiveNum,
    tags = [],
    description,
    periodIntro,
    header,
    industries = [],
    signature,
    onTab = () => {},
    onReviewRecord = () => {},
    onShowMore = () => {},
    teacherMore,
    descMore,
    activeTab,
    lives = [],
  } = props;
  let tagsEl = null;
  if (tags.length > 0) {
    tagsEl = (
      <div className="live-basic-content">
        <div className="live-basic-tag">
          <div className="sub-title">
            课程对象
          </div>
          <div className="tags">
            {tags.map(tag => <span key={tag.id || tag.name} className="tag">{tag.name}</span>)}
          </div>
        </div>
      </div>
    );
  }

  let beginTimeEl = null;
  if (beginTime) {
    const statusClass = classnames(status, 'status');
    beginTimeEl = (
      <div className="start-time">
        <FormattedMessage
          {...messages.beginTime}
          values={{ beginTime: moment(beginTime).format('YYYY-MM-DD HH:mm') }}
        />
        { status !== NOT_START &&
          <span className={statusClass}>
            {getLiveStatusI18nEl(status, onLiveNum)}
          </span>
        }
      </div>
    );
  }

  let periodIntroEl = null;
  if (periodIntro) {
    periodIntroEl = (
      <div className="period-desc">
        {periodIntro}
      </div>
    );
  }

  let lectureIndustriesEl = null;
  if (industries.length) {
    lectureIndustriesEl = (
      <div className="tags">
        {industries.map(industry => <span key={industry.id || industry.name} className="tag">{industry.name}</span>)}
      </div>
    );
  }

  let lectureInfoEl = null;
  let lectureSignature = null;

  if (type !== 'meeting') {
    if (signature) {
      lectureSignature = signature.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
    }
    lectureInfoEl = (
      <div className="live-basic-content">
        <div className="live-basic-lecture">
          <div className="sub-title">讲师介绍</div>
          <div className="lecture-info">
            <div className="avatar">
              <img src={header} alt="" />
            </div>
            <div className="lecture-detail">
              <div className="lecture-name">{lecturer}</div>
              {lectureIndustriesEl}
              <div
                className={`lecture-signature summary ${!teacherMore ? 'unshowall' : ''}`}
                dangerouslySetInnerHTML={{ __html: lectureSignature }}
                id="teacherBox"
              >
              </div>
            </div>
          </div>
          <div
            className={`unfold ${teacherMore ? 'collapse' : 'expand'}`}
            onClick={() => onShowMore('teacher')}
            id="btnShowTeacherMore"
          >
            <FormattedMessage id={`app.course.${teacherMore ? 'hide' : 'more'}`} />
          </div>
        </div>
      </div>
    );
  }


  let tabEl = null;
  if (activeTab === 'basic') {
    tabEl = (
      <div>
        <div className="live-basic-content">
          <div className="title">{name}</div>
          <div className="title-sub">
            {renderLiveTypeTag(type)}
            <FormattedMessage {...messages.lecturer} values={{ lecturer }} />
          </div>
          {renderPriceEl(props)}
          {beginTimeEl}
          {periodIntroEl}
        </div>
        {tagsEl}
        {lectureInfoEl}
        <div className="live-basic-content">
          <div className="live-basic-tag">
            <div className="sub-title">
              <FormattedMessage {...messages.liveDesc} />
            </div>
            <div className="description" dangerouslySetInnerHTML={{ __html: description }}></div>
          </div>
        </div>
      </div>
    );
  } else {
    tabEl = (
      <div className="period-list">
        {
          lives.map((liveItem, index) =>
            <div className="live-period" onClick={() => onReviewRecord(liveItem)}>
              <div className="line mb20">
                <div className="line-left">
                  <span className="period-num"><FormattedMessage {...messages.liveTh} values={{ n: (index + 1) }} /></span>
                  <span className="period-title">{liveItem.name}</span>
                </div>
                <div className="line-right">
                  <span className={`live-status ${liveItem.status}`}>{renderLiveStatus(liveItem)}</span>
                </div>
              </div>
              <div className="line">
                <div className="line-left">
                  <span className="period-time"><FormattedMessage {...messages.liveStart} />:</span>
                  <span className="period-time">{liveItem.begin_time ? moment(liveItem.begin_time).format('YYYY-MM-DD HH:mm') : <FormattedMessage {...messages.comingSoon} />}</span>
                </div>
                <div className="line-right">
                  <span className="live-teacher">
                    <FormattedMessage {...messages.lecturer} values={{ lecturer: liveItem.lecturer_name }} />
                  </span>
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }

  return (
    <div className="live-basic">
      <img src={cover} alt={name} className="banner" />
      <ul className="live-basic-tab">
        <li onClick={() => onTab('basic')}>
          <a className={`${activeTab === 'basic' ? 'active' : ''}`}><FormattedMessage {...messages.liveInfo} /></a>
        </li>
        <li onClick={() => onTab('lives')}>
          <a className={`${activeTab === 'lives' ? 'active' : ''}`}><FormattedMessage {...messages.liveCourse} /></a>
        </li>
      </ul>
      {tabEl}
    </div>
  );
}

const { string, arrayOf, number, oneOfType, oneOf, bool, shape } = React.PropTypes;

BasicLiveContainer.propTypes = {
  name: string.isRequired,
  type: string,
  cover: string.isRequired,
  lecturer: string.isRequired,
  beginTime: oneOfType([string, number]),
  status: oneOf([NOT_START, ABOUT_TO_START, ON_LIVE, OVER]),
  tags: arrayOf(shape({ id: oneOfType([string, number]), name: string })),
  description: string,
  /* eslint-disable react/no-unused-prop-types*/
  price: oneOfType([string, number]),
  free: bool,
  vacancyNum: number,
  seatNum: number,
  onLiveNum: number,
  periodIntro: string,
  header: string,
  signature: string,
  industries: arrayOf(shape({ id: oneOfType([string, number]), name: string })),
  onTab: PropTypes.func,
  onReviewRecord: PropTypes.func,
  activeTab: string,
  onShowMore: PropTypes.func,
  teacherMore: bool,
  descMore: bool,
  lives: PropTypes.array,
  ref: PropTypes.object,
  /* eslint-enable */
};

export default BasicLiveContainer;
