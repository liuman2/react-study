const path = require('path')

const srcPath = path.join(__dirname, '../src/main/app')
const defaultPort = 8096
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const appCssLoader = function (importLoaders = 0, extraLoaders = '') {
  return ExtractTextPlugin.extract('style-loader',
    [`css-loader?modules&importLoaders=${importLoaders}&localIdentName=[name]__[local]-[hash:base64:5]${extraLoaders}`]
  )
}
const nmCssLoader = function (importLoaders = 0, extraLoaders = '') {
  return ExtractTextPlugin.extract('style-loader',
    [`css-loader${extraLoaders}`]
  )
}

function stylesLoadersGen({ test, importLoaders, extraLoaders }) {
  return [
    {
      test,
      include: srcPath,
      exclude: path.join(srcPath, 'theme'),
      loader: appCssLoader(importLoaders, extraLoaders)
    },
    {
      test,
      include: [path.join(srcPath, 'theme'), path.join(__dirname, '../node_modules')],
      loader: nmCssLoader(importLoaders, extraLoaders)
    }
  ]
}

function getDefaultModules() {
  return {
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        include: srcPath,
        loader: 'eslint-loader'
      }
    ],
    loaders: [{
      test: /\.(mp4|ogg|svg)$/,
      loader: 'file-loader'
    }, {
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)\??.*$/,
      loader: 'url?limit=15&name=images/[hash:8].[name].[ext]'
    }, {
      test: /\.(js|jsx)$/,
      loader: 'babel-loader?cacheDirectory',
      include: [path.join(__dirname, '../src/main/app')]
    },
      ...stylesLoadersGen({
        test: /\.css$/
      }),
      ...stylesLoadersGen({
        test: /\.less$/,
        importLoaders: 1,
        extraLoaders: '!less-loader'
      }),
      ...stylesLoadersGen({
        test: /\.scss$/,
        importLoaders: 1,
        extraLoaders: '!sass-loader?outputStyle=expanded'
      })
    ],
    postLoaders: [{
      test: /\.(js|jsx)$/,
      loaders: ['es3ify-loader'],
      include: [
        path.join(__dirname, '../src/main/app'),
        // 重新编译node_modules下的一些库，让他们支持ie8
        path.join(__dirname, '../node_modules/@sdp.nd'),
        path.join(__dirname, '../node_modules/axios'),
        path.join(__dirname, '../node_modules/redux-actions')
      ]
    }]
  }
}

module.exports = {
  srcPath: srcPath,
  port: defaultPort,
  getDefaultModules: getDefaultModules
}
