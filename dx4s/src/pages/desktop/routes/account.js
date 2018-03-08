module.exports = [
  {
    path: 'account',
    getIndexRoute(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, {
          component: require('../containers/account/signIn').default,
        });
      });
    },
    getChildRoutes(partialNextState, cb) {
      require.ensure([], (require) => {
        cb(null, [
          { path: 'signCom', component: require('../containers/account/signCom').default },
          { path: 'forget', component: require('../containers/account/forget').default },
          { path: 'reset', component: require('../containers/account/reset').default },
          { path: 'changePwd', component: require('../containers/account/changePwd').default },
          { path: 'bindPhone', component: require('../containers/account/bindPhone').default },
          { path: 'changeDefaultPwd', component: require('../containers/account/changeDefaultPwd').default },
        ]);
      });
    },
  },
  {
    path: 'join',
    getComponent(nextState, cb) {
      require.ensure([], require =>
        cb(null, require('../containers/account/join').default),
      );
    },
  },
  {
    path: 'join/success',
    getComponent(nextState, cb) {
      require.ensure([],
        require => cb(null, require('../containers/account/join-success').default),
      );
    },
  },
  {
    path: 'join/audit',
    getComponent(nextState, cb) {
      require.ensure([],
        require => cb(null, require('../containers/account/join-audit').default),
      );
    },
  },
];
