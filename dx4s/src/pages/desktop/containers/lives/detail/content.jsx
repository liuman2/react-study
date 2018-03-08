/**
 * 课程详情-目录
*/
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

const propTypes = {
  trainingLive: PropTypes.object.isRequired,
  /* eslint-disable react/no-unused-prop-types*/
  onLiveNodeClick: PropTypes.func,
  /* eslint-enable */
};

function renderLiveStatus(item) {
  switch (item.status) {
    case 'not_start':
      return null;
    case 'about_to_start':
      return <FormattedMessage {...messages.statusYet} />;
    case 'over':
      if (item.hasRecord) {
        return <FormattedMessage {...messages.statusRecord} />;
      }
      return <FormattedMessage {...messages.statusEnd} />;
    case 'on_live':
      return <FormattedMessage {...messages.statusGoing} />;
    default:
      return null;
  }
}

function Contents(props) {
  const { trainingLive, onLiveNodeClick } = props;
  const lives = trainingLive.lives;
  return (
    <ul className="live-items">
      {
        lives.map((item, index) => (
          <li
            key={index}
            className="live"
            style={{ cursor: `${((item.status === 'over' && item.hasRecord) || item.status === 'on_live') ? 'pointer' : 'default'}` }}
            onClick={() => onLiveNodeClick(item)}
          >
            <div className="live-index">第{index + 1}期</div>
            <div className="live-name">{item.name}</div>
            <div className="live-teacher">讲师: {item.lecturer_name}</div>
            <div className="live-time">开始时间: {item.begin_time ? moment(item.begin_time).format('YYYY-MM-DD HH:mm') : <FormattedMessage {...messages.comingSoon} />}</div>
            <div className={`live-status ${item.status}`}>{renderLiveStatus(item)}</div>
          </li>
        ))
      }
    </ul>
  );
}

// const Contents = ({ trainingLive: { lives } }) => (
//   <ul className="live-items">
//     {
//       lives.map((item, index) => (
//         <li
//           key={index}
//           className="live"
//           onClick={() => onLiveNodeClick(item)}
//         >
//           <div className="live-index">第{index + 1}期</div>
//           <div className="live-name">{item.name}</div>
//           <div className="live-teacher">讲师: {item.lecturer_name}</div>
//           <div className="live-time">开始时间: {item.begin_time ? moment(item.begin_time).format('YYYY-MM-DD HH:mm') : <FormattedMessage {...messages.comingSoon} />}</div>
//           <div className={`live-status ${item.status}`}>{renderLiveStatus(item)}</div>
//         </li>
//       ))
//     }
//   </ul>
// );

Contents.propTypes = propTypes;

const mapStateToProps = state => ({
  trainingLive: state.trainingLive,
});

export default connect(mapStateToProps)(Contents);
