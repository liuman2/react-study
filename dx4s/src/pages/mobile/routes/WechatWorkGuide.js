const router = {
  path: 'wxwork',
};

router.getComponent = (nextState, cb) => {
  require.ensure([], (require) => {
    cb(null, require('../containers/wxwork').default);
  });
};

module.exports = router;
