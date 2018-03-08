const path = require('path');
const webpack = require('webpack');
const argv = require('yargs').argv;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const dxEnv = argv.dxEnv || 'localhost';
const isDebug = !argv.release;
const isVerbose = !!argv.verbose;
const isAnalyze = !!argv.analyze || !!argv.analyse;
const isDesktop = !!argv.desktop;

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify(isDebug ? 'development' : 'production'),
  __DEV__: isDebug,
  __dxEnv__: JSON.stringify(dxEnv),
  'typeof global': JSON.stringify('undefined'),
};

const publicPath = {
  localhost: '/',
  dev: '/dev/',
  local: '/local/',
  pre: '/pre/',
  prod: '/',
  jst: '/',
};

const config = {
  context: path.resolve(__dirname, '..'),

  resolve: {
    extensions: ['.js', '.jsx', '.css', '.styl', 'png', 'jpg', 'jpeg', 'gif', 'ico'],
    alias: {
      styles: path.resolve(__dirname, '../src/styles'),
      img: path.resolve(__dirname, '../src/img'),
      components: path.resolve(__dirname, '../src/components'),
      hocs: path.resolve(__dirname, '../src/hocs'),
      utils: path.resolve(__dirname, '../src/utils'),
      dxActions: path.resolve(__dirname, '../src/dxActions'),
      dxConstants: path.resolve(__dirname, '../src/dxConstants'),
      dxReducers: path.resolve(__dirname, '../src/dxReducers'),
      dxSelectors: path.resolve(__dirname, '../src/dxSelectors'),
      dxConfig: path.resolve(__dirname, '../src/dxConfig'),
      i18n: path.resolve(__dirname, '../src/i18n'),
      'videojs-contrib-hls': path.resolve(__dirname, '../node_modules/videojs-contrib-hls/dist/videojs-contrib-hls.js'),
    },
    modules: [path.resolve(__dirname, '../node_modules')],
  },

  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: publicPath[dxEnv],
    pathinfo: isVerbose,
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, '../src'),
        ],
        loader: 'babel-loader',
        query: {
          cacheDirectory: isDebug,
        },
      },
      {
        test: /\.styl$/,
        include: [
          path.resolve(__dirname, '../src'),
        ],
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDebug,
              localIdentName: isDebug ? '[name]-[local]-[hash:base64:5]' : '[hash:base64:5]',
              minimize: !isDebug,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDebug,
              config: {
                path: './tools/postcss.config.js',
              },
            },
          },
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: isDebug,
              preferPathResolver: 'webpack',
              import: [
                isDesktop ?
                  path.resolve(__dirname, '../src/styles/desktop/helpers/index.styl') :
                  path.resolve(__dirname, '../src/styles/helpers/index.styl'),
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDebug,
              localIdentName: isDebug ? '[name]-[local]-[hash:base64:5]' : '[hash:base64:5]',
              minimize: !isDebug,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDebug,
              config: {
                path: './tools/postcss.config.js',
              },
            },
          },
        ],
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file-loader',
        query: {
          name: isDebug ? 'static/[path][name].[ext]?[hash:8]' : 'static/[hash:8].[ext]',
        },
      },
    ],
  },

  // Don't attempt to continue if there are any errors.
  bail: !isDebug,

  cache: isDebug,

  stats: {
    assets: isVerbose,
    colors: true,
    reasons: isDebug,
    hash: isVerbose,
    version: isVerbose,
    timings: true,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose,
  },
};

//
// Configuration for the client-side bundle (client.js)
// -----------------------------------------------------------------------------

const clientConfig = {
  ...config,

  target: 'web',

  entry: {
    main: [
      'babel-polyfill',
      ...isDesktop ? [
        path.resolve(__dirname, '../src/pages/desktop/main.jsx'),
      ] : [
        path.resolve(__dirname, '../src/pages/mobile/main.jsx'),
      ],
    ],
  },

  output: {
    ...config.output,
    filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
    chunkFilename: isDebug ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
  },

  plugins: [
    new webpack.DefinePlugin(GLOBALS),

    new webpack.ProvidePlugin({
      videojs: "video.js",
      "window.videojs": "video.js"
    }),

    new webpack.LoaderOptionsPlugin({
      minimize: !isDebug,
      debug: isDebug
    }),

    new HtmlWebpackPlugin({
      template: 'src/tmpl/index.ejs',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: !isDebug,
        useShortDoctype: !isDebug,
        removeEmptyAttributes: !isDebug,
        removeStyleLinkTypeAttributes: !isDebug,
        keepClosingSlash: !isDebug,
        minifyJS: !isDebug,
        minifyCSS: !isDebug,
        minifyURLs: !isDebug,
      },
      inject: true,
    }),

    ...isDebug ? [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
    ] : [
      new CleanWebpackPlugin(path.resolve(__dirname, '../dist'), { root: path.resolve(__dirname, '../') }),
      // Minimize all JavaScript output of chunks
      // https://github.com/mishoo/UglifyJS2#compressor-options
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
          screw_ie8: true, // React doesn't support IE8
          warnings: isVerbose,
          unused: true,
          dead_code: true,
        },
        mangle: {
          screw_ie8: true,
        },
        output: {
          comments: false,
          screw_ie8: true,
        },
      }),
    ],

    // Webpack Bundle Analyzer
    // https://github.com/th0r/webpack-bundle-analyzer
    ...isAnalyze ? [new BundleAnalyzerPlugin()] : [],
  ],

  // Choose a developer tool to enhance debugging
  // http://webpack.github.io/docs/configuration.html#devtool
  devtool: isDebug ? 'cheap-module-source-map' : false,

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  // https://webpack.github.io/docs/configuration.html#node
  // https://github.com/webpack/node-libs-browser/tree/master/mock
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};

module.exports = exports = clientConfig;
