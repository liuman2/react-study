import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import api from 'utils/api';
import { setTitle } from 'utils/dx/nav';
import urlParam from 'utils/urlParam';
import Toast from 'components/modal/toast';
import Button from 'components/button';
import SMSCountdownButton from 'components/countdown-button/SMSCountdownButton';

import './join.styl';
import messages from './messages';

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
  }

  componentDidMount() {
    setTitle({ title: this.getIntl('app.account.join.register') });
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

  showToast = ({ toastMessageId = '', toastMessage = '' }) => this.setState({
    toastShow: true,
    toastMessageId,
    toastMessage,
  });
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
    const { type = 'text', icon = '' } = options;
    const placeholder = this.getIntl(`app.account.join.field.${fieldName}`);
    return (
      <div className={`field icon-${icon}`}>
        <input name={fieldName} type={type} placeholder={placeholder} className={`${fieldName==='register_comment' ? 'memo':''}`} />
      </div>
    );
  };

  render() {
    const { toastMessageId, toastMessage, toastShow } = this.state;
    let toastMessageContent = null;
    if (toastShow) {
      toastMessageContent =
        toastMessage || <FormattedMessage {...messages[toastMessageId]} />;
    }

    return (
      <div className="join">
        <form ref={(ref) => { this.form = ref; }}>
          <input name="tenant_code" type="hidden" value={tenantCode} />
          {this.renderField('user_name', { icon: 'user_name' })}
          {this.renderField('account_name', { icon: 'account_name' })}
          <div className="field icon-mobile">
            <input
              name="mobile"
              type="text"
              placeholder={this.getIntl('app.account.join.field.mobile')}
            />
            <SMSCountdownButton
              className="code"
              onRequest={this.onRequestCode}
              onRequestFail={
                ({ response }) => this.showToast({ toastMessage: response.data.message })
              }
            />
          </div>
          {this.renderField('verify_code', { icon: 'verify_code' })}
          {this.renderField('password', { type: 'password', icon: 'password' })}
          {this.renderField('confirm_password', { type: 'password', icon: 'password' })}
          {this.renderField('register_comment')}
        </form>

        <Button
          className="join-button"
          size="block"
          type={this.state.isRequestingJoin ? 'info' : 'primary'}
          onClick={this.register}
        >
          <FormattedMessage {...messages.joinRegister} />
        </Button>
        <Toast isOpen={toastShow} onRequestClose={this.hideToast}>
          <p>{toastMessageContent}</p>
        </Toast>
      </div>
    );
  }
}

Join.contextTypes = {
  intl: React.PropTypes.object,
  router: React.PropTypes.object,
};

export default Join;
