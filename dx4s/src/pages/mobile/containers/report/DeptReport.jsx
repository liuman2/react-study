import React, { PropTypes, Component } from 'react';
import { locationShape } from 'react-router';
// import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import api from 'utils/api';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import DeptLoginData from './DeptLoginData';
import DeptLeaningData from './DeptLeaningData';
import Tab from '../../components/Tab';
import messages from './messages';
import { setTitle } from 'utils/dx/nav';

import './DeptReport.styl';
import iconSlider from './imgs/icon-slider.png';
import sortAsc from './imgs/sort-asc.png';
import sortDesc from './imgs/sort-desc.png';

class DeptReport extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      view: this.props.location.query.type || 'login',
      depts: [],
      sort: 'asc',
      sortSrc: sortAsc,
    };
    this.onClickTab = :: this.onClickTab;
    this.onClickDept = ::this.onClickDept;
    this.onClickSort = :: this.onClickSort;
    this.renderLoginData = ::this.renderLoginData;
    this.renderLearningData = ::this.renderLearningData;
  }

  componentDidMount() {
    setTitle({ title: this.getIntl('title') });
    api({
      url: '/training/report/department/brief/get_department_list',
    }).then(({ data }) => {
      const depts = data.map(dept => ({
        id: dept.department_id,
        name: dept.department_name,
      }));
      this.setState({ depts });
      // this.fetchLoginData(depts[0].id);
      // this.fetchLearningData(depts[0].id);
    });
    this.fetchLoginData(this.props.location.query.id);
    this.fetchLearningData(this.props.location.query.id);
  }

  onClickSort(event) {
    event.stopPropagation();
    this.setState({
      sort: this.state.sort === 'asc' ? 'desc' : 'asc',
      sortSrc: this.state.sortSrc === sortAsc ? sortDesc : sortAsc,
    });
  }

  onClickTab(view) {
    this.setState({ view });
    this.context.router.replace({ pathname: 'report/dept', query: { type: view, id: this.props.location.query.id } });
  }

  onClickDept(deptId) {
    this.setState({ display: !this.state.display });
    if (!deptId || String(deptId) === String(this.state.departmentId)) {
      return;
    }
    // this.setState({
    //   departmentId: deptId,
    // });
    this.context.router.replace({ pathname: 'report/dept', query: { type: this.props.location.query.type, id: deptId } });
    this.fetchLoginData(deptId);
    this.fetchLearningData(deptId);
  }

  getIntl = id => this.context.intl.messages[`app.report.department.${id}`]

  fetchLoginData = async (departmentId) => {
    const { data } = await api({
      url: '/training/report/department/brief/get_login_detail',
      params: { department_id: departmentId },
    });
    this.setState({
      departmentId: data.department_id,
      departmentName: data.department_name,
      onJobNum: data.on_job_num, // 在岗人数

      isCanOpen: data.is_can_open, // 是否能够打开部门上线率排行页面
      thisMonthIsNoData: data.tm_is_no_data, // 本月是否暂无数据

      lastWeekPercent: data.lw_active_rate, // 上线率
      lastWeekLoginNum: data.lw_login_num, // 登录人数
      lastWeekLoginNumStatus: data.lw_login_num_status, // 涨幅状态(rising、falling、flat)
      lastWeekNotLoginNum: data.lw_not_login_num, // 未登录人数
      lastWeekOnlineRate: data.lw_active_rate, // 上线率
      lastWeekOnlineTime: data.lw_average_online_time, // 日均在线时长

      lastMonthPercent: data.lm_active_rate, // 上线率
      lastMonthLoginNum: data.lm_login_num, // 登录人数
      lastMonthLoginNumStatus: data.lm_login_num_status, // 涨幅状态(rising、falling、flat)
      lastMonthNotLoginNum: data.lm_not_login_num, // 未登录人数
      lastMonthOnlineRate: data.lm_active_rate, // 上线率
      lastMonthOnlineTime: data.lm_average_online_time, // 日均在线时长

      thisMonthPercent: data.tm_active_rate, // 上线率
      thisMonthLoginNum: data.tm_login_num, // 登录人数
      // thisMonthLoginNumStatus,
      thisMonthNotLoginNum: data.tm_not_login_num, // 未登录人数
      thisMonthOnlineRate: data.tm_active_rate, // 上线率
      thisMonthOnlineTime: data.tm_average_online_time, // 日均在线时长
    });
  };

  fetchLearningData = async (departmentId) => {
    const { data } = await api({
      url: '/training/report/department/brief/get_study_data',
      params: { department_id: departmentId },
    });
    this.setState({
      finishRate: data.finish_rate,
      receivedCourseCount: data.received_course_count,
      finishCourseCount: data.finish_course_count,
    });
  }

  renderLoginData() {
    const {
      departmentId, isCanOpen, thisMonthIsNoData,
      lastWeekPercent, lastWeekLoginNum, lastWeekLoginNumStatus, lastWeekNotLoginNum,
      lastWeekOnlineRate, lastWeekOnlineTime,
      lastMonthPercent, lastMonthLoginNum, lastMonthLoginNumStatus, lastMonthNotLoginNum,
      lastMonthOnlineRate, lastMonthOnlineTime,
      thisMonthPercent, thisMonthLoginNum, thisMonthNotLoginNum,
      thisMonthOnlineRate, thisMonthOnlineTime,
    } = this.state;
    return (
      <DeptLoginData
        departmentId={departmentId}
        isCanOpen={isCanOpen}
        thisMonthIsNoData={thisMonthIsNoData}

        lastWeekPercent={lastWeekPercent}
        lastWeekLoginNum={lastWeekLoginNum}
        lastWeekLoginNumStatus={lastWeekLoginNumStatus}
        lastWeekNotLoginNum={lastWeekNotLoginNum}
        lastWeekOnlineRate={lastWeekOnlineRate}
        lastWeekOnlineTime={lastWeekOnlineTime}

        lastMonthPercent={lastMonthPercent}
        lastMonthLoginNum={lastMonthLoginNum}
        lastMonthLoginNumStatus={lastMonthLoginNumStatus}
        lastMonthNotLoginNum={lastMonthNotLoginNum}
        lastMonthOnlineRate={lastMonthOnlineRate}
        lastMonthOnlineTime={lastMonthOnlineTime}

        thisMonthPercent={thisMonthPercent}
        thisMonthLoginNum={thisMonthLoginNum}
        // thisMonthLoginNumStatus={thisMonthLoginNumStatus}
        thisMonthNotLoginNum={thisMonthNotLoginNum}
        thisMonthOnlineRate={thisMonthOnlineRate}
        thisMonthOnlineTime={thisMonthOnlineTime}
      />);
  }

  renderLearningData() {
    const {
      departmentId, sort,
      finishRate, receivedCourseCount, finishCourseCount,
    } = this.state;
    return (
      <DeptLeaningData
        departmentId={departmentId}
        sort={sort}
        finishRate={finishRate}
        receivedCourseCount={receivedCourseCount}
        finishCourseCount={finishCourseCount}
      />);
  }

  render() {
    const {
      view,
      sortSrc,
      depts,
      display,
      departmentId,
      departmentName,
      onJobNum,
    } = this.state;

    const tabs = [{
      id: 'login',
      name: <FormattedMessage {...messages.loginData} />,
    }, {
      id: 'learning',
      name: <FormattedMessage {...messages.learningData} />,
      sort: view === 'learning' ? <img src={sortSrc} alt="" onClick={this.onClickSort} /> : null,
    }];

    return (
      <div className="report-department">
        <Tab active={view} tabs={tabs} onSwitch={this.onClickTab} />
        <div className="dept" onClick={() => this.setState({ display: !display })}>
          <span>{departmentName}</span>
          <FormattedMessage {...messages.employedNumber} />
          <span>{onJobNum}</span>
          <img src={iconSlider} alt="" />
        </div>
        <div className={classNames('slider', { active: display })}>
          <div className="mask" onClick={() => this.onClickDept()} />
          <ul>
            {
              depts.map((item, index) => (
                <li key={index} onClick={() => this.onClickDept(item.id)} className={String(item.id) === String(departmentId) ? 'active' : ''}>
                  {item.name}
                </li>
              ))
            }
          </ul>
        </div>
        {view === 'login' ? this.renderLoginData() : this.renderLearningData()}
      </div>
    );
  }
}

