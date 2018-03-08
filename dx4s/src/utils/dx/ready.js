import api from 'utils/api';
import urlParam from 'utils/urlParam';
import { setting } from 'utils/storage';
import init from '../../init';

function setTicket(ticket) {
  setting.set('ticket', ticket);
  // const options = {
  //   expires: '1Y',
  //   domain: dxConfig.DUOXUE.cookie.domain,
  //   path: dxConfig.DUOXUE.cookie.path,
  // };
  // Cookie.remove('USER-TICKET');
  // Cookie.set('USER-TICKET', ticket, options);
}

function initPromise(done) {
  init().then(done);
}

function Ready(callback) {
  function done(data) {
    if (typeof callback === 'function') {
      callback(data);
    }
    const $loding = document.getElementById('app-loding');
    if ($loding) {
      $loding.style.display = 'none';
      document.getElementById('login-msg').innerText = '';
    }
  }

  // initIntlPolyfill(() => initPromise(() => {
  initPromise(() => {
    if (__platform__.dingtalk) {
      require('utils/3rd/dingtalk').init((data) => {
        setTicket(data.ticket);
        if (data.ticket) done(data);
      });
    } else {
      const tenantCode = urlParam('tenant');
      const token = urlParam('token');
      const deviceCode = urlParam('deviceCode');
      if (tenantCode && token) {
        // 金牌免登功能
        api({
          method: 'POST',
          url: '/account/third-party/login',
          data: {
            tenant_code: tenantCode,
            token,
            device_code: deviceCode,
          },
        }).then((response) => {
          setTicket(response.data.ticket);
          done();
        }).catch((reason) => {
          console.log(`reason: ${reason}`);
          window.location = `./#/account?t=${tenantCode}`;
        });
      } else {
        done();
      }
    }
  });
}

export default Ready;
