import urlParam from 'utils/urlParam';
import authInDingTalk from './dingtalk/auth';
import authIn3rd from './other/auth';

/**
 *
 * @param config 各种ID，如钉钉下的corpId,appId
 * @param options
 * @return {Promise}
 */
export default function (config, options) {
  const appId = urlParam('appid');
  const corpId = urlParam('corpid');
  if (appId && corpId) return authInDingTalk(config, options).then(({ data }) => data);
  return authIn3rd(config).then(({ data }) => data);
}
