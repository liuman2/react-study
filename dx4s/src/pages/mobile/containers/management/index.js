import connect from '../../connect';
import './management.styl';
/* 管理中心首页*/
import Management from './management';
/* 试卷列表*/
import ManagementExamList from './exam-list';
/* 试卷详情*/
import ManagementExamDetail from './exam-detail';
/* 课程列表*/
import ManagementCourseList from './course-list';
/* 新建课程引导页*/
import ManagementCourseGuid from './course-guid';
/* 新建试卷引导页*/
import ManagementExamGuid from './exam-guid';
/* 部门简报引导页*/
import ManagementReportGuid from './report-guid';

export default connect(Management);
export { ManagementExamList };
export { ManagementExamDetail };
export { ManagementCourseList };
export { ManagementCourseGuid };
export { ManagementExamGuid };
export { ManagementReportGuid };
