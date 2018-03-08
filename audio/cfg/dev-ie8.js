const path = require('path')
const merge = require('webpack-merge')
const baseConfig = require('./base')

module.exports = merge(baseConfig, {
  entry: {
    app: path.join(__dirname, '../src/main/app/index')
  },
  cache: true,
  devtool: 'inline-source-map'
})
