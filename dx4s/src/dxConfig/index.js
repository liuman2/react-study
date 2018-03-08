/* eslint-disable no-undef, global-require, import/no-mutable-exports  */
let config = {};

if (__dxEnv__ === 'dev') {
  config = require('./dev');
} else if (__dxEnv__ === 'local') {
  config = require('./local');
} else if (__dxEnv__ === 'pre') {
  config = require('./pre');
} else if (__dxEnv__ === 'prod') {
  config = require('./prod');
} else if (__dxEnv__ === 'jst') {
  config = require('./jst');
} else if (__dxEnv__ === 'localhost') {
  config = require('./localhost');
}

export default config;
