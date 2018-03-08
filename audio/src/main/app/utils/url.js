/**
 * Created by Zhongshan on 2017/7/25.
 */
import config from 'config'
import startsWith from 'lodash/startsWith'

const CS_REF_PATH = '$' + '{ref-path}'

export function api(url) {
  return config.api_host + url
}

export function uc(url) {
  return config.uc_server + url
}

export function lifecycle(url) {
  return config.lifecycle_server + url
}

export function csStatic(path) {
  return `${config.cs_host}/v0.1/static` + path
}

/**
 * 传给server的cs资源地址，host由业务方自己拼接
 * @param {string} path
 */
export function csRef(path) {
  return '$' + '{ref-path}' + path
}

export function delRefPath(serverCsPath) {
  if (!startsWith(serverCsPath, CS_REF_PATH)) {
    return serverCsPath
  }
  const pathStartIndex = serverCsPath.indexOf('/')
  return serverCsPath.substring(pathStartIndex)
}

export function delRefPathWithCsHost(serverCsPath) {
  if (!startsWith(serverCsPath, CS_REF_PATH)) {
    return serverCsPath
  }
  const pathStartIndex = serverCsPath.indexOf('/')
  const path = serverCsPath.substring(pathStartIndex)

  return `${config.cs_host}/v0.1/static` + path
}

export function adaptProtocol(url) {
  let index = url.indexOf('//')
  if (index > -1) {
    url = window.location.protocol + url.substr(index)
  }
  return url
}

/**
 * [description 获取url参数，默认取当前路由参数]
 * @param  {[String]} url [含参数url]
 * @return {[Object]}     [params]
 */
export function getUrlParams(url) {
  const hash = url || window.location.hash
  const params = {}
  const search = hash.substr(hash.indexOf('?') + 1)
  let splitIndex
  if (search) {
    search.split('&').forEach(item => {
      splitIndex = item.indexOf('=')
      if (splitIndex < 0) {
        params[item] = undefined
      } else {
        var key = item.substring(0, splitIndex)
        if (params.hasOwnProperty(key)) {
          if (!Array.isArray(params[key])) {
            params[key] = [params[key]]
          }
          params[key].push(item.substring(splitIndex + 1))
        } else {
          params[key] = item.substring(splitIndex + 1)
        }
      }
    })
  }
  return params
}

/**
 * @param {array} arr 有序数组
 * @param {*} num
 * return 最接近且大于 num
 */
function closeGt(arr, num) {
  var left = 0
  var right = arr.length - 1

  while (left <= right) {
    var middle = Math.floor((right + left) / 2)
    if (right - left <= 1) {
      break
    }
    var val = arr[middle]
    if (val === num) {
      return middle
    } else if (val > num) {
      right = middle
    } else {
      left = middle
    }
  }

  var leftValue = arr[left]
  var rightValue = arr[right]
  // return rightValue - num > num - leftValue ? leftValue : rightValue
  // 取大于num的值
  return rightValue
}
const CS_SIZES = [80, 120, 160, 240, 320, 480, 640, 960, 1080, 1200]
export function getCsThumUrl(url, targetSize) {
  const finalSize = closeGt(CS_SIZES, targetSize)
  if (url.indexOf('?') === -1) {
    return `${url}?size=${finalSize}`
  }
  return `${url}&size=${finalSize}`
}

export default {
  api,
  uc,
  lifecycle,
  csStatic,
  csRef,
  delRefPath,
  delRefPathWithCsHost,
  adaptProtocol,
  getUrlParams
}
