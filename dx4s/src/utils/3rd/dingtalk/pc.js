import { setting } from 'utils/storage';
import urlParam from 'utils/urlParam';
import requestTicket from 'utils/3rd/auth';
import { requestByTicket } from 'utils/3rd/dingtalk/auth';
import { setEdition } from 'utils/dx/edition';
import dxConfig from 'dxConfig';

export function setTicket(ticket) {
  setting.set('ticket', ticket);
}

export async function ready(done) {
  if (__PLATFORM__.DINGTALKPC) {
    const appId = urlParam('appid');
    const corpId = urlParam('corpid');
    const ticket = urlParam('ticket');
    if (appId && corpId) {
      const response = await requestTicket();
      // pc钉钉如果是系统管理员则跳转至企业管理后台
      // if (response.role === 'sys_admin') {
      //   location.replace(`${dxConfig.SAAS.origin}?ticket=${response.ticket}`);
      //   return Promise.reject();
      // }
      setTicket(response.ticket);
      setEdition(response.tenantPackageType);
    } else if (ticket) {
      setTicket(ticket); // 先设置，这样请求头中就有了。
      const response = await requestByTicket();
      setEdition(response.tenantPackageType);
    } else {
      console.error("钉钉环境缺少参数");
    }
  }
  return Promise.resolve(done && done());
}
