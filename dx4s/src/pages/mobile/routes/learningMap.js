module.exports = {
  path: 'learningMap',
  getIndexRoute(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, {
        component: require('../containers/learningMap/indexMap').default,
      });
    });
  },
  getChildRoutes(partialNextState, cb) {
    require.ensure([], (require) => {
      cb(null, [
        { path: 'route/:route_id', component: require('../containers/learningMap/routeDetail').default },
        { path: 'studyMap/:phase_id', component: require('../containers/learningMap/studyMap').default },
      ]);
    });
  },
};
