import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import api from 'utils/api';
import { seriesDetail as courseActions } from '../../actions';
import Confirm from '../../components/confirm';
import './course.styl';
import DxHeader from '../../components/header';
import DxFooter from '../../components/footer';

class Course extends Component {
  static propTypes() {
    return {
      actions: PropTypes.object.isRequired,
      fetchParams: PropTypes.object.isRequired,
      courseInfo: PropTypes.object.isRequired,
      nodes: PropTypes.object.isRequired,
    };
  }

  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      isShareAlertOpen: false,
      isShare: false,
    };
    this.onDetail = ::this.onDetail;
    this.onShare = ::this.onShare;
    this.alertMsg = '';
  }

  componentDidMount() {
    const { fetchParams, actions } = this.props;
    actions.fetchSeriesDetail({
      plan_id: fetchParams.planId,
      solution_id: fetchParams.solutionId || 0,
    })
    .then(() => {
      const { courseInfo } = this.props;
      if (courseInfo.needComplete) {
        this.alertMsg = this.context.intl.messages['app.series.share'];
        this.setState({ ...this.state, isShareAlertOpen: true, isShare: true });
      }
    })
    .catch((err) => {
      const error = JSON.parse(err.message);
      this.alertMsg = error.message;
      this.setState({ ...this.state, isShareAlertOpen: true, isShare: false });
    });
  }

  onDetail(node) {
    const { fetchParams, courseInfo } = this.props;
    const router = this.context.router;

    if (courseInfo.validStatus === 'notStarted' && node.node_type === 9) {
      return;
    }

    // node_type (string, optional): 节点类型，8：考试，9：问卷，10：课程 ,
    const nodeTypes = ['exams', 'surveys', 'courses'];
    const path = `plan/${fetchParams.planId}/series/${fetchParams.solutionId || 0}/${nodeTypes[node.node_type - 8]}/${node.node_id}/nodes/${node.id}`;
    if (node.node_type === 9) {
      router.push(router.createPath(path, {
        passStatus: node.status,
      }));
      return;
    }
    router.push(router.createPath(path));
  }

  onShare() {
    // 课程计划被撤销 或服务端返回错误
    if (!this.state.isShare) {
      this.setState({ ...this.state, isShareAlertOpen: false });
      window.history.back();
      return;
    }

    // 共享学习
    const { actions, fetchParams, courseInfo } = this.props;
    const query = {
      plan_id: fetchParams.planId,
      solution_id: 0,
      course_id: fetchParams.solutionId,
    };

    const shareCourse = api({
      method: 'PUT',
      data: {
        completed_in_plan: courseInfo.sharePlan,
      },
      url: `/training/plan/${query.plan_id}/solution/${query.solution_id}/course/${query.course_id}/complete`,
    });
    shareCourse.then(() => {
      actions.fetchSeriesDetail({
        plan_id: fetchParams.planId,
        solution_id: fetchParams.solutionId || 0,
      });
      this.setState({ ...this.state, isShareAlertOpen: false });
    });
  }

  renderValidStatus() {
    const { courseInfo } = this.props;

    if (!courseInfo.validStatus) {
      return null;
    }

    const validStatus = courseInfo.validStatus || '';
    if (validStatus === 'notStarted') {
      return (
        <span className="banner-info-validstatus not-start" style={{ marginLeft: '0px' }}>{this.context.intl.messages['app.course.statusNotStart']}</span>
      );
    }

    if (validStatus === 'invalid' && !courseInfo.isFinished && !courseInfo.validClick) {
      return (
        <span className="banner-info-validstatus invalid" style={{ marginLeft: '0' }}>{this.context.intl.messages['app.course.statusInvalid']}</span>
      );
    }

    if (validStatus === 'valid' && !courseInfo.isFinished && courseInfo.validTime) {
      return (
        <span className="banner-info-validstatus will-invalid" style={{ marginLeft: '0' }}>
          {courseInfo.validTime}
        </span>
      );
    }

    return null;
  }

  renderValidTime() {
    const { courseInfo } = this.props;

    if (!courseInfo.validTimeStart && !courseInfo.validTimeEnd) {
      return null;
    }

    if (courseInfo.validTimeStart && courseInfo.validTimeEnd) {
      return (
        <div className="banner-info-validtime">
          <span className="title">{this.context.intl.messages['app.course.studyTime']}:</span>
          <span className="time">{courseInfo.validTimeStart}</span>
          <span className="title">{this.context.intl.messages['app.course.studyTimeTo']}</span>
          <span className="time">{courseInfo.validTimeEnd}</span>
        </div>
      );
    }

    if (courseInfo.validTimeStart) {
      return (
        <div className="banner-info-validtime">
          <span className="title">{this.context.intl.messages['app.course.studyTime']}:</span>
          <span className="time">{courseInfo.validTimeStart}</span>
          <span className="title">{this.context.intl.messages['app.course.studyTimeAfter']}</span>
        </div>
      );
    }

    if (courseInfo.validTimeEnd) {
      return (
        <div className="banner-info-validtime">
          <span className="title">{this.context.intl.messages['app.course.studyTime']}:</span>
          <span className="time">{courseInfo.validTimeEnd}</span>
          <span className="title">{this.context.intl.messages['app.course.studyTimeEnd']}</span>
        </div>
      );
    }

    return null;
  }

  render() {
    const { courseInfo, nodes } = this.props;

    return (
      <div>
        <DxHeader />
        <div className="dx-container course">
          <div className="banner">
            <div className="banner-face">
              <img width="100%" height="100%" src={courseInfo.imgUrl} alt={courseInfo.imgUrl} />
            </div>
            <div className="banner-info">
              <div className="banner-info-head">
                <div className="banner-info-title">
                  { courseInfo.name }
                </div>
              </div>
              <div className="banner-info-tag">
                {
                  courseInfo.labels.map((label, index) => (
                    <span key={index}>{label.name}</span>
                  ))
                }
              </div>
              { this.renderValidStatus() }

              { this.renderValidTime() }
            </div>
          </div>
          <div className="tab">
            <ul>
              <li className="tab-first">
                <a className="active">
                  {this.context.intl.messages['app.series.info']}
                </a>
              </li>
            </ul>
          </div>
          <div className="description" dangerouslySetInnerHTML={{ __html: courseInfo.info_html }}></div>
          <div className="tab">
            <ul>
              <li className="tab-first">
                <a className="active">
                  {this.context.intl.messages['app.series.detail']}
                </a>
              </li>
            </ul>
          </div>
          <div className="series-list">
            {
              nodes.map((node, index) => (
                <div className="item" key={index} onClick={() => { this.onDetail(node); }}>
                  <div className="item-face">
                    <img width="100%" height="100%" src={node.node_cover_url} alt={node.node_name} />
                    {
                      /* 8：考试，9：问卷，10：课程 ,*/
                      (() => {
                        if (node.node_type === 10) {
                          return null;
                        }
                        const cornerType = {
                          8: 'corner-exam',
                          9: 'corner-survey',
                        };
                        const cornerText = {
                          8: 'app.series.cornerExam',
                          9: 'app.series.cornerSurvey',
                        };

                        return (
                          <div className={`corner ${cornerType[node.node_type]}`}>
                            {this.context.intl.messages[`${cornerText[node.node_type]}`]}
                          </div>
                        );
                      })()
                    }
                  </div>
                  <div className="item-info">
                    <div className="item-info-title">
                      { node.node_name }
                    </div>
                    <div className="item-info-study">
                      { this.context.intl.formatMessage({ id: 'app.series.learncount' }, { study_count: node.study_count || '0' }) }
                    </div>
                  </div>
                  {
                    /* status: 7：已完成，8：失败，9：失效 ,*/
                    /*(() => {
                      if (node.status !== 7 && node.status !== 8) {
                        return null;
                      }
                      const status = {
                        7: 'pass',
                        8: 'fail',
                      };
                      return (
                        <div className={`item-info-signet ${status[node.status]}`}>
                        </div>
                      );
                    })()*/

                    (() => {
                      if (node.exam_unchecked !== true) {
                        return null;
                      }

                      return (
                        <div className="item-info-signet not-mark" />
                      );
                    })()
                  }
                </div>
              ))
            }
          </div>
        </div>
        <DxFooter />
        <Confirm
          isOpen={this.state.isShareAlertOpen}
          confirm={this.onShare}
          confirmButton={this.context.intl.messages['app.course.ok']}
          buttonNum={1}
        >
          {this.alertMsg}
        </Confirm>
      </div>
    );
  }
}

