import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter, routerShape } from 'react-router';
import { nav } from 'utils/dx';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

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

const propTypes = {
  actions: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  phases: PropTypes.array.isRequired,
  fetchParams: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
};

class RouteDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRouteInfo: false,
      showRevokedInfo: false,
    };
    this.clickInfoOK = ::this.clickInfoOK;
    this.clickRouteIcon = ::this.clickRouteIcon;
    this.clickRevokedInfoOK = ::this.clickRevokedInfoOK;
  }

  componentDidMount() {
    const { actions, fetchParams } = this.props;
    actions.fetchStudyRouteDetail(fetchParams);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.route !== this.props.route) {
      const { route } = nextProps;
      if (route.revoked) {
        this.setState({
          showRevokedInfo: true,
        });
      }
      setNav(route.name);
    }
  }

  clickInfoOK() {
    this.setState({
      showRouteInfo: false,
    });
  }

  clickRevokedInfoOK() {
    const { router } = this.props;
    router.go(-1);
  }

  clickRouteIcon() {
    this.setState({
      showRouteInfo: true,
    });
  }

  render() {
    const { route, phases, intl } = this.props;
    const { showRouteInfo, showRevokedInfo } = this.state;
    return (
      <div className="route-detail">
        <div className="route-detail-header">
          <div className="route-detail-name">
            <span>{route.name}</span>
          </div>
          <i role="presentation" className="route-detail-info-icon" onClick={this.clickRouteIcon} />
        </div>
        <ul className="route-detail-phase-items">
          {
            phases.map(phase => (
              <li className="route-detail-phase-item" key={phase.id}>
                {phase.has_lock ?
                  <div>
                    <div className="route-detail-phase-item-mask" style={{ display: 'block' }}>
                      <i className="route-detail-phase-lock-icon" />
                    </div>
                    <div className="route-detail-phase-order">
                      <span className="">{phase.phase_order}</span>
                      <i className={`route-detail-${phase.state}-icon ${intl.locale === 'en' ? 'en' : ''}`} />
                    </div>
                    <div className="route-detail-phase-name">
                      {phase.name}
                    </div>
                    <div className="route-detail-phase-coures">
                      <i className="route-detail-cup-icon" />
                      <span className="route-detail-phase-coures-status"><span className="color-f4593f">{phase.course_finished_num}</span>/{phase.course_total_num}</span>
                    </div>
                  </div> :
                  <Link to={`/learningMap/studyMap/${phase.id}`} style={{ display: 'block' }}>
                    <div className="route-detail-phase-order">
                      <span className="">{phase.phase_order}</span>
                      <i className={`route-detail-${phase.state}-icon ${intl.locale === 'en' ? 'en' : ''}`} />
                    </div>
                    <div className="route-detail-phase-name">
                      {phase.name}
                    </div>
                    <div className="route-detail-phase-coures">
                      <i className="route-detail-cup-icon" />
                      <span className="route-detail-phase-coures-status"><span className="color-f4593f">{phase.course_finished_num}</span>/{phase.course_total_num}</span>
                    </div>
                  </Link>
                }
              </li>
            ))
          }
        </ul>
        <div className="route-info-mask" style={{ display: showRouteInfo ? 'block' : 'none' }}>
          <div className="route-info">
            <div className="route-info-title">
              <FormattedMessage {...messages.mapInfo} />
            </div>
            <div className="route-info-description">
              {route.description}
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

RouteDetail.propTypes = propTypes;

export default connect((state, ownProps) => (
  {
    isFetching: state.studyRoute.isFetching || false,
    route: state.studyRoute.route || {},
    phases: state.studyRoute.phases || [],
    fetchParams: {
      routeId: ownProps.params.route_id,
    },
  }
), dispatch => (
  {
    actions: bindActionCreators(studyRouteActions, dispatch),
  }
))(injectIntl(withRouter(RouteDetail)));
