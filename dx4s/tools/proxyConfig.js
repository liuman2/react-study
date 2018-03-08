module.exports = {
  dev: {
    '/training/*': {
      target: 'http://dev-ms.xm.duoxue:5555',
      pathRewrite: { '^/training': '/elearning-training' },
    },
    '/account/*': {
      target: 'http://dev-ms.xm.duoxue:5555',
      pathRewrite: { '^/account': '/elearning-account' },
    },
    '/mall/*': {
      target: 'http://dev-ms.xm.duoxue:5555',
    },
    '/elearning-report/*': {
      target: 'http://dev-ms.xm.duoxue:5555',
    },
  },
  local: {
    '/training/*': {
      target: 'http://local-ms.xm.duoxue:5555',
      pathRewrite: { '^/training': '/elearning-training' },
      changeOrigin: true,
    },
    '/account/*': {
      target: 'http://local-ms.xm.duoxue:5555',
      pathRewrite: { '^/account': '/elearning-account' },
      changeOrigin: true,
    },
    '/mall/*': {
      target: 'http://local-ms.xm.duoxue:5555',
      changeOrigin: true,
    },
    '/elearning-report/*': {
      target: 'http://local-ms.xm.duoxue:5555',
      changeOrigin: true,
    },
  },
  pre: {
    '/training/*': {
      target: 'http://pre-api.91yong.com:5555',
      pathRewrite: { '^/training': '/elearning-training' },
    },
    '/account/*': {
      target: 'http://pre-api.91yong.com:5555',
      pathRewrite: { '^/account': '/elearning-account' },
    },
    '/mall/*': {
      target: 'http://pre-api.91yong.com:5555',
    },
    '/elearning-report/*': {
      target: 'http://pre-api.91yong.com:5555',
    },
  },
  pro: {
    '/training/*': {
      target: 'http://e.91yong.com:5555',
      pathRewrite: { '^/training': '/elearning-training' },
    },
    '/account/*': {
      target: 'http://e.91yong.com:5555',
      pathRewrite: { '^/account': '/elearning-account' },
    },
    '/mall/*': {
      target: 'http://e.91yong.com:5555',
    },
    '/elearning-report/*': {
      target: 'http://e.91yong.com:5555',
    },
  },
  jst: {
    '/training/*': {
      target: 'http://116.62.105.228/5555',
      pathRewrite: { '^/training': '/elearning-training' },
    },
    '/account/*': {
      target: 'http://116.62.105.228/5555',
      pathRewrite: { '^/account': '/elearning-account' },
    },
    '/mall/*': {
      target: 'http://116.62.105.228/5555',
    },
    '/elearning-report/*': {
      target: 'http://116.62.105.228/5555',
    },
  },
};
