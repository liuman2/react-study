import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import urlParam from 'utils/urlParam';
import messages from './messages';

import './sign-footer.styl';

function SignFooter(props) {
  const getTenantId = function getTenantValue(name) {
    const reg = new RegExp(name + "=([^&]*)(&|$)");
    const r = window.location.hash.substr(1).match(reg);
    if (r !== null) return unescape(r[1]); return null;
  }
  
  const tenantId = getTenantId('t');
  if (!tenantId) return null;
  if (!props.appDownloadSwitch && !props.hasOpenSelfRegister) return null;

  let joinEl = null;
  if (props.hasOpenSelfRegister) {
    joinEl = (
      <div className="menu-item ">
        <Link className="icon-join" to={`/join?t=${tenantId}`}>
          <FormattedMessage {...messages.footerJoin} />
        </Link>
      </div>
    );
  }
  let downloadEl = null;
  if (props.appDownloadSwitch) {
    downloadEl = (
      <div className="menu-item">
        <a className="icon-download" href={`https://d.91yong.com/${tenantId}`}>
          <FormattedMessage {...messages.footerDownload} />
        </a>
      </div>
    );
  }

  return (
    <div className="sign-footer">
      <div className="division">
        <div className="line" />
        <div className="middle">OR</div>
        <div className="line" />
      </div>
      <div className="menu">
        {joinEl}
        {downloadEl}
      </div>
    </div>
  );
}

SignFooter.propTypes = {
  hasOpenSelfRegister: PropTypes.bool,
  appDownloadSwitch: PropTypes.bool,
};

export default SignFooter;
