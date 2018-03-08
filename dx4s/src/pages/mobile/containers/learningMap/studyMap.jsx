import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter, routerShape } from 'react-router';
import { nav } from 'utils/dx';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import prefixAll from 'inline-style-prefixer/static';

import { studyRoute as studyRouteActions } from '../../actions';

import './styles.styl';
import messages from './messages';

import ok from './img/ok.png';
import okEn from './img/okEn.png';

const setNav = (title) => {
  nav.setTitle({
    title,
  });
};

const coordinate = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const monster = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

const propTypes = {
  actions: PropTypes.object.isRequired,
  points: PropTypes.array.isRequired,
  phaseInfo: PropTypes.object.isRequired,
  fetchParams: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
};

class StudyMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      choosePoint: {},
      choosePointIndex: 0,
      showCourseInfo: false,
      showPassInfo: false,
      showRevokedInfo: false,
      showPrev: true,
      showNext: true,
    };
    this.clickPoint = ::this.clickPoint;
    this.clickPrev = ::this.clickPrev;
    this.clickNext = ::this.clickNext;
    this.courseStatus = ::this.courseStatus;
    this.linkTo = ::this.linkTo;
    this.clickInfoOK = ::this.clickInfoOK;
    this.clickRevokedInfoOK = ::this.clickRevokedInfoOK;
    this.courseLength = 1;
  }

  componentDidMount() {
    const { actions, fetchParams } = this.props;
    actions.fetchStudyRoutePoints(fetchParams);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.points !== this.props.points && nextProps.points.length) {
      this.courseLength = nextProps.points.length;
      const allPass = nextProps.points.every((point, index) => {
        if (point.is_current) {
          const choosePoint = nextProps.points[index] || {};
          const showCourseInfo = !choosePoint.is_pass;
          this.setState({
            choosePoint,
            choosePointIndex: index,
            showNext: index + 1 !== this.courseLength,
            showPrev: index !== 0,
            showCourseInfo,
          });
          if (showCourseInfo) {
            setTimeout(() => this.setState({
              showCourseInfo: false,
            }), 3000);
          }
          return false;
        }
        return true;
      }, this);
      if (allPass) {
        this.setState({
          choosePoint: nextProps.points[0],
          choosePointIndex: 0,
          showNext: this.courseLength !== 1,
          showPrev: false,
          showPassInfo: true,
        });
      }
      const { phaseInfo } = nextProps;
      if (phaseInfo.revoked) {
        this.setState({
          showRevokedInfo: true,
        });
      }
      setNav(phaseInfo.name);
    }
  }

  clickInfoOK() {
    this.setState({
      showPassInfo: false,
    });
  }

  clickRevokedInfoOK() {
    const { router } = this.props;
    router.go(-2);
  }

  courseStatus() {
    const { intl } = this.props;
    const { choosePoint } = this.state;
    const status = {
      notStart: {
        en: 'notStartEn',
        zh: 'notStart',
      },
      review: {
        en: 'reviewEn',
        zh: 'review',
      },
      enter: {
        en: 'enterEn',
        zh: 'enter',
      },
    };
    if (choosePoint.has_lock) {
      return status.notStart[intl.locale];
    }
    if (choosePoint.is_pass) {
      return status.review[intl.locale];
    }
    return status.enter[intl.locale];
  }

  linkTo() {
    const { choosePoint } = this.state;
    const { fetchParams } = this.props;
    const { task_id: id, task_type: type } = choosePoint;
    const { phaseId: pid } = fetchParams;
    const link = {
      course: `/plan/${pid}/series/0/courses/${id}`,
      solution: `/plan/${pid}/series/${id}`,
      exam: `/plan/${pid}/series/0/exams/${id}`,
    };
    return link[type];
  }

  clickPoint(index) {
    const showNext = index + 1 !== this.courseLength;
    const showPrev = index !== 0;
    this.setState({
      choosePoint: this.props.points[index] || {},
      choosePointIndex: index,
      showNext,
      showPrev,
    });
  }

  clickPrev() {
    const oldChoosePointIndex = this.state.choosePointIndex;
    const choosePoint = oldChoosePointIndex - 1;
    const showPrev = choosePoint !== 0;
    const showNext = choosePoint + 1 !== this.courseLength;

    this.setState({
      choosePoint: this.props.points[choosePoint] || {},
      choosePointIndex: choosePoint,
      showPrev,
      showNext,
    });
  }

  clickNext() {
    const oldChoosePointIndex = this.state.choosePointIndex;
    const choosePoint = oldChoosePointIndex + 1;
    const showNext = choosePoint + 1 !== this.courseLength;
    const showPrev = choosePoint !== 0;

    this.setState({
      choosePoint: this.props.points[choosePoint] || {},
      choosePointIndex: choosePoint,
      showNext,
      showPrev,
    });
  }

  render() {
    const { points, phaseInfo, intl } = this.props;
    const { choosePoint, choosePointIndex, showCourseInfo, showNext, showPrev, showPassInfo, showRevokedInfo } = this.state;
    return (
      <div className="study-map">
        <div className="study-map-header">
          <div className="study-map-process-content">
            <div className="study-map-process" style={{ width: `${(phaseInfo.passedNum / phaseInfo.totalNum) * 100}%` }} />
            <div className="study-map-process-detail"><span>{phaseInfo.passedNum}</span>/{phaseInfo.totalNum}</div>
          </div>
        </div>
        <ul className="study-map-items">
          {
            points.map((point, index) => (
              <li
                role="presentation"
                className={`study-map-item study-${coordinate[point.pointX - 1]}-${coordinate[point.pointY - 1]}`}
                key={point.task_id}
                onClick={() => this.clickPoint(index)}
              >
                <span className={`study-map-item-img ${point.is_pass ? 'pass' : `monster-${monster[index % 8]}`}`} />
              </li>
            ))
          }
        </ul>
        <div className="study-map-detail" >
          <div className="study-map-detail-switch" >
            <i role="presentation" className="study-map-detail-prev" onClick={this.clickPrev} style={{ display: showPrev ? 'block' : 'none' }} />
            <i role="presentation" className="study-map-detail-next" onClick={this.clickNext} style={{ display: showNext ? 'block' : 'none' }} />
            <div className={`study-map-detail-coures-icon ${choosePoint.is_pass ? 'pass' : `monster-${monster[choosePointIndex % 8]}`}`} alt="" />
            <div className="study-map-detail-info" style={prefixAll({ transform: showCourseInfo ? 'scale(1)' : 'scale(0)' })}><FormattedMessage {...messages.learingInfo} /></div>
          </div>
          <div className="study-map-detail-coures">
            <img className="study-map-detail-coures-cover" src={choosePoint.img_url ? choosePoint.img_url : null} alt="" />
            <div className="study-map-detail-coures-desc">{choosePoint.task_name}</div>
          </div>
          {!choosePoint.has_lock ?
            <Link to={this.linkTo()} className={`study-map-detail-coures-btn ${this.courseStatus()}`} style={{ display: 'block' }} />
            :
            <div className={`study-map-detail-coures-btn ${this.courseStatus()}`} />
          }
        </div>
        <div className="route-info-mask" style={{ display: showPassInfo ? 'block' : 'none' }}>
          <div className="route-info">
            <div className="study-route-info-description">
              <FormattedMessage {...messages.passInfo} values={{ name: phaseInfo.name }} />
            </div>
            <img role="presentation" className="route-info-footer-ok" src={intl.locale === 'en' ? okEn : ok} alt="确定" onClick={this.clickInfoOK} />
          </div>
        </div>
        <div className="route-info-mask" style={{ display: showRevokedInfo ? 'block' : 'none' }}>
          <div className="route-info">
            <div className="study-route-info-description">
              <FormattedMessage {...messages.revokedInfo} />
            </div>
            <img role="presentation" className="route-info-footer-ok" src={intl.locale === 'en' ? okEn : ok} alt="确定" onClick={this.clickRevokedInfoOK} />
          </div>
        </div>
      </div>
    );
  }
}

StudyMap.propTypes = propTypes;

export default connect((state, ownProps) => (
  {
    isFetching: state.studyRoute.isFetching || false,
    points: state.studyRoute.points || [],
    phaseInfo: state.studyRoute.phaseInfo || {},
    fetchParams: {
      phaseId: ownProps.params.phase_id,
    },
  }
), dispatch => (
  {
    actions: bindActionCreators(studyRouteActions, dispatch),
  }
))(injectIntl(withRouter(StudyMap)));
