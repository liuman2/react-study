import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { setting } from 'utils/storage';
import dingTalkPCOpenLink from 'utils/dingtalk';
import api from 'utils/api';
import { hasMallModuleSelector } from 'dxSelectors/account-user';
import withAuth from 'hocs/withAuth';
import Cookie from 'tiny-cookie';
import DropDown from './drop-down';
import Confirm from '../confirm';
import Toast from '../alert';
import { newMessage as newMessageActions, account as accountActions } from '../../actions';
import { CHANGE_LOCALE } from '../../constants/action-types';
import { getELink, getMallLink } from './link';
// import qrCode from './img/icon-code.png';
const localeText = { en: 'English', zh: '简体中文' };

class DxHeader extends Component {
  static contextTypes = {
    intl: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.closeConfirm = ::this.closeConfirm;
    this.logout = ::this.logout;
    this.isIE9 = ::this.isIE9;
    const locales = ['en', 'zh'];
    locales.splice(locales.indexOf(props.locale), 1);
    this.state = {
      locale: props.locale,
      otherLocale: locales[0],
      isConfirmOpen: false,
      isToastOpen: false,
      uploadMsg: '',
      uploadResType: 'success',
      isIE9Open: false,
      mallTicket: null,
      eTicket: null,
    };
  }

  async componentDidMount() {
    if (!this.props.user.lastUpdated) this.props.fetchUser();
    if (!__PLATFORM__.DINGTALKPC) {
      this.props.actions.fetchNewMessage();
    }
    const getTicket = platform => api({
      method: 'GET',
      url: '/account/change-ticket',
      params: {
        target_platform: platform,
      },
    });
    const [mallTicket, eTicket] = await Promise.all([
      getTicket('dxMall'),
      getTicket('dxPortal'),
    ]);
    this.setState({
      mallTicket: mallTicket.data.ticket,
      eTicket: eTicket.data.ticket,
    }, () => {
      dingTalkPCOpenLink('#nav-mall');
    });
  }

  componentWillReceiveProps({ newMessage, locale }) {
    const locales = ['en', 'zh'];
    locales.splice(locales.indexOf(locale), 1);
    this.setState({
      locale,
      otherLocale: locales[0],
    });
    if (newMessage.announcement_msg !== this.props.newMessage.announcement_msg) {
      this.props.actions.fetchNewMessage();
    }
  }

  getMenuItems() {
    let menuItems = [
      { link: 'examsList', text: this.context.intl.messages['app.asideNav.myExam'] },
      { link: 'favorites', text: this.context.intl.messages['app.asideNav.myCollection'] },
      { link: 'sign-in-record', text: this.context.intl.messages['app.asideNav.signInRecord'] },
    ];
    if (!__PLATFORM__.DINGTALKPC) {
      menuItems = menuItems.concat([
        { link: 'account/reset', text: this.context.intl.messages['app.asideNav.changePwd'] },
        {
          text: this.context.intl.messages['app.asideNav.logout'],
          onClick: () => { this.setState({ isConfirmOpen: true }); },
        },
      ]);
    }
    return menuItems;
  }

  closeConfirm() {
    this.setState({ isConfirmOpen: false });
  }