DeptReport.contextTypes = {
  router: PropTypes.object,
  intl: PropTypes.object,
};

DeptReport.propTypes = {
  location: locationShape,
};

export default DeptReport;









    // const {
    //   departmentId, isCanOpen, TMIsNoData,
    //   LMActivePct, LMAvgOLTime, LMLogNumStatus, LMLogNum, LMNotLogNum,
    //   LWActivePct, LWAvgOLTime, LWLogNumStatus, LWLogNum, LWNotLogNum,
    //   TMActivePct, TMAvgOLTime, TMLogNum, TMNotLogNum, // TWLogNumStatus,
    // } = this.state;

    // const max = Math.max(LWAvgOLTime, LMAvgOLTime, TMAvgOLTime);

    // return (
    //   <div>
    //     <div className="title">
    //       <img src={veinsLeft} role="presentation" />
    //       <span>登录人数</span>
    //       <img src={veinsRight} role="presentation" />
    //     </div>
    //     <div className="circles">
    //       <PercentCircle
    //         trailColor="#c3e6ff" strokeColor="#38acff" loginDate="loginLastWeek"
    //         departmentId={departmentId}
    //         type="lw"
    //         status={LWLogNumStatus}
    //         percent={LWActivePct}
    //         amount={LWLogNum}
    //         unLoggedInNum={LWNotLogNum}
    //       />
    //       <PercentCircle
    //         trailColor="#fcdac7" strokeColor="#f48644" loginDate="loginLastMon"
    //         departmentId={departmentId}
    //         type="lm"
    //         status={LMLogNumStatus}
    //         percent={LMActivePct}
    //         amount={LMLogNum}
    //         unLoggedInNum={LMNotLogNum}
    //       />
    //       <PercentCircle
    //         trailColor="#d9eeca" strokeColor="#82c650" loginDate="loginThisMon"
    //         departmentId={departmentId}
    //         type="tm"
    //         TMIsNoData={TMIsNoData}
    //         percent={TMActivePct}
    //         amount={TMLogNum}
    //         unLoggedInNum={TMNotLogNum}
    //       />
    //     </div>
    //     <div className="lines">
    //       <div className="explain">
    //         <FormattedMessage {...messages.loginRate} />
    //         <FormattedMessage {...messages.dailyOnlineTime} />
    //       </div>
    //       <div className="tips">
    //         &lceil;<FormattedMessage {...messages.tipOnlineTime} />&rfloor;
    //       </div>
    //       <OnlineTimeRate
    //         type="lw"
    //         isCanOpen={isCanOpen}
    //         dateMsgKey="lastWeek"
    //         onlineTime={LWAvgOLTime}
    //         pctOnlineRate={LWActivePct}
    //         pctOnlineTime={(LWAvgOLTime / max) * 100}
    //       />
    //       <OnlineTimeRate
    //         type="lm"
    //         isCanOpen={isCanOpen}
    //         dateMsgKey="lastMon"
    //         onlineTime={LMAvgOLTime}
    //         pctOnlineRate={LMActivePct}
    //         pctOnlineTime={(LMAvgOLTime / max) * 100}
    //       />
    //       <OnlineTimeRate
    //         type="tm"
    //         isCanOpen={isCanOpen}
    //         dateMsgKey="thisMon"
    //         TMIsNoData={TMIsNoData}
    //         onlineTime={TMAvgOLTime}
    //         pctOnlineRate={TMActivePct}
    //         pctOnlineTime={(TMAvgOLTime / max) * 100}
    //       />
    //     </div>
    //   </div>
    // );







