
const router = {
  path: 'ddguide/step',
  getComponent: (nextState, cb) => {
    require.ensure([], (require) => {
      cb(null, require('../components/DDGuide/step').default);
    });
  },
};

module.exports = router;
