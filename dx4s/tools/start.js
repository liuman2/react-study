const inquirer = require('inquirer');
const proxyConfig = require('./proxyConfig');

inquirer.prompt([{
  type: 'list',
  name: 'device',
  message: '请选择应用运行的设备环境',
  choices: [
    'mobile',
    'desktop',
  ],
}, {
  type: 'list',
  name: 'RTE',
  message: '请选择服务端运行环境',
  choices: [
    'dev',
    'local',
    'pre',
    'pro',
    'jst',
  ],
}]).then((answers) => {
  const proxy = proxyConfig[answers.RTE];
  if (answers.device === 'desktop') {
    process.argv.push('--desktop');
  }

  const server = require('./server'); // eslint-disable-line

  server(proxy);
});
