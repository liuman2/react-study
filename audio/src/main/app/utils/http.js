/**
 * Created by Zhongshan on 2017/7/25.
 */
import axios from 'axios'
import { isLogin } from '../modules/autologin/auth-require'
import Loading from '../components/loading'
// 加载模块
let loadingTimer = null
let instance = null

let setLoadingTimer = isLoading => {
  // todo 加载loading方式待改造
  if (loadingTimer) clearTimeout(loadingTimer)
  loadingTimer = setTimeout(() => {
    if (!isLoading && instance) {
      instance.close()
      instance = null
    }
    if (isLoading && !instance) {
      // todo 待改造
      instance = Loading
      instance.open()
    }
  }, 200)
}

// api拦截器模块
axios.interceptors.request.use(config => {
  if (!config.disableLoading) {
    setLoadingTimer(true)
  }

  let url = config.url
  // 请求参数处理
  if (config.params) {
    url += '?'
    for (let key in config.params) {
      // 数组处理
      if (config.params[key] && config.params[key] instanceof Array) {
        for (let param in config.params[key]) {
          url += key + '=' + encodeURI(config.params[key][param]) + '&'
        }
      } else { // 字符串处理
        if (config.params[key] !== undefined) { // 非空
          url += key + '=' + encodeURI(config.params[key]) + '&'
        }
      }
    }
    url = url.substring(0, url.length - 1)
  }
  if (config.unAuth) {
    return Promise.resolve(config)
  } else {
    return isLogin().then(function (isLogin) {
      if (isLogin && config.disabledAuth !== true) {
        Object.assign(config.headers.common, {
          // 'Accept-Language': 'zh_CN',
          'Content-Type': 'application/json',
          'Authorization': window.getCustomAuth(url, config.method)
        })
      }
      return Promise.resolve(config)
    })
  }
}, function (error) {
  setLoadingTimer(false)
  return Promise.reject(error)
})

axios.interceptors.response.use(response => {
  setLoadingTimer(false)
  return response
}, (error) => {
  setLoadingTimer(false)
  if (error.response && error.response.status === 500) {
    showErrorDialog(error)
  }
  return Promise.reject(error)
})

// 500错误提示窗
function showErrorDialog(error) {
  // todo 错误弹窗待补充
  console.log(error)
}

export function init(config) {
  axios.defaults.baseURL = config.api_host
  axios.defaults.timeout = 30000
}
