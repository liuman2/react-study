import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { nav } from 'utils/dx';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import Slider from 'react-slick';
import './slick.css';
import './slick-theme.styl';
import './slider.styl';

import { studyRoute as studyRouteActions } from '../../actions';

import avatar from './img/avatar.png';
import islands from './img/islands.png';
import ok from './img/ok.png';
import okEn from './img/okEn.png';
import infoAvatar from './img/infoAvatar.png';

import './styles.styl';

import messages from './messages';

const point = ['one', 'two', 'three', 'four', 'five'];

const setNav = (title) => {
  nav.setTitle({
    title,
  });
};

const propTypes = {
  actions: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
  userInfo: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

class IndexMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUserDetail: false,
    };
    this.clickInfoOK = ::this.clickInfoOK;
    this.clickUserAvatar = ::this.clickUserAvatar;
  }

  componentDidMount() {
    const { actions, intl } = this.props;
    actions.fetchStudyRouteList();
    setNav(intl.messages['app.study.route.title.map']);
  }

  clickInfoOK() {
    this.setState({
      showUserDetail: false,
    });
  }

  clickUserAvatar() {
    this.setState({
      showUserDetail: true,
    });
  }

  render() {
    const { routes, userInfo, intl } = this.props;
    const { showUserDetail } = this.state;

    const settings = {
      arrows: false,
      dots: routes.length > 1,
      infinite: routes.length > 1,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
    };

    return (
      <div className="index-map">
        <div role="presentation" className="index-map-user" onClick={this.clickUserAvatar}>
          <img className="index-map-user-picture" src={userInfo.avatar || avatar} alt={userInfo.name} />
          <div className="index-map-user-name">{userInfo.name}</div>
          <div className="index-map-user-score">{userInfo.passTotalNum}</div>
        </div>
        {
          routes.length > 0
          ? <Slider {...settings} className="map-slider">
              {
                routes.map((items, index) => (
                  <ul className="index-map-items" key={index}>
                  {
                    items.map(route => (
                      <li role="presentation" className={`index-map-item ${point[route.pointX - 1]}-${point[route.pointY - 1]}`} key={route.id}>
                        <Link to={`/learningMap/route/${route.id}`}>
                          <img className="index-map-item-img" src={islands} alt={route.name} />
                          <span className="index-map-item-name">{route.name}</span>
                        </Link>
                      </li>
                    ))
                  }
                  </ul>
                ))
              }
            </Slider>
          : <ul className="index-map-items map-page"></ul>
        }
        <div className="index-map-user-detail-mask" style={{ display: showUserDetail ? 'block' : 'none' }}>
          <div className="index-map-user-detail-content">
            <div className="index-map-user-detail-base">
              <div className="index-map-user-detail-avatar">
                <img src={userInfo.avatar || infoAvatar} alt={userInfo.name} />
              </div>
              <div className="index-map-user-detail-info">
                <div className="index-map-user-detail-name">{userInfo.name}</div>
                <div className="index-map-user-detail-department">{userInfo.department}</div>
                {userInfo.positionCreateTime ?
                  <div className="index-map-user-detail-positionCreateTime"><FormattedMessage {...messages.enterTime} />{userInfo.positionCreateTime}</div>
                  : null
                }
              </div>
            </div>
            <div className="index-map-user-detail-study-precess">
              <div className="index-map-user-detail-study-precess-label"><FormattedMessage {...messages.process} /></div>
              <ul className="index-map-user-detail-study-precess-items">
                {
                  userInfo.studyProcessList ? userInfo.studyProcessList.map((studyProcess, index) => (
                    <li key={`studyProcess-${index}`} className="index-map-user-detail-study-precess-item">{studyProcess}</li>
                  )) : null
                }
              </ul>
            </div>
            <div className="index-map-user-detail-study-footer">
              <img role="presentation" className="index-map-user-detail-study-footer-ok" src={intl.locale === 'en' ? okEn : ok} alt="确定" onClick={this.clickInfoOK} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

IndexMap.propTypes = propTypes;

export default connect(state => (
  {
    isFetching: state.studyRoute.isFetching || false,
    routes: state.studyRoute.routes || [],
    userInfo: state.studyRoute.userInfo || {},
  }
), dispatch => (
  {
    actions: bindActionCreators(studyRouteActions, dispatch),
  }
))(injectIntl(IndexMap));
