/**
 * 管理中心
 */

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setTitle } from 'utils/dx/nav';
import './management.styl';
import Footer from '../../components/footer';
import ManagementHeader from './header';
import ManagementSection from './section';
import * as apis from '../../apis';

class Management extends Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      index: 1,
      name: '',
      size: 3,
      reports: {},
      plans: [],
      exams: [],
      plansTotal: 0,
      departmentTotal: 0,
      examTotal: 0,
    };
  }

  componentDidMount() {
    /* 已发必修*/
    this.getPlans();
    /* 部门简报*/
    this.getReportInfo();
    /* 试卷成绩*/
    this.getExamList();
  }

  async getPlans() {
    const { index, name, size } = this.state;
    const planWithTotal = await apis.getPlansWithTotal({ index, name, size });
    this.setState(Object.assign({}, this.state, {
      plans: planWithTotal.items,
      plansTotal: planWithTotal.total,
    }));
  }

  async getReportInfo() {
    const reportInfo = await apis.getDepartmentReports();
    this.setState(Object.assign({}, this.state, {
      reports: {
        loginNum: reportInfo.lw_login_num,
        onlineRate: reportInfo.lw_active_rate,
        onlineTime: reportInfo.lw_average_online_time,
        message: reportInfo.message,
        jobNum: reportInfo.on_job_num,
      },
      departmentTotal: reportInfo.department_num,
    }));
  }

  async getExamList() {
    const { index, name, size } = this.state;
    const examList = await apis.getExamScoreList({ index, name, size });
    this.setState(Object.assign({}, this.state, {
      exams: examList.items,
      examTotal: examList.total,
    }));
  }

  render() {
    setTitle({ title: this.context.intl.messages['app.management.title'] });
    return (
      <div className="management">
        <ManagementHeader />
        <ManagementSection
          type="report"
          total={this.state.departmentTotal || 0}
          reports={this.state.reports}
        />
        <ManagementSection
          type="required"
          total={this.state.plansTotal || 0}
          items={this.state.plans}
        />
        <ManagementSection
          type="exam"
          total={this.state.examTotal || 0}
          items={this.state.exams}
        />
        <Footer />
      </div>
    );
  }
}

Management.contextTypes = {
  intl: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Object.assign({}),
    dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Management);
