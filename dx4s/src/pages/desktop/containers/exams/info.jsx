import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RelativeLink } from 'react-router-relative-links';
import { FormattedMessage } from 'react-intl';
import Confirm from '../../components/confirm';

import { exams as examsActions } from '../../actions';

import './styles.styl';
import messages from './messages';

const propTypes = {
  fetchParams: PropTypes.object.isRequired,
  info: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

class Info extends Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.closeConfirm = ::this.closeConfirm;
    this.openConfirm = ::this.openConfirm;
    this.handleArrange = ::this.handleArrange;
    this.setRange = ::this.setRange;
    this.onCancel = ::this.onCancel;
    this.state = {
      isConfirmOpen: false,
    };
  }

  componentDidMount() {
    const { fetchParams, actions } = this.props;
    actions.fetchExamsInfo(fetchParams);
    document.body.scrollTop = 0;
  }

  onCancel() {
    this.setState({
      isConfirmOpen: false,
    });
  }

  setRange() {
    const { info } = this.props;
    // eslint-disable-next-line max-len
    const isRange = !info.source && info.plan_type === 1 && (info.rest_chance > 0 || info.rest_chance === -1);

    if (!isRange) {
      return null;
    }
    if (info.arrange) {
      return <i className="range active" onClick={this.openConfirm} title={this.context.intl.messages['app.exams.withdraw']} />;
    }
    return <i className="range" onClick={this.openConfirm} title={this.context.intl.messages['app.exams.enroll']} />;
  }

  closeConfirm() {
    this.setState({
      isConfirmOpen: false,
    });
  }

  openConfirm() {
    this.setState({
      isConfirmOpen: true,
    });
  }

  handleArrange() {
    const { info, fetchParams, actions } = this.props;
    const data = {
      is_arranged: !info.arrange,
    };
    actions.fetchExamsPlan(fetchParams, data);
    this.closeConfirm();
  }

  renderValidStatus() {
    const { info } = this.props;
    if (!info.valid_status) {
      return null;
    }

    const validStatus = info.valid_status || '';
    if (validStatus === 'notStarted') {
      return (
        <span className="exam-validstatus not-start">{this.context.intl.messages['app.exams.statusNotStart']}</span>
      );
    }

    if (validStatus === 'invalid' && !info.is_finished && !info.valid_click && !info.exam_unchecked) {
      return (
        <span className="exam-validstatus invalid">{this.context.intl.messages['app.exams.statusInvalid']}</span>
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
          <span className="title">{this.context.intl.messages['app.exams.studyTime']}:</span>
          <span className="time">{info.valid_time_start}</span>
          <span className="title">{this.context.intl.messages['app.exams.studyTimeTo']}</span>
          <span className="time">{info.valid_time_end}</span>
        </div>
      );
    }

    if (info.valid_time_start) {
      return (
        <div className="exam-validtime">
          <span className="title">{this.context.intl.messages['app.exams.studyTime']}:</span>
          <span className="time">{info.valid_time_start}</span>
          <span className="title">{this.context.intl.messages['app.exams.studyTimeAfter']}</span>
        </div>
      );
    }

    if (info.valid_time_end) {
      return (
        <div className="exam-validtime">
          <span className="title">{this.context.intl.messages['app.exams.studyTime']}:</span>
          <span className="time">{info.valid_time_end}</span>
          <span className="title">{this.context.intl.messages['app.exams.studyTimeEnd']}</span>
        </div>
      );
    }

    return null;
  }

  render() {
    const { info, fetchParams } = this.props;
    const confirmMsgId = info.arrange ? 'msgWithdraw' : 'msgEnroll';
    return (
      <div>
        {(() => {
          if (info.errorCode === 400) {
            return (
              <h3 className="revocation">
                {info.message}
              </h3>
            );
          }

          if (Object.keys(info).length) {
            const sec = info.time % 60;
            const minutes = Math.floor(info.time / 60);
            const sourcePath = info.source && {
              course: `/plan/${fetchParams.sourcePlanId}/series/${fetchParams.solutionId}/courses/${info.source.id}`,
              solution: `/plan/${fetchParams.sourcePlanId}/series/${info.source.id}`,
            };

            return (
              <div className="info">
                <div className="info-body bgf">
                  <img alt="" src={info.img_url} className="info-cover" />
                  <div className="plr24 dib">
                    <div className="info-title">
                      <h4 className="info-name">{info.name}</h4>
                      {this.setRange()}
                    </div>
                    <p className="info-time">
                      <FormattedMessage
                        {...messages.duration}
                        values={{
                          sec,
                          unitEn: sec ? 'seconds' : '',
                          unitZh: sec ? '秒' : '',
                          minutes,
                          minutesEn: minutes ? 'minutes' : '',
                          minutesZh: minutes ? '分钟' : '',
                        }}
                      />

                      {this.renderValidStatus()}
                    </p>
                    <p className="info-exercise"><FormattedMessage {...messages.quantity} values={{ count: info.exercise_count }} /></p>
                    <p className="info-standard">
                      <FormattedMessage {...messages.passStandard} />{info.standard}
                      {(info.have_try_count && info.exam_unchecked !== true) ?
                        <span className="info-best"><FormattedMessage {...messages.bestGrade} />{info.best}{info.pass_type === 'score' ? <FormattedMessage {...messages.isShowUnit} /> : '%' }</span> : null
                      }
                    </p>
                    <p className="info-try">{info.try_count === -1 ? <FormattedMessage {...messages.chancesLimitless} /> : <FormattedMessage {...messages.chances} values={{ count: info.try_count || '0' }} />}&emsp;
                      {info.rest_chance === -1 ?
                        <FormattedMessage {...messages.limitless} /> :
                        <FormattedMessage
                          {...messages.infoChances}
                          values={{ chances: info.rest_chance || '0' }}
                        />
                      }
                    </p>
                    {this.renderValidTime()}
                    {(info.rest_chance !== 0 && info.finish_status !== 1 && info.valid_status !== 'notStarted') ?
                      <RelativeLink to="./process" className="start"><FormattedMessage {...messages.enterTheExam} /></RelativeLink> : null
                    }
                    {info.valid_status === 'notStarted' ?
                      <a to="./process" className="start gray">{this.context.intl.messages['app.exams.statusNotStart']}</a> : null
                    }

                    {info.valid_status === 'invalid' ?
                      <a to="./process" className="start gray">{this.context.intl.messages['app.exams.process.enterTheExam']}</a> : null
                    }
                    

                    {/*info.rest_chance === 0 || info.finish_status === 1 ?
                      <FormattedMessage
                        {...messages.isPass}
                        values={{
                          isPass: <i key="1" className={info.pass_status === 1 ? 'icon-pass' : 'icon-no-pass'} /> }}
                      /> : null*/
                    }

                    {
                      (() => {
                        // 选修课
                        // if (info.plan_type === 1) {
                        //   if (info.rest_chance === 0 || info.finish_status === 1) {
                        //     return (
                        //     <FormattedMessage
                        //       {...messages.isPass}
                        //       values={{
                        //         isPass: <i key="1" className={info.pass_status === 1 ? 'icon-pass' : 'icon-no-pass'} /> }}
                        //     />);
                        //   }
                        //   return null;
                        // }

                        if (info.exam_unchecked === true) {
                          // 待批阅
                          return <div className="exam-valid-status not-mark" />;
                        }

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
                </div>
                {info.source ? (
                  <div className="bgf mb24">
                    <div className="info-source"><FormattedMessage {...messages.linkedCoursesView} /></div>
                    <h4 className="info-source-name" style={{ position: 'relative' }}>{`《${info.source.name}》`}<RelativeLink to={sourcePath[info.source.type]} className="enter"><FormattedMessage {...messages.view} /><i className="icon-enter" /></RelativeLink></h4>
                  </div>
                ) : null}
              </div>
            );
          }
          return null;
        })()}
        <Confirm
          isOpen={this.state.isConfirmOpen}
          confirm={this.handleArrange}
          cancel={this.onCancel}
          confirmButton={<FormattedMessage {...messages.btnOk} />}
          cancelButton={<FormattedMessage {...messages.btnCancel} />}
        >
          <FormattedMessage
            {...messages[confirmMsgId]}
          />
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
      planId: ownProps.location.query.sharePlanId || ownProps.params.plan_id,
      sourcePlanId: ownProps.params.plan_id,
      solutionId: ownProps.params.solution_id,
      quizId: ownProps.params.quiz_id,
    },
  }
), dispatch => (
  {
    actions: bindActionCreators(examsActions, dispatch),
  }
))(Info);
