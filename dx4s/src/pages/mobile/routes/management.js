module.exports = [
  {
    /* 管理中心首页*/
    path: 'management',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/management').default);
      });
    },
  },
  {
    /* 试卷列表*/
    path: 'management/exams',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/management').ManagementExamList);
      });
    },
  },
  {
    /* 试卷详情*/
    path: 'management/exams/quiz/:quiz_id/plan/:plan_id',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/management').ManagementExamDetail);
      });
    },
  },
  {
    /* 课程列表*/
    path: 'management/courses',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/management').ManagementCourseList);
      });
    },
  },
  {
    /* 课程引导页*/
    path: 'management/course/guid',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/management').ManagementCourseGuid);
      });
    },
  },
  {
    /* 试卷引导页*/
    path: 'management/exam/guid',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/management').ManagementExamGuid);
      });
    },
  },
  {
    /* 部门简报引导页*/
    path: 'management/report/guid',
    getComponent(nextState, cb) {
      require.ensure([], (require) => {
        cb(null, require('../containers/management').ManagementReportGuid);
      });
    },
  },
];