// function PercentCircle({
//   departmentId,
//   type,
//   TMIsNoData,
//   loginDate,
//   percent,
//   amount,
//   unLoggedInNum,
//   status,
//    ...circleOptions
//    }) {
//   const num = TMIsNoData ? <span>暂无数据</span> : <span><span>未登录: </span>{unLoggedInNum}</span>;
//   return (
//     <Link to={`report/not-logged-in/${departmentId}?type=${type}`} className="circle">
//       <div className="graph">
//         <Circle trailWidth="3" strokeWidth="3" percent={percent} {...circleOptions} />
//         <div className={classNames('num', { increase: status === 'rising' }, { decrease: status === 'falling' })}>{amount}</div>
//       </div>
//       <div className="info">
//         <div className="desc"><FormattedMessage {...messages[loginDate]} /></div>
//         <div className="data">
//           { num }
//         </div>
//       </div>
//     </Link>
//   );
// }

// PercentCircle.propTypes = {
//   departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   type: PropTypes.string, // ‘lw’，‘lm’，‘tm’ 分别代表上周、上月、本月
//   loginDate: PropTypes.oneOf(['loginLastWeek', 'loginLastMon', 'loginThisMon']),
//   percent: PropTypes.number, // 百分比
//   amount: PropTypes.number, // 变化数
//   unLoggedInNum: PropTypes.number, // 未登录人数
//   status: PropTypes.string,
//   TMIsNoData: PropTypes.bool,
// };

