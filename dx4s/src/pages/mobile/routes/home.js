const router = {
  path: 'home',
};

router.getComponent = (nextState, cb) => {
  require.ensure([], (require) => {
    cb(null, require('../containers/home').default);
  });
};

module.exports = router;