Course.contextTypes = {
  intl: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => ({
  fetchParams: {
    planId: ownProps.params.plan_id,
    solutionId: ownProps.params.solution_id,
  },
  courseInfo: {
    id: state.seriesDetail.detailInfo.id || null,
    name: state.seriesDetail.detailInfo.name || '',
    labels: state.seriesDetail.detailInfo.labels || [],
    info: state.seriesDetail.detailInfo.info || '',
    imgUrl: state.seriesDetail.detailInfo.thumbnail_url || '',
    isArranged: state.seriesDetail.detailInfo.is_arranged || false,
    isElective: state.seriesDetail.detailInfo.is_elective || false,
    needComplete: state.seriesDetail.detailInfo.need_update_complete_status || false,
    plan: state.seriesDetail.detailInfo.plan || { id: '', name: '' },
    sharePlan: state.seriesDetail.detailInfo.completed_in_plan || {},
    is_order: state.seriesDetail.detailInfo.is_order || false,
    info_html: state.seriesDetail.detailInfo.info_html || '',
    isPass: state.seriesDetail.detailInfo.is_pass || false,
    isFinished: state.seriesDetail.detailInfo.is_finished || false,
    validClick: state.seriesDetail.detailInfo.valid_click || false,
    validStatus: state.seriesDetail.detailInfo.valid_status || '',
    validTime: state.seriesDetail.detailInfo.valid_time || '',
    validTimeEnd: state.seriesDetail.detailInfo.valid_time_end || '',
    validTimeStart: state.seriesDetail.detailInfo.valid_time_start || '',
  },
  nodes: state.seriesDetail.detailInfo.nodes || [],
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Object.assign({},
    courseActions),
    dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Course);
