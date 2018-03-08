import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Loading from 'react-loading';
import { RelativeLink } from 'react-router-relative-links';
import { FormattedMessage } from 'react-intl';
import { nav } from 'utils/dx';
import { Confirm } from 'components/modal';

import { exams as examsActions } from '../../actions';

import './styles.styl';
import messages from './messages';

const setNav = (title) => {
  nav.setTitle({
    title,
  });
};

const propTypes = {
  fetchParams: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
};

class Info extends Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.closeConfirm = this.closeConfirm.bind(this);
    this.openConfirm = this.openConfirm.bind(this);
    this.handleArrange = this.handleArrange.bind(this);
    this.state = {
      isConfirmOpen: false,
    };
  }

  componentDidMount() {
    const { fetchParams, actions } = this.props;
    actions.fetchExamsInfo(fetchParams);
    setNav(this.context.intl.messages['app.exams.title.info']);
  }

  handleArrange() {
    const { info, fetchParams, actions } = this.props;
    const data = {
      is_arranged: !info.arrange,
    };
    actions.fetchExamsPlan(fetchParams, data);
    this.closeConfirm();
  }

  closeConfirm() {
    this.setState(Object.assign({}, this.state, {
      isConfirmOpen: false,
    }));
  }

  openConfirm() {
    this.setState(Object.assign({}, this.state, {
      isConfirmOpen: true,
    }));
  }

  renderValidStatus() {
    const { info } = this.props;
    if (!info.valid_status) {
      return null;
    }

    const validStatus = info.valid_status || '';
    if (validStatus === 'notStarted') {
      return (
        <span className="exam-validstatus not-start"><FormattedMessage {...messages.notStart} /></span>
      );
    }

    if (validStatus === 'invalid' && !info.is_finished && !info.valid_click && !info.exam_unchecked) {
      return (
        <span className="exam-validstatus invalid"><FormattedMessage {...messages.statusInvalid} /></span>
      );
    }

    if (validStatus === 'valid' && !info.is_finished && info.valid_time) {
      return (
        <span className="exam-validstatus will-invalid">
          {info.valid_time}
        </span>
      );
    }

    return null;
  }

  renderValidTime() {
    const { info } = this.props;

    if (!info.valid_time_start && !info.valid_time_end) {
      return null;
    }

    if (info.valid_time_start && info.valid_time_end) {
      return (
        <div className="exam-validtime">
          <span className="title"><FormattedMessage {...messages.studyTime} />:</span>
          <span className="time">{info.valid_time_start}</span>
          <span className="title"><FormattedMessage {...messages.studyTimeTo} /></span>
          <span className="time">{info.valid_time_end}</span>
        </div>
      );
    }

    if (info.valid_time_start) {
      return (
        <div className="exam-validtime">
          <span className="title"><FormattedMessage {...messages.studyTime} />:</span>
          <span className="time">{info.valid_time_start}</span>
          <span className="title"><FormattedMessage {...messages.studyTimeAfter} /></span>
        </div>
      );
    }

    if (info.valid_time_end) {
      return (
        <div className="exam-validtime">
          <span className="title"><FormattedMessage {...messages.studyTime} />:</span>
          <span className="time">{info.valid_time_end}</span>
          <span className="title"><FormattedMessage {...messages.studyTimeEnd} /></span>
        </div>
      );
    }

    return null;
  }

  render() {
    const { info, isFetching, fetchParams, queryParams } = this.props;
    const confirmMsgId = info.arrange ? 'msgWithdraw' : 'msgEnroll';
    const setRange = () => {
      const isRange = !info.source &&
        info.plan_type === 1 &&
        (info.rest_chance > 0 || info.rest_chance === -1);

      if (!isRange) {
        return null;
      }
      if (info.arrange) {
        return <a className="info-opt info-opt-withdraw" onClick={this.openConfirm} ><FormattedMessage id="app.exams.withdraw" /></a>;
      }
      return <a className="info-opt info-opt-enroll" onClick={this.openConfirm} ><FormattedMessage id="app.exams.enroll" /></a>;
    };
    return (
      <div className="exams">
        {(() => {
          if (isFetching) {
            return (
              <div className="loading-center">
                <Loading type="balls" color="#38acff" />
              </div>
            );
          }

          if (info.errorCode === 400) {
            return (
              <h3 className="revocation">
                {info.message}
              </h3>
            );
          }

          if (Object.keys(info).length) {
            const sec = info.time % 60;
            const sourcePath = info.source && {
              course: `/plan/${fetchParams.planId}/series/${fetchParams.solutionId}/courses/${info.source.id}/detail`,
              solution: `/plan/${fetchParams.planId}/series/${info.source.id}`,
            };
            // 共享学习取被共享的plan_id
            const planId = queryParams.sharePlanId || fetchParams.planId;
            const toRank = `/plan/${planId}/series/${fetchParams.solutionId}/exams/${fetchParams.quizId}/rank`;
            const toHistory = `/plan/${planId}/series/${fetchParams.solutionId}/exams/${fetchParams.quizId}/history`;

            return (
              <div className="info">
                <img alt="" src={info.img_url} className="info-cover" />
                <div className="info-body" >
                  <div className="bb bgf plr24 pt32">
                    <div className="info-title">
                      <h4 className="info-name">{info.name}</h4>
                      {setRange()}
                    </div>
                    <p className="info-staff"><FormattedMessage {...messages.joinCount} values={{ count: info.staff_count || '0' }} />{this.renderValidStatus()}</p>
                    <p className="info-standard">
                      <FormattedMessage {...messages.passStandard} />{info.standard}
                      {(info.have_try_count && info.exam_unchecked !== true) ?
                        <span className="info-best"><FormattedMessage {...messages.bestGrade} />{info.best}{info.pass_type === 'score' ? <FormattedMessage {...messages.isShowUnit} /> : '%' }</span> : null
                      }
                    </p>
                    {this.renderValidTime()}
                  </div>
                  <div className="pt24 pb32 plr24 bgf mb16 pr">
                    <div className="mb16 lh24">
                      <p className="info-time mr64"><i className="icon-time" /><FormattedMessage {...messages.duration} values={{ sec, unitEn: sec ? 'seconds' : '', unitZh: sec ? '秒' : '', minutes: (Math.floor(info.time / 60) +'') }} /></p>
                      <p className="info-exercise"><i className="icon-count" /><FormattedMessage {...messages.quantity} values={{ count: info.exercise_count }} /></p>
                    </div>
                    <div className="mb16 lh24">
                      <p className="info-try cB2">
                        <i className="icon-try" />{info.try_count === -1 ? <FormattedMessage {...messages.chancesLimitless} /> : <FormattedMessage {...messages.chances} values={{ count: info.try_count || '0' }} />}
                      </p>
                    </div>
                    {
                      (() => {
                        // 选修课
                        // if (info.plan_type === 1) {
                        //   if (info.rest_chance === 0) {
                        //     return (
                        //     <FormattedMessage
                        //       {...messages.isPass}
                        //       values={{ enIsPass: <i className={info.pass_status === 1 ? 'en-icon-pass' : 'en-icon-no-pass'} />, zhIsPass: <i className={info.pass_status === 1 ? 'icon-pass' : 'icon-no-pass'} /> }}
                        //     />);
                        //   }
                        //   return null;
                        // }

                        if (info.exam_unchecked === true) {
                          // 待批阅
                          return <div className="exam-valid-status not-mark" />;
                        }
                        
                        // 必修课
                        if (info.valid_status === 'notStarted') {
                          return null;
                        }

                        // 有效期内未完成
                        if (info.valid_status === 'valid' && !info.is_finished && !info.is_pass) {
                          return null;
                        }

                        // 未学未通过
                        if (!info.is_finished && !info.is_pass && (info.valid_time_end !== null || info.valid_time_start !== null)) {
                          return <div className="exam-valid-status not-finished" />;
                        }
                        // 已学已通过
                        if (info.is_pass) {
                          return <div className="exam-valid-status pass" />;
                        }
                        // 已学未通过
                        if (info.is_finished && !info.is_pass) {
                          return <div className="exam-valid-status not-pass" />;
                        }
                        return null;
                      })()
                    }
                  </div>
                  {
                    info.source && (
                      <RelativeLink to={sourcePath[info.source.type]}>
                        <div className="plr24 lh96 bgf pr">
                          <h4 className="info-source-name"><FormattedMessage {...messages.examFrom} values={{ name: info.source.name }} /></h4><i className="icon-enter" />
                        </div>
                      </RelativeLink>
                    )
                  }
                </div>
                <div className="info-footer">
                  {(() => {
                    if (info.have_try_count !== 0) {
                      return <RelativeLink to={toHistory} className="history"><FormattedMessage {...messages.history} /></RelativeLink>;
                    }
                    return <a className="history disabled"><FormattedMessage {...messages.history} /></a>;
                  })()}
                  {(() => {
                    if (info.valid_status === 'notStarted') {
                      return <a className="start disabled"><FormattedMessage {...messages.notStart} /></a>;
                    }
                    if (info.rest_chance !== 0 && info.finish_status !== 1 && info.valid_status !== 'notStarted') {
                      return <RelativeLink to="./process" className="start">{info.rest_chance === -1 ? <FormattedMessage {...messages.enterTheExamLimitless} /> : <FormattedMessage {...messages.enterTheExamChances} values={{ chances: info.rest_chance }} />}</RelativeLink>;
                    }
                    return <a className="start disabled"><FormattedMessage {...messages.enterTheExamChances} values={{ chances: '0' }} /></a>;
                  })()}
                </div>
                <FormattedMessage {...messages.rank} values={{ en: <RelativeLink className="info-rank en" to={toRank} />, zh: <RelativeLink className="info-rank zh" to={toRank} /> }} />
              </div>
            );
          }
          return null;
        })()}
        <Confirm
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isConfirmOpen}
          onRequestClose={() => { }}
          onConfirm={this.handleArrange}
          confirmButton={<span><FormattedMessage {...messages.btnOk} /></span>}
          cancelButton={<span><FormattedMessage {...messages.btnCancel} /></span>}
        >
          <span>
            <FormattedMessage
              {...messages[confirmMsgId]}
            />
          </span>
        </Confirm>
      </div>
    );
  }
}

Info.propTypes = propTypes;

export default connect((state, ownProps) => (
  {
    info: state.exams.info || {},
    isFetching: state.exams.isFetching || false,
    fetchParams: {
      planId: ownProps.params.plan_id,
      solutionId: ownProps.params.solution_id,
      quizId: ownProps.params.quiz_id,
    },
    queryParams: {
      sharePlanId: ownProps.location.query.sharePlanId,
    },
  }
), dispatch => (
  {
    actions: bindActionCreators(examsActions, dispatch),
  }
))(Info);
