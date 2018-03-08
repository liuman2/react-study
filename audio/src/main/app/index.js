
import globalConfig from './config'
import $script from 'scriptjs'
import './utils/browser-test'
import { getUrlParams } from './utils/url'
import { requireAuth } from '../app/modules/autologin/auth-require'
import { storeUserInfo } from '../app/modules/courseware-audio-editer/actions/userinfo-action-creator'
import 'babel-polyfill'
const isH5 = window.UAInfo.client.Mobile
if (typeof global.Promise === 'undefined') {
  require.ensure([], function () {
    require('es6-promise/auto')
  })
}

if (isH5) {
  require('./polyfill/changeToRem')
  require('theme/styles/style-h5.css')
  require('theme/styles/style-h5-custom.css')
} else {
  require('theme/styles/app.css')
  require('theme/styles/styles.css')
}

// 挂载全局配置
global.global_uc_version = globalConfig.uc_personal_web.global_uc_version

const React = require('react')
const render = require('react-dom').render
const Provider = require('react-redux').Provider
const syncHistoryWithStore = require('react-router-redux/lib/sync').default
const configureStore = require('./store/configureStore')
const routerHistory = require('react-router').useRouterHistory
const createHistory = require('history').createHashHistory
const store = configureStore()
// 移除react-router自动添加的_k=xxx参数
const hashHistory = routerHistory(createHistory)({ queryKey: false })
const history = syncHistoryWithStore(hashHistory, store)
// 初始化 axios 配置和拦截器
const httpCustom = require('utils/http')
const {adaptProtocol} = require('utils/url')
const config = require('config')
const routes = require(`./routes/${isH5 ? 'h5' : 'web'}`)
httpCustom.init(config)

if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, 'assign', {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict'
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object')
      }

      var to = Object(target)

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index]

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey]
            }
          }
        }
      }
      return to
    },
    writable: true,
    configurable: true
  })
}

$script('//cdncs.101.com/v0.1/static/uc_cdn/ucManager.min.v0.11.js', function () {
  window.getCustomAuth = function (url, method) {
    return window.JsMAF.getAuthHeader(adaptProtocol(url), method)
  }

  const done = () => {
    render((
      <Provider store={store}>
        {routes(history, store)}
      </Provider>
    ), document.getElementById('app'))
  }

  requireAuth(getUrlParams()['__mac']).then(userInfo => {
    store.dispatch(storeUserInfo(userInfo))
    done()
  }, errObj => {
    done()
  })
})
