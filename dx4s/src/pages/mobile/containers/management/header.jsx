import React, { PropTypes } from 'react';
import { Link } from 'react-router';

class ManagementHeader extends React.Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  render() {
    return (
      <ul className="header">
        <li>
          {/* 发必修*/}
          <Link className="required" to="/distribution/required">{this.context.intl.messages['app.management.header.required']}</Link>
        </li>
        <li>
          {/* 发选修*/}
          <Link className="elective" to="/distribution/publish-electives">{this.context.intl.messages['app.management.header.elective']}</Link>
        </li>
        <li>
          {/* 课程管理*/}
          <Link className="course" to="/management/courses">{this.context.intl.messages['app.management.header.course']}</Link>
        </li>
        <li>
          {/* 试卷管理*/}
          <Link className="exam" to="/management/exams">{this.context.intl.messages['app.management.header.exam']}</Link>
        </li>
      </ul>
    );
  }
}

export default ManagementHeader;
