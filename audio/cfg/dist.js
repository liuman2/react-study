const path = require('path')
const merge = require('webpack-merge')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const baseConfig = require('./base')

module.exports = merge(baseConfig, {
  entry: {
    app: path.join(__dirname, '../src/main/app/index'),
    vendor: ['react', 'react-player', 'react-dnd', 'plupload']
  },
  cache: false,
  debug: false,
  devtool: false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/main/app/index.html'),
      inject: 'body',
      chunks: ['vendor', 'app']
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true
      },
      output: {
        comments: false
      }
    }),
    new webpack.NoErrorsPlugin()
  ]
})
