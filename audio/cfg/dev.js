const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const baseConfig = require('./base')

module.exports = merge(baseConfig, {
  entry: {
    'webpack-hot-middleware/client?reload=true': 'webpack-hot-middleware/client?reload=true',
    app: path.join(__dirname, '../src/main/app/index'),
    vendor: ['react', 'react-player', 'react-dnd', 'plupload']
  },
  cache: true,
  devtool: 'inline-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/main/app/index.html'),
      inject: 'body',
      chunks: ['vendor', 'app', 'webpack-hot-middleware/client?reload=true']
    })
  ]
})
