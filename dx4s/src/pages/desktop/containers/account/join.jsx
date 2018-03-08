import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import api from 'utils/api';
import urlParam from 'utils/urlParam';
import SMSCountdownButton from 'components/countdown-button/SMSCountdownButton';
import Container from './container';

import messages from './messages';
import './join.styl';
import iconError from './img/errorIcon.png';
import iconPhone from './img/icon_1.png';
import iconPassword from './img/icon_3.png';
import iconCode from './img/icon_4.png';
import iconUserName from './img/icon_5.png';
import iconAccountName from './img/icon-account_name.png';

function formToObject(formEl) {
  return Array.from(formEl.querySelectorAll('input,textarea'))
              .reduce((result, el) => ({ ...result, [el.name]: el.value }), {});
}

const tenantCode = urlParam('t');

class Join extends Component {
  constructor() {
    super();
    this.state = {
      toastMessageId: '',
      toastMessage: '',
      toastShow: false,
      isRequestingJoin: false,
    };
    this.register = ::this.register;
    this.onRequestCode = ::this.onRequestCode;
    this.toastTimeout = null;
  }

  onRequestCode() {
    const phone = formToObject(this.form).mobile;
    return api({
      method: 'GET',
      url: '/account/getDynamicCode',
      params: { mobile_phone: phone, tenant_code: tenantCode, type: 4 },
    });
  }

  getIntl = messageId => this.context.intl.messages[messageId];

  showToast = ({ toastMessageId = '', toastMessage = '' }) => {
    this.setState({
      toastShow: true,
      toastMessageId,
      toastMessage,
    });
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(this.hideToast, 2000);
  };
  hideToast = () => this.setState({ toastShow: false });

  async register() {
    if (this.state.isRequestingJoin) return;
    this.setState({ isRequestingJoin: true });
    try {
      const { data } = await api({
        method: 'POST',
        url: '/training/tenant/user-register',
        data: formToObject(this.form),
      });
      const router = this.context.router;
      if (data.freeReview) {
        router.replace(`/join/success?t=${tenantCode}`);
        return;
      }
      router.replace(`/join/audit?t=${tenantCode}`);
    } catch ({ response }) {
      const toastMessage = response.data.message;
      this.showToast({ toastMessage });
    }
    this.setState({ isRequestingJoin: false });
  }

  renderField = (fieldName, options = {}) => {
    const { type = 'text', inputClass, children, icon } = options;
    const placeholder = this.getIntl(`app.account.join.field.${fieldName}`);
    return (
      <div className="field">
        {icon && <img src={icon} role="presentation" />}
        <input className={inputClass} name={fieldName} type={type} placeholder={placeholder} />
        {children}
      </div>
    );
  };

  render() {
    const { toastMessageId, toastMessage, toastShow } = this.state;
    let toastMessageContent = null;
    let tipClass = { visibility: 'hidden' };
    if (toastShow) {
      tipClass = { visibility: 'visible' };
      toastMessageContent =
        toastMessage || <FormattedMessage {...messages[toastMessageId]} />;
    }

    return (
      <Container>
        <div className="join">
          <span
            style={tipClass}
            className="tip"
          >
            <img src={iconError} alt="" />
            {toastMessageContent}
          </span>
          <form ref={(ref) => { this.form = ref; }}>
            <input name="tenant_code" type="hidden" value={tenantCode} />
            {this.renderField('user_name', { icon: iconUserName })}
            {this.renderField('account_name', { icon: iconAccountName })}
            {this.renderField('mobile', {
              icon: iconPhone,
              inputClass: 'phone',
              children: <SMSCountdownButton
                className="code"
                onRequest={this.onRequestCode}
                onRequestFail={
                  ({ response }) => this.showToast({ toastMessage: response.data.message })
                }
              />,
            })}
            {this.renderField('verify_code', { icon: iconCode })}
            {this.renderField('password', { type: 'password', icon: iconPassword })}
            {this.renderField('confirm_password', { type: 'password', icon: iconPassword })}
            {this.renderField('register_comment', { inputClass: 'comment' })}
          </form>

          <button
            className="join-button"
            disabled={this.state.isRequestingJoin}
            onClick={this.register}
          >
            <FormattedMessage {...messages.joinRegister} />
          </button>
        </div>
      </Container>
    );
  }
}

Join.contextTypes = {
  intl: React.PropTypes.object,
  router: React.PropTypes.object,
};

export default Join;
