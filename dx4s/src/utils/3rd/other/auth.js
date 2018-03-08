import api from 'utils/api';
import urlParam from 'utils/urlParam';

export default function requestTicket(config) {
  const {
    tenantCode = urlParam('tenant'),
    token = urlParam('token'),
    deviceCode = urlParam('deviceCode'),
  } = config;
  return api({
    method: 'POST',
    url: '/account/third-party/login',
    data: {
      tenant_code: tenantCode,
      token,
      device_code: deviceCode,
    },
  }).catch((reason) => {
    console.log(`reason: ${reason}`);
    window.location = `./#/account?t=${tenantCode}`;
  });
}
