
function initIntlPolyfill(callback) {
  if (!window.Intl) {
    require.ensure([
      'intl',
      'intl/locale-data/jsonp/en.js',
      'intl/locale-data/jsonp/zh.js',
    ], (require) => {
      window.Intl = require('intl');
      require('intl/locale-data/jsonp/en');

      require('intl/locale-data/jsonp/zh');

      callback();
    });
  } else {
    callback();
  }
}

export default () => new Promise((resolve) => {
  initIntlPolyfill(() => {
    require.ensure([], (require) => {
      require('./render').default();

      resolve();
    });
  });
});
