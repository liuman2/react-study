import React from 'react';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Button from 'components/button';
import urlParam from 'utils/urlParam';
import img from './static/icon-join-success.png';

import messages from './messages';
import './join-result.styl';

const tenantCode = urlParam('t');

function JoinSuccess({ router }) {
  function goBack() {
    router.replace(`/account?t=${tenantCode}`);
  }

  return (
    <div className="join-result">
      <img src={img} role="presentation" />
      <p><FormattedMessage {...messages.joinSuccess} /></p>
      <Button onClick={goBack}>
        <FormattedMessage {...messages.back} />
      </Button>
    </div>
  );
}

JoinSuccess.propTypes = {
  router: React.PropTypes.object,
};

export default withRouter(JoinSuccess);
