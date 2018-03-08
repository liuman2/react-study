/**
 * entry of index
 */
import 'styles/desktop.styl';
import init from 'utils/init';

import { ready as readyForDingtalk } from 'utils/3rd/dingtalk/pc';

const asyncInit = () => new Promise((fulfill) => {
  require.ensure([], (require) => {
    const renderInit = require('./renderWithIntl').default;

    fulfill(renderInit);
  });
});

init() // 为不同浏览器做一些初始化设置
  .then(readyForDingtalk) // 如果在钉钉下加载钉钉sdk并进行免登
  .then(asyncInit) // 获取路由(React-Router)入口
  .then(render => render()); // 调用获取到的入口并attach到div#root下

if (module.hot) module.hot.accept('./renderWithIntl', () => asyncInit.then(render => render()));
