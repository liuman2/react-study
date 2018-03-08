module.exports = [
  {
    path: 'report/my',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/report/MyReport').default);
      });
    },
  },
  {
    path: 'report/my-rank',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/report/MyRank').default);
      });
    },
  },
  {
    path: 'report/other',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/report/OtherReport').default);
      });
    },
  },
  {
    path: 'report/dept',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/report/DeptReport').default);
      });
    },
  },
  {
    path: 'report/dept-not-logged/:dept_id',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/report/DeptNotLogged').default);
      });
    },
  },
  {
    path: 'report/dept-rank',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/report/DeptRank').default);
      });
    },
  },
];
