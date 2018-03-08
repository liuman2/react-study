// webpack module
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config');
const { chalkSuccess, chalkWarning } = require('./chalkConfig');
const argv = require('yargs').argv;
const ip = require('ip').address();

// webpack dev server options
const devServerOptions = {
  disableHostCheck: true,
  contentBase: webpackConfig.output.path,
  hot: true,
  historyApiFallback: false,
  noInfo: false,
  quiet: false,
  stats: webpackConfig.stats,
};

module.exports = (proxy) => {
  const isDesktop = !!argv.desktop;
  const port = isDesktop ? 9998 : 9999;
  const publicPath = `http://${ip}:${port}/`;

  devServerOptions.proxy = proxy;
  devServerOptions.publicPath = publicPath;
  webpackConfig.output.publicPath = publicPath;
  webpackConfig.entry.main = [...new Set([
    `webpack-dev-server/client?${publicPath}`,
    'webpack/hot/dev-server',
  ].concat(webpackConfig.entry.main))];

  const compiler = webpack(webpackConfig);
  // run
  const server = new WebpackDevServer(compiler, devServerOptions);


  server.listen(port, ip, () => {
    const message = `[${chalkSuccess('INFO')}] Server run at ${chalkWarning(publicPath)}`;
    console.log(message); // eslint-disable-line
  });
};

