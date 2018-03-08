import getClient from 'utils/3rd/dingtalk/client';

export default async function openLink(url) {
  if (__PLATFORM__.DINGTALK) {
    const client = await getClient();
    client.biz.util.openLink({
      url,
      onSuccess: () => {},
      onFail: () => {},
    });
  } else {
    window.location = url;
  }
}
