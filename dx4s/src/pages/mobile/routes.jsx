import { nav } from 'utils/dx';
import { setting } from 'utils/storage';

import App from './containers/app';


const getQueryString = (name) => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
};

const autoAuth = ({ location }, replace) => {
  const { ticket } = location.query;
  if (ticket) {
    setting.set('ticket', ticket);
    replace(`${location.pathname}`);
  }
};

const Routes = {
  path: '/',
  component: App,
  indexRoute: {
    onEnter: (nextState, replace) => {
      if (__platform__.wechat || __platform__.wechatwork) {
        const state = getQueryString('state');
        const code = getQueryString('code');
        if (state && code) {
          replace(`${state}?code=${code}`);
          return;
        }
      }
      replace(`${nextState.location.pathname}home`);
    },
  },
  onEnter: (nextState, replace) => {
    autoAuth(nextState, replace);
  },
  onChange: () => {
    nav.setTitle();
    nav.setRight();
  },
  childRoutes: [
    ...require('./routes/account_m'),
    require('./routes/DDGuide'),
    require('./routes/WechatWorkGuide'),
    require('./routes/search'),
    require('./routes/home'),
    require('./routes/plans'),
    require('./routes/elective'),
    require('./routes/preview'),
    require('./routes/favorites'),
    require('./routes/series'),
    require('./routes/training'),
    require('./routes/announcement'),
    require('./routes/payment'),
    require('./routes/preview-mall'),
    require('./routes/product-course'),
    require('./routes/product-series'),
    require('./routes/product-live'),
    require('./routes/shopping-cart'),
    require('./routes/order'),
    require('./routes/plan'),
    ...require('./routes/live'),
    ...require('./routes/course'),
    ...require('./routes/exam'),
    ...require('./routes/survey'),
    ...require('./routes/practice'),
    ...require('./routes/profile'),
    ...require('./routes/mall'),
    ...require('./routes/publish-electives'),
    ...require('./routes/distribution'),
    ...require('./routes/account'),
    ...require('./routes/report'),
    require('./routes/info-collection'),
    require('./routes/learningMap'),
    ...require('./routes/management'),
  ],
};

export default Routes;
