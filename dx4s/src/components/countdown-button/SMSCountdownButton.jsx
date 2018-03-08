import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import CountdownButton from './';

import messages from './messages';

class SMSCountdownButton extends Component {
  constructor() {
    super();
  }

// eslint-disable-next-line arrow-parens
  onRequestSMSCode = async () => {
    this.countdown.disable();
    const { onRequest, onRequestSuccess, onRequestFail } = this.props;
    try {
      const res = await onRequest();
      if (onRequestSuccess) onRequestSuccess(res);
      this.countdown.startCountdown();
    } catch (e) {
      this.countdown.enable();
      if (onRequestFail) onRequestFail(e);
    }
  };

  render() {
    return (
      <CountdownButton
        ref={(ref) => { this.countdown = ref; }}
        onClick={this.onRequestSMSCode}
        {...this.props}
      >
        <FormattedMessage {...messages.requestSMSCode} />
      </CountdownButton>
    );
  }
}

const { func } = React.PropTypes;
SMSCountdownButton.propTypes = {
  // 传入一个返回Promise的函数，resolve后会调用onRequestSuccess，失败则调用onRequestFail
  onRequest: func,
  // 请求验证码成功的回调函数
  onRequestSuccess: func,
  // 请求验证码失败时的回调函数
  onRequestFail: func,
};

export default SMSCountdownButton;
