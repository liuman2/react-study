import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Loading from 'react-loading';
import classnames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { nav } from 'utils/dx';
import getAbsPath from 'utils/absPath';
import { Confirm, Alert } from 'components/modal';

import Exercise from '../../components/exercise';
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
  exercise: PropTypes.object.isRequired,
  processSubmit: PropTypes.object.isRequired,
  processSubmitBest: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

const formatSec = (sec) => {
  const hours = parseInt(sec / 3600, 10) % 24;
  const minutes = parseInt(sec / 60, 10) % 60;
  const seconds = sec % 60;

  return `${hours < 10 ? `0${hours}` : hours}: ${minutes < 10 ? `0${minutes}` : minutes}: ${seconds < 10 ? `0${seconds}` : seconds}`;
};

class Process extends Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.getAnswerIdClick = this.getAnswerIdClick.bind(this);
    this.nextClick = this.nextClick.bind(this);
    this.prevClick = this.prevClick.bind(this);
    this.chooseExerciseClick = this.chooseExerciseClick.bind(this);
    this.numberExerciseClick = this.numberExerciseClick.bind(this);
    this.submitClick = this.submitClick.bind(this);
    this.intervalCB = this.intervalCB.bind(this);
    this.goBackClick = this.goBackClick.bind(this);
    this.submitBestScoreClick = this.submitBestScoreClick.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.closeConfirm = this.closeConfirm.bind(this);
    this.openConfirm = this.openConfirm.bind(this);
    this.reviewClick = this.reviewClick.bind(this);
    this.time = 0;
    this.uuid = 0;
    this.handleExerciseIndex = 0;
    this.exercises = [];
    this.chooseAllAnswerIds = [];
    this.intervalID = 0;
    this.isSubmit = false;
    this.isSubmitBest = false;
    this.submitCBData = {};
    this.noAnswerNum = 0;
    this.alertMessage = '';
    this.state = {
      handleExercise: {},
      showNumberExercise: false,
      formatTime: '00: 00: 00',
      errorCode: 200,
    };
  }

  componentDidMount() {
    const { fetchParams, actions } = this.props;
    actions.fetchExamsProcess(fetchParams).catch((err) => {
      const { response: { data: { message, errorCode } } } = err;
      if (errorCode === 400) {
        this.alertMessage = message;
        this.setState({
          errorCode,
        });
      }
    });
    setNav(this.context.intl.messages['app.exams.title.process']);
  }

  componentWillReceiveProps(nextProps) {
    const { exercise, processSubmit, processSubmitBest, actions, router } = nextProps;
    if (this.intervalID !== 0) {
      clearInterval(this.intervalID);
    }
    if (Object.keys(processSubmit).length) {
      this.isSubmit = true;
      this.submitCBData = processSubmit;
      actions.resetExamsProcessSubmit();
      if (processSubmit.rest_chance === 0 && processSubmit.can_submit_best_score === true) {
        this.submitBestScore();
      }
      this.closeConfirm();
    }
    if (this.isSubmitBest && Object.keys(processSubmitBest).length) {
      router.replace(getAbsPath('../rank'));
      actions.resetExamsProcessSubmitBest();
      this.isSubmitBest = false;
    }
    if (!this.isSubmit) {
      this.exercises = exercise.exercise_data || [];
      this.time = exercise.time;
      this.uuid = exercise.uuid;
      this.handleExerciseIndex = 0;
      this.setState(Object.assign({}, this.state, {
        handleExercise: this.exercises[this.handleExerciseIndex],
        formatTime: formatSec(this.time),
        showNumberExercise: false,
        isConfirmOpen: false,
      }));

      if (this.time) this.intervalID = setInterval(this.intervalCB, 1000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  onConfirm() {
    if (this.isSubmit) {
      this.isSubmitBest = true;
      this.submitBestScore();
    } else {
      const { actions, fetchParams } = this.props;
      const data = this.getSubmitData();
      actions.fetchExamsProcessSubmit(fetchParams, data);
    }
  }

  onCancel() {
    this.closeConfirm();
    if (this.isSubmit) {
      const { router } = this.props;
      router.goBack();
    }
  }

  getSubmitData() {
    const typeNum = {
      single: 1,
      multi: 2,
      judge: 3,
      completion: 4,
      qa: 5,
    };

    const getChooseAllAnswer = function getAnswer(type, answers) {
      if ((type !== 'completion' && type !== 'qa')) {
        return answers.map(id => ({ answer_id: id, answer_content: null }));
      }

      const arrs = [];
      for (let i = 0, max = answers.length; i < max; i += 1) {
        const answer = answers[i];
        arrs.push({ answer_id: null, answer_content: (answer || '') });
      }
      return arrs;
    };

    const getAnswerOrder = function answerOrder(exercise) {
      if (exercise.type === 'completion' || exercise.type === 'qa') {
        return '';
      }

      const arrs = [];
      exercise.answer.map((a) => {
        arrs.push(a.id);
      });
      return arrs.join(',');
    };

    return {
      uuid: this.uuid,
      exercise_data: this.exercises.map((exercise, index) => (
        {
          id: exercise.id,
          type: typeNum[exercise.type],
          score: exercise.score,
          answers_order: getAnswerOrder(exercise),
          // map:填空题如果有一个空格没回答时，取不到值。
          // user_answers: this.chooseAllAnswerIds[index] ? this.chooseAllAnswerIds[index].map(id => (
          //   {
          //     answer_id: (exercise.type === 'completion' || exercise.type === 'qa') ? null : id,
          //     answer_content: (exercise.type === 'completion' || exercise.type === 'qa') ? id : null,
          //   }
          // )) : [],
          user_answers: this.chooseAllAnswerIds[index] ? getChooseAllAnswer(exercise.type, this.chooseAllAnswerIds[index]) : [],
        }
      )),
    };
  }

  getAnswerIdClick(ids) {
    this.exercises[this.handleExerciseIndex].chooseAnswerIds = ids;
    this.chooseAllAnswerIds[this.handleExerciseIndex] = ids;
  }

  submitBestScore() {
    const { actions, fetchParams } = this.props;
    actions.fetchExamsProcessSubmitBest(fetchParams);
  }

  nextClick() {
    this.handleExerciseIndex += 1;
    this.setState(Object.assign({}, this.state, {
      handleExercise: this.exercises[this.handleExerciseIndex],
    }));
  }

  prevClick() {
    this.handleExerciseIndex -= 1;
    this.setState(Object.assign({}, this.state, {
      handleExercise: this.exercises[this.handleExerciseIndex],
    }));
  }

  chooseExerciseClick() {
    this.setState(Object.assign({}, this.state, {
      showNumberExercise: !this.state.showNumberExercise,
    }));
  }

  numberExerciseClick(index) {
    this.handleExerciseIndex = index;
    this.setState(Object.assign({}, this.state, {
      handleExercise: this.exercises[this.handleExerciseIndex],
      showNumberExercise: false,
    }));
  }

  submitClick() {
    const answerNum = this.chooseAllAnswerIds.reduce((previousValue, currentValue) => {
      if (currentValue.length) {
        return previousValue + 1;
      }
      return previousValue;
    }, 0);
    this.noAnswerNum = this.exercises.length - answerNum;
    this.openConfirm();
  }

  reviewClick() {
    const { router, fetchParams } = this.props;
    const reviewId = this.submitCBData.record_id;
    router.replace(`/plan/${fetchParams.planId}/series/${fetchParams.solutionId}/exams/${fetchParams.quizId}/review/${reviewId}`);
  }

  goBackClick() {
    const { router } = this.props;
    router.goBack();
  }

  submitBestScoreClick() {
    this.openConfirm();
  }

  intervalCB() {
    this.time -= 1;
    this.setState(Object.assign({}, this.state, {
      formatTime: formatSec(this.time),
    }));
    if (this.time === 0) {
      clearInterval(this.intervalID);
      const { actions, fetchParams } = this.props;
      const data = this.getSubmitData();
      actions.fetchExamsProcessSubmit(fetchParams, data);
    }
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

  getIsFill(type, index) {
    if (type !== 'completion' && type !== 'qa') {
      return this.chooseAllAnswerIds[index] && this.chooseAllAnswerIds[index].length;
    }

    if (!this.chooseAllAnswerIds[index]) {
      return false;
    }
    if (!this.chooseAllAnswerIds[index].length) {
      return false;
    }
    let length = 0;
    this.chooseAllAnswerIds[index].forEach((txt) => {
      if (txt) {
        length += 1;
      }
    });

    return length > 0;
  }

  render() {
    const { isFetching } = this.props;
    const { handleExercise, formatTime, showNumberExercise } = this.state;
    let confirmMsgMsgId;
    let confirmBtnMsgId;
    let cancelBtnMsgId;

    if (this.isSubmit) {
      confirmMsgMsgId = 'confirmBestGrade';
      confirmBtnMsgId = 'confirmBtnBestGrade';
      cancelBtnMsgId = 'cancelBtnBestGrade';
    } else {
      confirmMsgMsgId = this.noAnswerNum ? 'confirmExamsHasNoAnswer' : 'confirmExams';
      confirmBtnMsgId = 'confirmBtn';
      cancelBtnMsgId = 'cancelBtn';
    }

    return (
      <div className="exams">
        {(() => {
          if (this.state.errorCode === 400) {
            return (
              <h3 className="revocation">
                {this.alertMessage}
              </h3>
            );
          }

          if (isFetching) {
            return (
              <div className="loading-center">
                <Loading type="balls" color="#38acff" />
              </div>
            );
          }

          if (!this.isSubmit && this.exercises.length) {
            const processNumberClass = classnames({
              'process-number': true,
              active: showNumberExercise,
            });
            const iconNumberClass = classnames({
              'icon-number': true,
              active: showNumberExercise,
            });
            const processPanelClass = classnames({
              'process-panel': !__platform__.web,
              'process-panel-web': __platform__.web,
            });
            return (
              <div className="process">
                <div className="process-header">
                  <div className="process-time active"><i className="icon-active-time" />{formatTime}</div>
                  <i className="br40" />
                  <div className={processNumberClass} onClick={this.chooseExerciseClick}>
                    <i className={iconNumberClass} />
                    {this.handleExerciseIndex + 1}/ {this.exercises.length}
                  </div>
                  <i className="br40" />
                  <div className="process-submit" onClick={this.submitClick}><i className="icon-submit" /><FormattedMessage {...messages.submit} /></div>
                </div>
                <div className="process-body">
                  <Exercise data={handleExercise} type="handle" handle={this.getAnswerIdClick} />
                </div>
                <div className="process-footer">
                  {
                    this.handleExerciseIndex === 0 ? <a className="process-prev disabled"><FormattedMessage {...messages.prev} /></a> : <a className="process-prev" onClick={this.prevClick}><FormattedMessage {...messages.prev} /></a>
                  }
                  {
                    this.handleExerciseIndex === this.exercises.length - 1 ? <a className="process-next disabled"><FormattedMessage {...messages.next} /></a> : <a className="process-next" onClick={this.nextClick}><FormattedMessage {...messages.next} /></a>
                  }
                </div>
                {
                  showNumberExercise && (
                    <div className={processPanelClass}>
                      <ul className="exercises-number clearfix">
                        {
                          this.exercises.map((exercise, index) => (
                            (this.getIsFill(exercise.type, index) && <li key={exercise.id} className="exercises-number-item active" onClick={() => this.numberExerciseClick(index)}>{index + 1}</li>)
                            || <li key={exercise.id} className="exercises-number-item" onClick={() => this.numberExerciseClick(index)}>{index + 1}</li>
                          ))
                        }
                      </ul>
                    </div>
                  )
                }
              </div>
            );
          }

          if (this.isSubmit) {
            setNav(this.context.intl.messages['app.exams.title.process.submit']);
            return (
              <div className="process-result">
                <div className="result-header">
                  <div className="icon-user-deck">
                    {this.submitCBData.img_url ? <div className="icon-user-img" style={{ background: `url(${this.submitCBData.img_url}) no-repeat left top/cover` }} /> : <div className="icon-user-default-img" />}
                  </div>
                  <div className="icon-score-deck">
                    {
                      /* 显示分数*/
                      this.submitCBData.exam_pass_status !== 'unchecked' && <div className="exam-score">
                        <span className="process-score">{Math.round(this.submitCBData.result)}</span>
                        <span className="process-score-unit">
                          {this.submitCBData.pass_type === 1 ? '%' : <FormattedMessage {...messages.unitScore} />}
                        </span>
                      </div>
                    }
                    {
                      /* 显示试卷待批阅*/
                      this.submitCBData.exam_pass_status === 'unchecked' && <div className="exam-score">
                        <span className="process-score"><FormattedMessage {...messages.waitingMark} /></span>
                      </div>
                    }
                    <div className="exam-time">
                      <FormattedMessage
                        {...messages.finished}
                        values={{ minutes: Math.floor(this.submitCBData.time_spend / 60) || '0', seconds: this.submitCBData.time_spend % 60 || '0' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="result-body">
                  <div className="exam-status">{this.submitCBData.msg}</div>
                  <div className="exam-best-score">
                    <FormattedMessage {...messages.bestGrade} />
                    {
                      this.submitCBData.exam_pass_status !== 'unchecked' ? <span className="cOrange">
                        {Math.round(this.submitCBData.best)}{this.submitCBData.pass_type === 1 ? '%' : <FormattedMessage {...messages.unitScore} />}
                      </span> : <span className="cOrange"><FormattedMessage {...messages.notScore} /></span>
                    }
                  </div>
                  {this.submitCBData.reviewable ? <div onClick={this.reviewClick} className="exam-reviewable"><FormattedMessage {...messages.reviewable} /></div> : null}
                </div>
                <div className="result-footer">
                  {this.submitCBData.rest_chance !== 0 ?
                    <a className="go-back-btn" onClick={this.goBackClick}>
                      <FormattedMessage {...messages.tryAgain} />
                      （{this.submitCBData.rest_chance === -1 ? <FormattedMessage {...messages.unlimitedChance} /> : <FormattedMessage {...messages.restChance} values={{ chance: this.submitCBData.rest_chance || '0' }} />}）
                    </a> : null
                  }
                  {this.submitCBData.can_submit_best_score ? <a className="submit-best-btn" onClick={this.submitBestScoreClick}><FormattedMessage {...messages.submitBestGrade} /></a> : null}
                  {!this.submitCBData.can_submit_best_score && this.submitCBData.rest_chance === 0 ? <a className="go-back-btn" onClick={this.goBackClick}><FormattedMessage {...messages.goBack} /></a> : null}
                </div>
              </div>
            );
          }
          return null;
        })()}
        <Confirm
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isConfirmOpen}
          onRequestClose={() => { }}
          onConfirm={this.onConfirm}
          onCancel={this.onCancel}
          confirmButton={<FormattedMessage {...messages[confirmBtnMsgId]} />}
          cancelButton={<FormattedMessage {...messages[cancelBtnMsgId]} />}
        >
          <FormattedMessage
            {...messages[confirmMsgMsgId]}
            values={{ noAnswerNum: this.noAnswerNum }}
          />
        </Confirm>
      </div>
    );
  }
}

Process.propTypes = propTypes;

export default connect((state, ownProps) => (
  {
    exercise: state.exams.exercise || {},
    processSubmit: state.exams.processSubmit || {},
    processSubmitBest: state.exams.processSubmitBest || {},
    isFetching: state.exams.isFetching || false,
    fetchParams: {
      planId: ownProps.params.plan_id,
      solutionId: ownProps.params.solution_id,
      quizId: ownProps.params.quiz_id,
    },
  }
), dispatch => (
  {
    actions: bindActionCreators(examsActions, dispatch),
  }
))(withRouter(Process));