  handleImageChange(e) {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file, file.name);
    api({
      method: 'POST',
      enctype: 'multipart/form-data',
      data: formData,
      url: '/account/account/uploadPhoto',
    }).then(() => {
      this.setState({
        uploadMsg: this.context.intl.messages['app.asideNav.uploadAvatar.success'],
        isToastOpen: true,
        uploadResType: 'success',
      });
      this.props.fetchUser();
    }).catch(() => {
      this.setState({
        uploadMsg: this.context.intl.messages['app.asideNav.uploadAvatar.failure'],
        isToastOpen: true,
        uploadResType: 'error',
      });
    });
  }

  logout() {
    const logout = api({ url: '/account/certification/center/logout' });
    logout.then(() => {
      const { tenantCode } = this.props;
      let q = '';
      if (tenantCode) {
        q = `?t=${tenantCode}`;
      }

      this.props.initUser();
      window.location = `./#/account${q}`;
    });
  }

  isIE9() {
    if (navigator.userAgent.indexOf('MSIE 9') > -1) {
      this.setState({ isIE9Open: true });
    }
  }

  renderMenuTitle() {
    const { user } = this.props;
    return (
      <div>
        <div className="photo">
          <div className="photo-edit" onClick={this.isIE9}>
            {
              (navigator.userAgent.indexOf('MSIE 9') > -1) ? null : (
                <input
                  type="file"
                  name="photo-upload"
                  className="photo-upload"
                  accept="image/*"
                  onChange={(e) => { this.handleImageChange(e); }}
                />
              )
            }
            {this.context.intl.messages['app.asideNav.edit']}
          </div>
          <img src={user.avatar} alt="" />
        </div>
        <div className="info">
          <div className="name">{user.department}</div>
          <div className="telephone">
            {user.telephone ?
              user.telephone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') :
              <Link to="/account/bindPhone">{this.context.intl.messages['app.asideNav.bindPhone']}</Link>}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      locale,
      otherLocale,
      isConfirmOpen,
      isToastOpen,
      uploadMsg,
      uploadResType,
      isIE9Open,
    } = this.state;
    const { user, newMessage, changeLanguage, logoUrl } = this.props;
    const mallLink = getMallLink();
    const mallTicketLink = `${mallLink}?ticket=${this.state.mallTicket || ''}`;
    let showManagement = false;
    const showMall = this.props.user.modules && this.props.user.modules.mall;
    const eLink = getELink();
    const eTicketLink = `${eLink}/index.html?ticket=${this.state.eTicket || ''}`;
    if (this.props.user.is && this.props.user.is.admin && eTicketLink) {
      showManagement = true;
    }

    const showLiving = this.props.user.modules && this.props.user.modules.living;
    const showAnnouncement = this.props.user.modules && this.props.user.modules.announcement;

    let logoStyle = null;
    if (logoUrl && !__PLATFORM__.DINGTALKPC) {
      logoStyle = {
        background: `url(https://e.91yong.com/${logoUrl}) 0 0 no-repeat`,
        backgroundSize: 'contain',
      };
    }
    if (__PLATFORM__.DINGTALKPC) {
      logoStyle = null;
    }

    const isSelfPage = Cookie.get('NEW_PAGE') === '0';
    const aTarget = (__PLATFORM__.DINGTALKPC || isSelfPage) ? '_self' : '_blank';

    return (
      <div className="dx-header">
        <div className="dx-container">
          <Link className="dx-header-logo" to="" style={logoStyle}>&nbsp;</Link>
          <ul className="dx-header-nav">
            <li><Link to="home" activeClassName="active">{this.context.intl.messages['app.nav.home']}</Link></li>
            <li><Link to="plans" activeClassName="active">{this.context.intl.messages['app.nav.myPlans']}</Link></li>
            <li><Link to="electives" activeClassName="active">{this.context.intl.messages['app.nav.myElectives']}</Link></li>
            {
              showLiving
              ? <li><Link to="lives" activeClassName="active">{this.context.intl.messages['app.nav.myLives']}</Link></li>
              : null
            }
            { showMall ? <li>
              <Link
                to={null}
                href={mallTicketLink}
                // onClick={() => {
                //   if (__PLATFORM__.DINGTALKPC) {
                //     DingTalkPC.biz.util.openLink({
                //       url: mallTicketLink,
                //       onSuccess: () => {},
                //       onFail: () => {},
                //     });
                //   }
                // }}
                target={aTarget}
                id="nav-mall"
              >
                {this.context.intl.messages['app.nav.mall']}
              </Link>
            </li> : null }
            {showManagement ?
              <li>
                <Link
                  to={null}
                  href={eTicketLink}
                  // onClick={() => {
                  //   if (__PLATFORM__.DINGTALKPC) {
                  //     DingTalkPC.biz.util.openLink({
                  //       url: eTicketLink,
                  //       onSuccess: () => {},
                  //       onFail: () => {},
                  //     });
                  //   }
                  // }}
                  target={aTarget}
                >
                  {this.context.intl.messages['app.asideNav.management']}
                </Link>
              </li>
            : null}
          </ul>
          <div className="dx-header-info">
            {/* <DropDown
             type="content"
             className="header-info-code"
             content={this.context.intl.messages['app.asideNav.viewInPhone']}
             imgSrc={qrCode}
             />*/}
            {
              showAnnouncement ? (
                  <Link
                    to="announcement"
                    className={`header-info-notice ${newMessage.announcement_msg ? 'has-notice' : ''}`}
                  >
                    &nbsp;
                  </Link>
                ) : null
            }
            <DropDown
              hasIcon
              type="content"
              className="header-info-language"
              text={localeText[locale]}
              content={localeText[otherLocale]}
              onClick={() => changeLanguage(otherLocale)}
            />
            <DropDown
              hasIcon
              className="header-info-menu"
              text={user.name}
              items={this.getMenuItems()}
              dropDownTitle={this.renderMenuTitle()}
            />
          </div>
        </div>
        <Confirm
          isOpen={isConfirmOpen}
          cancel={this.closeConfirm}
          confirm={this.logout}
          confirmButton={this.context.intl.messages['app.asideNav.confirm.ok']}
          cancelButton={this.context.intl.messages['app.asideNav.confirm.cancel']}
        >
          <span>{this.context.intl.messages['app.asideNav.logoutConfirm']}</span>
        </Confirm>
        <Toast
          isShow={isToastOpen}
          timeout={2000}
          imgType={uploadResType}
          onRequestClose={() => {
            this.setState({ isToastOpen: false });
          }}
        >
          <div>{uploadMsg}</div>
        </Toast>
        <Toast
          isShow={isIE9Open}
          timeout={2000}
          imgType="error"
          onRequestClose={() => {
            this.setState({ isIE9Open: false });
          }}
        >
          <div>{this.context.intl.messages['app.asideNav.ie9NoModifyAvatar']}</div>
        </Toast>
      </div>
    );
  }
}

DxHeader.propTypes = {
  user: PropTypes.object,        // eslint-disable-line
  newMessage: PropTypes.object,  // eslint-disable-line
  actions: PropTypes.object,     // eslint-disable-line
  fetchUser: PropTypes.func,
  initUser: PropTypes.func,
  changeLanguage: PropTypes.func,
  locale: React.PropTypes.string,
  hasMallModule: React.PropTypes.bool,
  tenantCode: React.PropTypes.string,
  logoUrl: React.PropTypes.string,
};

const mapStateToProps = state => ({
  user: state.account.user,
  newMessage: state.newMessage.newMessage || {},
  locale: state.language.locale,
  hasMallModule: hasMallModuleSelector(state),
  tenantCode: state.account.user.tenantCode || '',
  logoUrl: state.account.user.logoUrl || '',
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(newMessageActions, dispatch),
  fetchUser: bindActionCreators(accountActions.fetchUser, dispatch),
  initUser: bindActionCreators(accountActions.initUser, dispatch),
  changeLanguage: (locale) => {
    setting.set('language', locale);
    dispatch({ type: CHANGE_LOCALE, locale });
  },
});

// export default connect(mapStateToProps, mapDispatchToProps)(DxHeader);
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth,
)(DxHeader);
