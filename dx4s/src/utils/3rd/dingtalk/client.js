import { loadIfNotExits } from 'utils/async-load-script';

const DINGTALK_MOBILE_CLIENT_SRC = 'https://g.alicdn.com/dingding/open-develop/1.0.0/dingtalk.js';
const DINGTALK_DESKTOP_CLIENT_SRC = 'https://g.alicdn.com/dingding/dingtalk-pc-api/2.7.0/index.js';

export function getDingTalkPCClient() {
  return loadIfNotExits(DINGTALK_DESKTOP_CLIENT_SRC, 'DingTalkPC');
}

export function getDingTalkMobileClient() {
  return loadIfNotExits(DINGTALK_MOBILE_CLIENT_SRC, 'dd');
}

export default function getDingTalkClient() {
  if (__PLATFORM__.DINGTALKPC) return getDingTalkPCClient();
  if (__PLATFORM__.DINGTALK) return getDingTalkMobileClient();
  return Promise.resolve();
}
