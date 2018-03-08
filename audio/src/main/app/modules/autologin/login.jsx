import axios from 'axios'
import url from 'utils/url'
import { uc_personal_web as ucPersonalWeb } from '../../config'

export function getUserInfo() {
  return window.ucManager.getUserInfo()
}

export function autoLogin(auth) {
  let mac = atob(decodeURIComponent(auth))
  let accessToken = mac.substring(mac.lastIndexOf('id=') + 4, mac.lastIndexOf(',nonce=') - 1)
  let postData = {
    mac: mac.substring(mac.lastIndexOf('mac=') + 5, mac.length - 1),
    nonce: mac.substring(mac.lastIndexOf('nonce=') + 7, mac.lastIndexOf(',mac=') - 1),
    http_method: 'GET',
    request_uri: window.location.pathname,
    host: window.location.host
  }

  return requestValid(accessToken, postData).then(function ({ data }) {
    console.log('requestValid success:')
    console.log(data)
    return window.ucManager.thirdLoginSSO(data.access_token, data.refresh_token, data.mac_key, data.user_id)
  }).then(res => {
    console.log('thirdLoginSSO:')
    console.log(res)
    // const href = window.location.href
    // const newHref = removeHrefParams(href, '__mac')
    // if (!isEqual(href, newHref)) {
    //   window.location.href = newHref
    // }
    return res === 'success'
  }).catch(errObj => {
    return Promise.reject(errObj)
  })
}

/**
 * 跳转到 UC 单点登录页面
 * @return {undefined} 无
 */
export function toLogin() {
  const links = [ucPersonalWeb.host, ucPersonalWeb.login, `?app_id=${ucPersonalWeb.app_id}`, `&callback_url=${url.adaptProtocol(ucPersonalWeb.login_success_url)}`]
  if (global && global.location) {
    global.location.href = links.join('')
  }
}

function requestValid(accessToken, postData) {
  return axios.post(url.uc(`/v0.93/tokens/${accessToken}/actions/valid`), postData, {
    unAuth: true
  })
}
