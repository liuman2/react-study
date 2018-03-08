import 'styles/mobile.styl';
import { setEdition } from 'utils/dx/edition';

import getAuth from 'utils/3rd/auth';

import ready from 'utils/dx/ready';
import urlParam from 'utils/urlParam';
import { setting } from 'utils/storage';

import init from '../../init';

window.Promise = require('promise-polyfill');
require('core-js/modules/es6.object.assign'); // fuck OPPO

const renderApp = () => {
  const asyncInit = new Promise((fulfill) => {
    require.ensure([], (require) => {
      const renderInit = require('./renderWithIntl').default;

      fulfill(renderInit);
    });
  });
  return asyncInit.then(renderInit => renderInit());
};


const getTicket = () => getAuth(undefined, {
  jsApiList: ['biz.navigation.setTitle', 'biz.navigation.setRight'],
});


function setTicket(ticket) {
  // const options = {
  //   expires: '1Y',
  //   domain: dxConfig.DUOXUE.cookie.domain,
  //   path: dxConfig.DUOXUE.cookie.path,
  // };
  // Cookie.remove('USER-TICKET');
  // Cookie.set('USER-TICKET', ticket, options);
  setting.set('ticket', ticket);
}

const renderWithIntl = () => new Promise(resolve => require.ensure([], require => resolve(require('./renderWithIntl').default())));

const renderIndex = () => {
  const loading = document.querySelector('#app-loding');
  const guide = document.querySelector('#dd-guide');
  guide.style.display = 'none';
  loading.style.display = 'block';

  return renderWithIntl().then(() => { loading.style.display = 'none'; });
};

const renderDingTalkIndex = (auth) => {
  setTicket(auth.ticket);
  const edition = auth.tenantPackageType;
  setEdition(edition);
  return renderIndex();
};
const code = urlParam('code');
const corpId = urlParam('corpid');
if (__platform__.dingtalk) {
  init()
    .then(getTicket)
    .then(renderDingTalkIndex)
    .catch(() => alert('应用出现错误'));
} else if (__platform__.wechatwork && !code && corpId) {
  init()
    .then(() => {
      const { origin, pathname } = window.location;
      const REDIRECT_URI = encodeURIComponent(`${origin}${pathname}`);
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_base&state=/wxwork#wechat_redirect`;
    })
    .catch(() => alert('应用出现错误'));
} else {
  init().then(() => ready(renderApp));
}
