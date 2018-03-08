import isObject from 'lodash/isObject'
import isFunction from 'lodash/isFunction'
import assign from 'lodash/assign'
import compact from 'lodash/compact'

var receiveQueue = []

function parse(data) {
  try {
    return JSON.parse(data)
  } catch (e) {
    return false
  }
}

window.addEventListener('message', function (event) {
  let { data } = event
  let temp
  if (typeof data === 'string') {
    temp = parse(data)
    if (isObject(temp)) {
      data = temp
    }
  }
  receiveQueue.forEach(cb => cb(data, event))
}, false)

/**
 * 发送消息
 * @param type 消息类型,例如：knowledgemap_add_ref->新增前后置关系；knowledgemap_delete_ref->删除前后置关系
 * @param data 发送的参数，json格式
 * @param win  window 对象, 为假则取 parent 和 opener
 */
function sendMessage(type, data, win) {
  let wins
  if (!isObject(win)) {
    let { parent, opener } = window
    wins = [parent, opener]
  } else {
    wins = [win]
  }
  let params = JSON.stringify(assign({
    type
  }, data))
  compact(wins).forEach(win => win.postMessage(params, '*'))
}

export function sendOf(win) {
  return function (type, data) {
    return sendMessage(type, data, win)
  }
}

export function registerReceive(callback) {
  if (isFunction(callback)) {
    callback = [callback]
  }

  receiveQueue = receiveQueue.concat(callback)
  console.log('registerReceive callback number=' + receiveQueue.length)
  return callback
}

export function unregisterReceive(callback) {
  const index = receiveQueue.indexOf(callback)
  if (index === -1) {
    return
  }

  receiveQueue.splice(index, 1)
  console.log('unregisterReceive callback number=' + receiveQueue.length)
  return callback
}
