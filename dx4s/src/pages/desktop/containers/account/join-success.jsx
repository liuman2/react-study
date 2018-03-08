import React from 'react';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';
import urlParam from 'utils/urlParam';
import Button from 'components/button';
import Container from './container';
import img from './img/icon-join-success.png';

import messages from './messages';
import './join-result.styl';

const tenantCode = urlParam('t');

function JoinSuccess({ router }) {
  function goBack() {
    router.replace(`/account?t=${tenantCode}`);
  }

  return (
    <Container>
      <div className="join-result">
        <img src={img} role="presentation" />
        <p><FormattedMessage {...messages.joinSuccess} /></p>
        <button onClick={goBack}>
          <FormattedMessage {...messages.back} />
        </button>
      </div>
    </Container>
  );
}

JoinSuccess.propTypes = {
  router: React.PropTypes.object,
};

export default withRouter(JoinSuccess);
