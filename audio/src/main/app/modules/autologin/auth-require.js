import { autoLogin, getUserInfo, toLogin } from '../../modules/autologin/login'
import Toast from 'components/toast'
import Loading from '../../components/loading'
import { storeUserInfo } from '../../modules/courseware-audio-editer/actions/userinfo-action-creator'

let _isLogin = false

export function isLogin() {
  if (_isLogin) {
    return Promise.resolve(true)
  }
  return window.ucManager.isLogin().then(res => {
    _isLogin = res === 'true'
    return Promise.resolve(_isLogin)
  }).catch(errorObj => {
    return Promise.resolve(false)
  })
}

/**
 * 自动登录权限校验
 * @return {undefined}          Promise
 */
export function requireAuth(auth) {
  // isLogin().then(R.ifElse(strTrue, () => done(), toLogin))
  // 从ucManager获取当前是否登录
  Loading.open()
  return isLogin().then(res => {
    if (res) {
      return Promise.resolve(true)
    }

    // 开始自动登录
    // const { location: { query: { __mac: auth } } } = nextState
    if (!auth) {
      return Promise.reject(new Error("no mactoken, can't auto login!!"))
    } else {
      return autoLogin(auth).then(isSuccess => {
        return Promise.resolve(isSuccess)
      }).catch(errObj => {
        console.log(errObj)
        return Promise.resolve(false)
      })
    }
  })
  // 最终登录结果
  .then(res => {
    _isLogin = res
    if (res) { // 登录成功
      return _getUserInfo()
    } else { // 登录失败
      Loading.close()
      Toast('登录异常, 请重试')
      return Promise.reject(new TypeError('登录异常, 请重试'))
    }
  }, errObj => {
    Loading.close()
    // 跳转到登录页
    toLogin()
    return Promise.reject(new TypeError('未登录'))
  })
}

function _getUserInfo() {
  return getUserInfo().then(userInfo => {
    // store.dispatch(storeUserInfo(userInfo))
    Loading.close()
    // done()
    return userInfo
  }).catch(errObj => {
    Loading.close()
    Toast('获取用户信息失败!')
    return Promise.reject(new TypeError('获取用户信息失败!'))
  })
}

// function removeHrefParams(href, name) {
//   const startIndex = href.indexOf(name + '=')
//   const arr = href.split('?')
//   if (arr.length > 1 && arr[1].length > 0) {
//     const paramArr = arr[1].split('&')
//     const param = find(paramArr, param => {
//       return param.indexOf(name + '=') === 0
//     })
//     if (param) {
//       return href.replace(param, '')
//     }
//   }
//   return href
// }
