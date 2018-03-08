/* eslint no-console:0 */
process.env.NODE_ENV = 'development'

const path = require('path')
const express = require('express')
const webpack = require('webpack')
const config = require('./webpack.config')
const defaultConfig = require('./cfg/defaults')

const rewriteJson = require('./mock/routes.json')

/**
 * Flag indicating whether webpack compiled for the first time.
 * @type {boolean}
 */
let app = express()

const compiler = webpack(config)

app.use(express.static(path.join(__dirname, './src/main/webapp')))

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}))

app.use(require('webpack-hot-middleware')(compiler))

if (process.argv.join(' ').indexOf(' --mock') > 0) {
  const jsonServer = require('json-server')
  let router = jsonServer.router('./mock/db.json')
  let middlewares = jsonServer.defaults()
  let rewriter = jsonServer.rewriter(rewriteJson)
  app.use(middlewares)
  app.use(rewriter)
  app.use(router)
}

app.listen(defaultConfig.port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log(`Listening at http://localhost:${defaultConfig.port}`)
})
