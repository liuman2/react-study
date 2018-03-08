import api from 'utils/api';
import urlParam from 'utils/urlParam';
import getClient from './client';

export function getDingTalkConfig({ corpId, appId, signedUrl }) {
  return api({
    method: 'post',
    url: '/account/dingtalk/config',
    data: { corpId, appId, signedUrl },
  });
}

function getDingTalkConfigByTicket({ signedUrl }) {
  return api({
    method: 'post',
    url: '/account/dingtalk/config-with-ticket',
    data: { signedUrl },
  });
}

export function configDingTalk(config) {
  return getClient().then((client) => {
    client.config({ ...config, jsApiList: ['device.notification.alert'] }); // 步骤二：通过config接口注入权限验证配置
    return new Promise((resolve, reject) => {
      client.ready(() => {
        if (client.ui && client.ui.webViewBounce) {
          client.ui.webViewBounce.disable();
        }
        resolve();
      }); // 步骤三：通过ready接口处理成功验证
      client.error(reject); // 步骤四：通过error接口处理失败验证
    });
  });
}

export function requestAuthCode(corpId) {
  return getClient().then(client =>
    new Promise((resolve, reject) => {
      client.runtime.permission.requestAuthCode({ corpId, onSuccess: resolve, onFail: reject }); // PC版获取免登授权码
    })
  );
}

export function getUserTicket(corpId, code) {
  return api({
    method: 'post',
    url: '/account/dingtalk/login',
    data: { corpId, code },
  });
}


export function requestByTicket() {
  // ticket在请求头中
  const signedUrl = window.location.href; //window.location.origin + window.location.pathname;
  let corpId;

  return getDingTalkConfigByTicket({ signedUrl }) // 从服务端获取钉钉配置数据
    .then(({ data: config }) => {
      console.log(config)
      corpId = config.corpId;
      return configDingTalk({ ...config });
    }) // 将配置数据初始化钉钉客户端
    .then(() => requestAuthCode(corpId))// 获取钉钉的CODE用于登录
    .then(({ code }) => getUserTicket(corpId, code)) // 用户登录
    .then(({ data }) => data)
    .catch((error) => {
      getClient().then((client) => {
        client.device.notification.alert({
          message: '服务器正在开小差, 请稍等一会儿.', // JSON.stringify(error),
          title: '错误提示',
          buttonName: '确认',
        });
      });
    });
}

export default function requestTicket(data = {}, options = {}) {
  const {
    appId = urlParam('appid'),
    corpId = urlParam('corpid'),
    signedUrl = window.location.href,
  } = data;

  return getDingTalkConfig({ appId, corpId, signedUrl }) // 从服务端获取钉钉配置数据
    .then(({ data: config }) => configDingTalk({ ...config, ...options })) // 将配置数据初始化钉钉客户端
    .then(() => requestAuthCode(corpId))// 获取钉钉的CODE用于登录
    .then(({ code }) => getUserTicket(corpId, code)) // 用户登录
    .catch((error) => {
      getClient().then((client) => {
        client.device.notification.alert({
          message: '服务器正在开小差, 请稍等一会儿.', // JSON.stringify(error),
          title: '错误提示',
          buttonName: '确认',
        });
      });
    });
}
