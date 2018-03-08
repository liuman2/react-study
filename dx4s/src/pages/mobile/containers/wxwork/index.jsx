
import React, { Component } from 'react';
import api from 'utils/api';
import urlParam from 'utils/urlParam';
import { setting } from 'utils/storage';

// const contextTypes = {
//   intl: React.PropTypes.object.isRequired,
// };

class wxwork extends Component {
  componentDidMount() {
    const code = urlParam('code');
    api({
      method: 'get',
      url: `/account/qiyeweixin/temp/login?code=${code}`,
    })
    .then((res) => {
      const { ticket } = res.data;
      setting.set('ticket', ticket);
      window.location = './#/home';
    });
  }

  render() {
    return (
      <div className="app-loding">
        <div className="rect1" />
        <div className="rect2" />
        <div className="rect3" />
        <div className="rect4" />
        <div className="rect5" />
      </div>
    );
  }
}

export default wxwork;
