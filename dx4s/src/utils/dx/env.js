const ua = window.navigator.userAgent;

export function isIE() {
  return ua.indexOf('MSIE ') !== -1 || ua.indexOf('Trident/') !== -1;
}

export function isIE9() {
  return ua.indexOf('MSIE 9') !== -1;
}

export function isIE10() {
  return ua.indexOf('MSIE 10') !== -1;
}

export function isIE11() {
  return isIE() && ua.indexOf('rv:11');
}

export function checkIsMobile() {
  // eslint-disable-next-line max-len
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(navigator.userAgent || navigator.vendor || window.opera);
}

export function isWebView() {
  return ua.indexOf('Common_Elearning') !== -1 || ua.indexOf('SmartCanWebView') !== -1;
}

export function isiOS() {
  return !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}

export const DEVICE = {
  MOBILE: checkIsMobile(),
  WEBVIEW: isWebView(),
  IE: isIE(),
  IE9: isIE9(),
  IE10: isIE10(),
  IE11: isIE11(),
  iOS: isiOS(),
};

export function checkIsInDingtalk() {
  return !!/dingtalk/i.exec(navigator.appVersion);
}

export function checkIsInWechat() {
  return /micromessenger/i.test(ua);
}

export function checkIsInWechatWork() {
  return /wxwork/i.test(ua);
}

export const PLATFORM = {
  DINGTALK: checkIsInDingtalk(),
  DINGTALKPC: checkIsInDingtalk() && !DEVICE.MOBILE,
  WECHATWORK: checkIsInWechatWork(),
  WEB: !checkIsInDingtalk() && !checkIsInWechatWork(), // todo wechat
};

/* eslint-disable no-underscore-dangle*/
window.__DEVICE__ = DEVICE;
window.__PLATFORM__ = PLATFORM;

window.__device__ = {
  desktop: !checkIsMobile(),
  mobile: checkIsMobile(),
};

window.__platform__ = {
  dingtalk: checkIsInDingtalk(),
  wechat: checkIsInWechat(),
  wechatwork: checkIsInWechatWork(),
  web: !checkIsInDingtalk() && !checkIsInWechat() && !checkIsInWechatWork(),
};
/* eslint-enable*/
