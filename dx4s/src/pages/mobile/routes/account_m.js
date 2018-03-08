module.exports = [
  {
    path: 'account',
    getIndexRoute(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, {
          component: require('../containers/account_m/signIn').default,
        });
      });
    },
    getChildRoutes(partialNextState, cb) {
      require.ensure([], (require) => {
        cb(null, [
          { path: 'signCom', component: require('../containers/account_m/signInCom').default },
          { path: 'forget', component: require('../containers/account_m/forget').default },
          { path: 'changePwd', component: require('../containers/account_m/changePwd').default },
          { path: 'changeDefaultPwd', component: require('../containers/account_m/changeDefaultPwd').default },
          { path: 'bindPhone', component: require('../containers/account_m/bindPhone').default },
        ]);
      });
    },
  },
  {
    path: 'join',
    getComponent(nextState, cb) {
      require.ensure([],
        require => cb(null, require('../containers/account_m/join').default)
      );
    },
  },
  {
    path: 'join/success',
    getComponent(nextState, cb) {
      require.ensure([],
        require => cb(null, require('../containers/account_m/join-success').default)
      );
    },
  },
  {
    path: 'join/audit',
    getComponent(nextState, cb) {
      require.ensure([],
        require => cb(null, require('../containers/account_m/join-audit').default)
      );
    },
  },
];
