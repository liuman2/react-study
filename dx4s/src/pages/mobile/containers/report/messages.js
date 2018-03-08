export default {
  // 个人简报
  myTitle: { id: 'app.report.my.title', zh: '我的简报', en: 'My Briefing' },
  otherTitle: { id: 'app.report.my.otherTitle', zh: '的简报', en: ' Briefing' },
  finishRequiredRate: { id: 'app.report.my.finishRequiredRate', zh: '必修微课完成率：', en: 'Completion rate of Required courses' },
  receivedCourse: {
    id: 'app.report.myReport.receivedCourse',
    zh: '接收: {receivedNum, number} 门',
    en: 'Received: {receivedNum, number} courses',
  },
  finishedCourse: {
    id: 'app.report.myReport.finishedCourse',
    zh: '完成: {finishedNum, number} 门',
    en: 'Completion: {finishedNum, number} courses',
  },
  rankHeader: { id: 'app.report.myReport.rankHeader', zh: '公司完成率排行榜', en: 'Company Completion rate Ranking' },
  rankInCompany: { id: 'app.report.myReport.rankInCompany', zh: '我在公司排名：', en: 'My ranking In Company：' },
  rankInDept: { id: 'app.report.myReport.rankInDept', zh: '我在部门排名：', en: 'My ranking In Department：' },
  rankInCompanyOther: { id: 'app.report.myReport.rankInCompanyOther', zh: '在公司排名：', en: ' ranking In Company：' },
  rankInDeptOther: { id: 'app.report.myReport.rankInDeptOther', zh: '在部门排名：', en: ' ranking In Department' },
  onlineDays: {
    id: 'app.report.myReport.onlineDays',
    zh: '<span>累计登录：</span><span class="bold">{onlineDays, number} 天</span>',
    en: '<span>Total Login days: </span><span class="bold">{onlineDays, number}</span>',
  },
  onlineTime: {
    id: 'app.report.myReport.onlineTime',
    zh: '<span>累计登录时长：</span><span class="bold">{onlineTime, number} 分钟</span> (仅供参考)',
    en: '<span>Total Login time：</span><span class="bold">{onlineTime, number} min</span> (Just for Reference)',
  },
  deadline: {
    id: 'app.report.myReport.deadline',
    zh: '数据截止时间: {date}',
    en: 'Data deadline: {date}',
  },
  // 个人简报 - 排行榜(部门&公司) - 必修微课完成率
  dept: { id: 'app.report.dept', zh: '部门', en: 'Department' },
  tenant: { id: 'app.report.tenant', zh: '公司', en: 'Company' },
  titleReportList: { id: 'app.report.MyRank.title', zh: '必修微课完成率', en: 'Completion rate of Required courses' },
  rankFinishRate: { id: 'app.report.department.finishRate', zh: '完成率', en: 'Completion rate' },
  rankFlunk: { id: 'app.report.department.rankFlunk', zh: '未上榜', en: 'No data' },
  rankFlunkRate: { id: 'app.report.department.rankFlunkRate', zh: '>0才可上榜', en: 'should > 0' },

  // 部门简报
  titleReport: { id: 'app.report.department.title', zh: '部门简报', en: 'Department Briefing' },
  loginData: { id: 'app.report.department.loginData', zh: '登录数据', en: 'Login Data' },
  learningData: { id: 'app.report.department.learningData', zh: '学习数据', en: 'Learning Data' },
  employedNumber: { id: 'app.report.department.employedNumber', zh: '在岗人数：', en: 'Number of employees：' },
  // 部门简报 - 登录数据
  loginNumber: { id: 'app.report.department.loginNumber', zh: '登录人数', en: 'Login Number' },
  lastWeekLogin: { id: 'app.report.department.lastWeekLogin', zh: '上周登录', en: 'Last week login' },
  lastMonthLogin: { id: 'app.report.department.lastMonthLogin', zh: '上月登录', en: 'Last month login' },
  thisMonthLogin: { id: 'app.report.department.thisMonthLogin', zh: '本月登录', en: 'this month login' },
  notLogged: { id: 'app.report.department.notLogged', zh: '未登录', en: 'Not logged' },
  noData: { id: 'app.report.noData', zh: '暂无数据', en: 'No data' },
  activityRate: { id: 'app.report.department.activityRate', zh: '上线率', en: 'Activity rate' },
  dailyOnlineTime: { id: 'app.report.department.dailyOnlineTime', zh: '日均在线时长', en: 'Daily online time' },
  tips: { id: 'app.report.DeptReport.tipOnlineTime', zh: '提示: 在线时长受用户手机影响较大仅供参考', en: 'Hint: Just for Reference' },
  lastWeek: { id: 'app.report.department.lastWeek', zh: '上周', en: 'Last week' },
  lastMonth: { id: 'app.report.department.lastMonth', zh: '上月', en: 'Last month' },
  thisMonth: { id: 'app.report.department.thisMonth', zh: '本月', en: 'This month' },
  minute: { id: 'app.report.department.minute', zh: ' 分钟', en: ' min' },
  // 部门简报 - 学习数据
  finishRate: { id: 'app.report.department.finishRate', zh: '完成率', en: 'Completion rate' },
  receivedCourseCount: { id: 'app.report.department.receivedCourseCount', zh: '累计接收必修微课', en: 'Reviced Required courses' },
  finishCourseCount: { id: 'app.report.department.finishCourseCount', zh: '累计完成必修微课', en: 'Completed Required courses' },
  courseUnit: { id: 'app.report.department.courseUnit', zh: '门', en: ' courses' },
  receivedCourseCountParam: {
    id: 'app.report.department.receivedCourseCountParam',
    zh: '接收{received_course_count, number}门',
    en: 'Received {received_course_count, number} courses',
  },
  // 部门简报 - 未登录
  titleDeptNotLogged: { id: 'app.report.DeptNotLogged.title', zh: '未登录学员', en: 'Not logged student' },
  notEntry: { id: 'app.report.department.notEntry', zh: '未入职', en: 'Not entry' },
  // 部门简报 - 部门排行
  titleDeptRank: { id: 'app.report.deptRank.title', zh: '部门上线率排行', en: 'Department Activity rate Ranking' },
  employedNumberParam: {
    id: 'app.report.deptRank.employedNumberParam',
    zh: '在岗{onJonNum, number}人',
    en: 'Number of employees: {onJonNum, number}',
  },
};
