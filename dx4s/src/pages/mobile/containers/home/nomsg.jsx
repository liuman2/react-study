import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import noMsgImg from './assets/list_empty.png';

function NoMsg() {
  return (
    <div className="nomsg">
      <img src={noMsgImg} alt="not msg" />
      <br />
      <FormattedMessage {...messages.noCourseMsg} />
    </div>
  );
}

export default NoMsg;
