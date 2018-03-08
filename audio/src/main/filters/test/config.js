/**
 * Created by Administrator on 2017/2/28.
 */
var config = {
  env: 'test',
  api_host: '//audio-courseware.debug.web.nd',
  uc_server: 'https://ucbetapi.101.com',
  cs_host: '//betacs.101.com',
  lifecycle_server: '//esp-lifecycle.pre1.web.nd',
  ndr_host: '//esp-portal-component.debug.web.nd',
  uc_personal_web: { // uc登录相关的
    global_uc_version: 'pre',
    host: '//uc-personal-web.beta.web.sdp.101.com',
    login: '/passport/login.html', // 登录页面
    app_id: 'assert-portal', // 170151 本地 170152 dev环境  170153 debug环境  170154 integra环境  170155 preprod环境  170156 prod环境
    login_success_url: '//audio-courseware.debug.web.nd/app'
  }
}
if (typeof define === 'function' && define.amd) {
  define('config', [], config)
} else if (typeof exports === 'object') {
  module.exports = config
} else {
  window.config = config
}
