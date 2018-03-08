module.exports = [{
  path: 'distribution/publish-electives',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('../containers/distribution/publish-electives').default);
    });
  },
}, {
  path: 'distribution/publish-electives/publish',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('../containers/distribution/publish-electives/publish-electives').default);
    });
  },
}, {
  path: 'distribution/publish-electives/selection-user',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('../containers/distribution/publish-electives/selection-user').default);
    });
  },
}, {
  path: 'distribution/publish-electives/selection-confirm',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('../containers/distribution/publish-electives/selection-confirm').default);
    });
  },
},
];
