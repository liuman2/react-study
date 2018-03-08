const dispatchUserBeforeEnter = require('./helpers').dispatchUserBeforeEnter;

module.exports = {
  path: 'preview/plan/:plan_id/series/:solution_id/courses/:course_id',
  onEnter: dispatchUserBeforeEnter,
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('../containers/preview').default);
    });
  },
};
