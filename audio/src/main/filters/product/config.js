var config = {
  env: 'prod',
  api_host: '//audio-courseware.sdp.101.com',
  uc_server: 'https://aqapi.101.com',
  cs_host: '//cs.101.com',
  lifecycle_server: '//esp-lifecycle.web.sdp.101.com',
  ndr_host: '//esp-portal-component.sdp.101.com', // 新版
  uc_personal_web: { // uc登录相关的
    global_uc_version: 'pro',
    host: '//uc.101.com',
    login: '/passport/login.html', // 登录页面
    app_id: 'assert-portal', // 170151 本地 170152 dev环境  170153 debug环境  170154 integra环境  170155 preprod环境  170156 prod环境
    login_success_url: '//audio-courseware.sdp.101.com/app'
  }
}
if (typeof define === 'function' && define.amd) {
  define('config', [], config)
} else if (typeof exports === 'object') {
  module.exports = config
} else {
  window.config = config
}
