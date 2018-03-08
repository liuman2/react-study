module.exports = {
  path: 'info-collection',
  getIndexRoute(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, {
        component: require('../containers/InfoCollection/list').default,
      });
    });
  },
  getChildRoutes(partialNextState, cb) {
    require.ensure([], (require) => {
      cb(null, [
        { path: ':id', component: require('../containers/InfoCollection/form').default },
      ]);
    });
  },
};
