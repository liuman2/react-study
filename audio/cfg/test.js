'use strict';

let path = require('path');
let srcPath = path.join(__dirname, '../src/main/app');

// Add needed plugins here

module.exports = {
  devtool: 'inline-source-map',
  module: {
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'isparta-instrumenter-loader',
        include: [path.join(__dirname, '../src/main/app')]
      }
    ],
    loaders: [
      {
        test: /\.css$/,
        exclude: path.resolve(__dirname, '../src/main/app/theme/styles'),
        loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[local]!postcss-loader'
      }, {
        test: /\.css$/,
        include: path.resolve(__dirname, '../src/main/app/theme/styles'),
        loader: 'style-loader!css-loader!postcss-loader'
      }, {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: [].concat([
          path.join(__dirname, '../src/main/app'),
          path.join(__dirname, '../src/main/test')
        ])
      }
    ]
  },
  resolve: {
    extensions: [
      '', '.js', '.jsx'
    ],
    alias: {
      config: `${srcPath}/config.js`,
      i18n: `${srcPath}/i18n/`,
      modules: `${srcPath}/modules/`,
      routes: `${srcPath}/routes/`,
      static: `${srcPath}/static/`,
      store: `${srcPath}/store/`,
      theme: `${srcPath}/theme/`,
      utils: `${srcPath}/utils/`,
      'react/lib/ReactMount': 'react-dom/lib/ReactMount',
      helpers: path.join(__dirname, '../src/main/test/helpers')
    }
  },
  externals: {
    'cheerio': 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  }
};
