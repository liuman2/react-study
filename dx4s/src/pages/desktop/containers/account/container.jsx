import React from 'react';
import urlParam from 'utils/urlParam';
import DxFooter from '../../components/footer';

import logo from './img/logo.png';
import './container.styl';

const tenantCode = urlParam('t');

function Container({ children }) {
  const logoUlr = (tenantCode && !__PLATFORM__.DINGTALKPC) ? `https://e.91yong.com/${tenantCode}/img/logo.png` : logo;
  return (
    <div className="app">
      <header>
        <div className="container">
          <img src={logoUlr} role="presentation" />
        </div>
      </header>
      <main>{children}</main>
      <DxFooter theme="white" />
    </div>
  );
}

Container.propTypes = {
  children: React.PropTypes.element,
};

export default Container;
