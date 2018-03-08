import axios from 'axios'
import url from 'utils/url'

/**
 * 包裹接口版本
 * @param  {string} url 接口地址(不用版本号)
 * @return {string}     包裹接口版本后的字符串
 */
function wrapVersion(url) {
  const VERSION = '/v0.6'
  return `${VERSION}/${url}`
}

/**
 * 获取LC 上所有学科数据
 * @return {Promise} 请求promise
 */
export const getSubjects = function getSubjects() {
  return axios.get(url.lifecycle(wrapVersion('categories/$S/datas?words=&&limit=(0,500)')))
}
