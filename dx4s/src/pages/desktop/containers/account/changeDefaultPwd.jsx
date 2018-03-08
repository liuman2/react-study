import React from 'react';
import api from 'utils/api';
import { setting } from 'utils/storage';
import { FormattedMessage } from 'react-intl';
import urlParam from 'utils/urlParam';
import Errors from './errors.jsx';
import Alert from '../../components/alert';
import DxFooter from '../../components/footer';
import messages from './messages';
import logo from './img/logo.png';
import infoIcon from './img/icon_6.png';

import './account.styl';

const contextTypes = {
  intl: React.PropTypes.object.isRequired,
};

const tenantCode = urlParam('t');

class reset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPwd: '',
      pwd: '',
      pwdConfirm: '',
      isErrorShow: false,
      errorContent: '',
      isAlertShow: false,
      isConfirmOpen: false,
    };
    this.handleSubmit = ::this.handleSubmit;
    this.handleChange = ::this.handleChange;
    this.clickJump = ::this.clickJump;
  }
  handleChange() {
    this.setState(Object.assign({}, this.state, {
      oldPwd: this.oldPwd.value,
      pwd: this.pwd.value,
      pwdConfirm: this.pwdConfirm.value,
      isErrorShow: false,
    }));
  }

  handleSubmit() {
    const self = this;
    const chineseReg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    if (this.pwd.value !== this.pwdConfirm.value) {
      this.setState({
        isErrorShow: true,
        errorContent: <FormattedMessage {...messages.differencePwd} />,
      });
      return false;
    }
    if (this.pwd.value.length < 6 || this.pwd.value.length > 20) {
      this.setState({
        isErrorShow: true,
        errorContent: <FormattedMessage {...messages.pwdLenght} />,
      });
      return false;
    }
    if (!/^\S+$/gi.test(this.pwd.value)) {
      this.setState({
        isErrorShow: true,
        errorContent: <FormattedMessage {...messages.pwdEmpty} />,
      });
      return false;
    }
    if (chineseReg.test(this.pwd.value)) {
      this.setState({
        isErrorShow: true,
        errorContent: <FormattedMessage {...messages.pwdChinese} />,
      });
      return false;
    }
    return api({
      method: 'POST',
      url: '/account/account/changePass',
      data: {
        old_pass: this.oldPwd.value,
        new_pass: this.pwd.value,
      },
    }).then(() => {
      setting.set('ticket', 'error');
      self.setState({
        isAlertShow: true,
      });
      setTimeout(() => {
        self.setState({ isErrorShow: false });
        // window.location = '#/account';
        window.location = './#/account';
      }, 3000);
    }).catch((err) => {
      self.setState({
        isErrorShow: true,
        errorContent: err.response.data.message,
      });
      return false;
    });
  }

  clickJump() {
    this.nextPage();
  }

  nextPage() {
    const self = this;
    api({
      method: 'GET',
      url: '/account/account/getLoginInfo',
    }).then((res) => {
      // 云图统计
      // if (res.data.user_id && CloudAtlas) {
      //   CloudAtlas.onProfileSignIn(String(res.data.user_id));
      // }
      if (!!res.data.binded_mobile_phone || !res.data.is_bind_mobile_phone_switch) {
        window.location = './#/home';
      } else {
        let q = '';
        if (tenantCode) {
          q = `?t=${tenantCode}`;
        }
        window.location = `./#/account/bindPhone${q}`;
      }
    }).catch((err) => {
      self.setState({
        isErrorShow: true,
        errorContent: err.response.data.message,
      });
    });
  }

  render() {
    const logoUlr = (tenantCode && !__PLATFORM__.DINGTALKPC) ? `https://e.91yong.com/${tenantCode}/img/logo.png` : logo;
    return (
      <div id="account">
        <Alert
          isShow={this.state.isAlertShow}
          timeout={3000}
        ><FormattedMessage {...messages.changeSuccess} />
        </Alert>
        <div id="accountNav">
          <div className="top"><img alt="" src={logoUlr} /></div>
        </div>
        <div id="accountContent" style={{ background: '#f2f4f8' }}>
          <div className="content">
            <div className="form2 form1">
              <div className="formBox" style={{ padding: '20px' }}>
                <div className="formTitle">
                  <img src={infoIcon} alt="icon" />
                  <p><FormattedMessage {...messages.setNewPwd} /></p>
                </div>
                <div className="formInput">
                  <Errors
                    isOpen={this.state.isErrorShow}
                    timeout={3000}
                  >{this.state.errorContent}</Errors>
                  <input
                    type="password"
                    name="oldPwd"
                    placeholder={this.context.intl.messages['app.account.inputReactOldPwd']}
                    style={{ left: '10px' }}
                    ref={(ref) => { this.oldPwd = ref; }}
                    onChange={this.handleChange}
                  />
                </div>
                <div className="formInput">
                  <input
                    type="password"
                    name="pwd"
                    placeholder={this.context.intl.messages['app.account.inputReactNewPwd']}
                    style={{ left: '10px' }}
                    ref={(ref) => { this.pwd = ref; }}
                    onChange={this.handleChange}
                  />
                </div>
                <div className="formInput">
                  <input
                    type="password"
                    name="pwdConfirm"
                    placeholder={this.context.intl.messages['app.account.inputReactNewPwdRepeat']}
                    style={{ left: '10px' }}
                    ref={(ref) => { this.pwdConfirm = ref; }}
                    onChange={this.handleChange}
                  />
                </div>
                <div className="formBtn">
                  <div className="formBtn">
                    {
                      this.state.oldPwd && this.state.pwd && this.state.pwdConfirm
                        ? <button type="primary" onClick={this.handleSubmit} ><FormattedMessage {...messages.pwdSubmit} /></button>
                        : <button type="primary" className="btn-disabled"><FormattedMessage {...messages.pwdSubmit} /></button>
                    }
                    {/* <a role="button" tabIndex={0} className="changePwd-jump" onClick={this.clickJump}><FormattedMessage {...messages.skip} /></a> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DxFooter theme={'white'} />
      </div>
    );
  }
}

reset.contextTypes = contextTypes;

export default reset;