// class OnlineTimeRate extends Component {
//   constructor(...args) {
//     super(...args);
//     this.onClinkLink = ::this.onClinkLink;
//   }

//   onClinkLink() {
//     const { isCanOpen, type } = this.props;
//     if (isCanOpen) this.context.router.push({ pathname: 'report/dept-rank', query: { type } });
//   }

//   render() {
//     const {
//       isCanOpen,
//       TMIsNoData,
//       dateMsgKey,
//       pctOnlineRate,
//       pctOnlineTime,
//       onlineTime,
//     } = this.props;
//     return (
//       TMIsNoData ?
//         <div className="line">
//           <div className="first">
//             <FormattedMessage {...messages[dateMsgKey]} />
//           </div>
//           <div className="second">暂无数据</div>
//         </div>
//         :
//         <div className="line" onClick={this.onClinkLink}>
//           <div className="first">
//             <FormattedMessage {...messages[dateMsgKey]} />
//           </div>
//           <div className="second">
//             <div className="online">
//               <Line
//                 trailWidth="3" strokeWidth="3" trailColor="transparent" strokeColor="#ffc03c"
//                 percent={pctOnlineRate * 0.7}
//               />
//               <div
//                 className="percent"
//                 style={{ left: `${(pctOnlineRate * 0.7) + 5}%` }}
//               >
//                 {pctOnlineRate}%
//               </div>
//             </div>
//             <div className="online">
//               <Line
//                 trailWidth="3" strokeWidth="3" trailColor="transparent" strokeColor="#38acff"
//                 percent={pctOnlineTime * 0.7}
//               />
//               <div
//                 className="percent"
//                 style={{ left: `${(pctOnlineTime * 0.7) + 5}%` }}
//               >
//                 <FormattedMessage {...messages.onlineTimeInMin} values={{ onlineTime }} />
//               </div>
//             </div>
//           </div>
//           { isCanOpen ? <div className="third">
//             <img src={arrowRight} alt="" />
//           </div> : null }
//         </div>
//     );
//   }
// }

// OnlineTimeRate.contextTypes = {
//   router: React.PropTypes.object,
// };

// OnlineTimeRate.propTypes = {
//   type: PropTypes.string, // ‘lw’，‘lm’，‘tm’ 分别代表上周、上月、本月
//   isCanOpen: PropTypes.bool,
//   dateMsgKey: PropTypes.string,
//   pctOnlineRate: PropTypes.number,
//   pctOnlineTime: PropTypes.number,
//   onlineTime: PropTypes.number,
//   TMIsNoData: PropTypes.bool,
// };