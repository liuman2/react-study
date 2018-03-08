const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

let path = require('path')
let defaultSettings = require('./defaults')

module.exports = {
  port: defaultSettings.port,
  debug: true,
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, '../src/main/webapp/app'),
    filename: '[name]-[hash:8].js',
    chunkFilename: 'chunk-[name]-[hash:8].js',
    publicPath: defaultSettings.publicPath
  },
  devServer: {
    contentBase: './src/main/app',
    historyApiFallback: true,
    hot: true,
    port: defaultSettings.port,
    publicPath: defaultSettings.publicPath,
    noInfo: false
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      app: `${defaultSettings.srcPath}/`,
      config: `${defaultSettings.srcPath}/config.js`,
      i18n: `${defaultSettings.srcPath}/i18n/`,
      modules: `${defaultSettings.srcPath}/modules/`,
      routes: `${defaultSettings.srcPath}/routes/`,
      static: `${defaultSettings.srcPath}/static/`,
      store: `${defaultSettings.srcPath}/store/`,
      theme: `${defaultSettings.srcPath}/theme/`,
      utils: `${defaultSettings.srcPath}/utils/`,
      components: `${defaultSettings.srcPath}/components`,
      'react/lib/ReactMount': 'react-dom/lib/ReactMount'
    }
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    new ExtractTextPlugin('[name].[contenthash:8].css'),
    new webpack.optimize.AggressiveMergingPlugin()
  ],
  module: defaultSettings.getDefaultModules()
}
