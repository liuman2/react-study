import React, { Component } from 'react';
import Button from 'components/button';
import api from 'utils/api';
import { FormattedMessage } from 'react-intl';
import { nav } from 'utils/dx';
import Toast from 'components/modal/toast';
import { setting } from 'utils/storage';

import messages from './messages';
import './changeDefaultPwd.styl';

const contextTypes = {
  intl: React.PropTypes.object.isRequired,
};

class changeDefaultPwd extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isToastShow: false,
    };
    this.handleSubmit = ::this.handleSubmit;
    this.handleChange = ::this.handleChange;
    this.clickJump = ::this.clickJump;
    this.setNavBar = ::this.setNavBar;
    this.nextPage = ::this.nextPage;
    this.toastContent = '';
  }

  componentDidMount() {
    this.setNavBar();
  }

  setNavBar() {
    nav.setTitle({
      title: this.context.intl.messages['app.account.changeDefaultPwd.title'],
    });
  }

  handleChange(event) {
    const newState = {
      [event.target.name]: event.target.value.trim(),
    };

    this.setState(newState);
  }

  handleSubmit() {
    const { newPwd, oldPwd, confirmNewPwd } = this.state;
    if (newPwd.length < 6 || newPwd.length > 20) {
      this.toastContent = <FormattedMessage {...messages.pwdLenght} />;
      this.setState({
        isToastShow: true,
      });
      return false;
    }

    if (!/^\S+$/gi.test(newPwd)) {
      this.toastContent = <FormattedMessage {...messages.pwdEmpty} />;
      this.setState({
        isToastShow: true,
      });
      return false;
    }

    if (newPwd !== confirmNewPwd) {
      this.toastContent = <FormattedMessage {...messages.pwdDifference} />;
      this.setState({
        isToastShow: true,
      });
      return false;
    }

    const self = this;
    return api({
      method: 'POST',
      url: '/account/account/changePass',
      data: {
        new_pass: newPwd,
        old_pass: oldPwd,
      },
    }).then(() => {
      self.toastContent = <FormattedMessage {...messages.changeSuccess} />;
      self.setState({
        isToastShow: true,
      });
      setting.set('ticket', 'error');
      setTimeout(() => {
        self.setState({ isToastShow: false });
        // window.location = './#/account';
        window.location = './#/account';
      }, 3000);
    }).catch((err) => {
      self.toastContent = err.response.data.message;
      self.setState({
        isToastShow: true,
      });
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
        window.location = './#/account/bindPhone';
      }
    }).catch((err) => {
      self.toastContent = err.response.data.message;
      self.setState({
        isToastShow: true,
      });
    });
  }

  render() {
    return (
      <form className="changeDefaultPwd">
        <div className="info">
          <i className="info-icon" /><FormattedMessage {...messages.changePwdInfo} className="info-text" />
        </div>
        <div className="form-control">
          <input
            type="password"
            name="oldPwd"
            placeholder={this.context.intl.messages['app.account.changeInputOldPwd']}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-control">
          <input
            type="password"
            name="newPwd"
            placeholder={this.context.intl.messages['app.account.changeInputPwd']}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-control">
          <input
            type="password"
            name="confirmNewPwd"
            placeholder={this.context.intl.messages['app.account.changeInputPwdAgain']}
            onChange={this.handleChange}
          />
        </div>

        <div className="changePwd-footer">
          {
            this.state.oldPwd && this.state.newPwd && this.state.confirmNewPwd
              ? <Button type="primary" onClick={this.handleSubmit} ><FormattedMessage {...messages.submit} /></Button>
              : <Button type="primary" className="btn-disabled"><FormattedMessage {...messages.submit} /></Button>
          }
          {/* <a role="button" tabIndex={0} className="jump" onClick={this.clickJump}><FormattedMessage {...messages.skip} /></a> */}
        </div>
        <Toast
          style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.25)' } }}
          isOpen={this.state.isToastShow}
          timeout={3000}
          shouldCloseOnOverlayClick={false}
          onRequestClose={() => {
            this.setState({ isToastShow: false });
          }}
        >
          <div>{this.toastContent}</div>
        </Toast>
      </form>
    );
  }
}
changeDefaultPwd.contextTypes = contextTypes;

export default changeDefaultPwd;
