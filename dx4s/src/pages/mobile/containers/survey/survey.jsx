import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { nav } from 'utils/dx';
import { truncate } from 'utils/strings';
import { surveys as surveyActions, course as courseActions } from '../../actions';
import Button from '../../../../components/button';
import './survey.styl';
import { Alert } from '../../../../components/modal';
import messages from './messages';

const propTypes = {
  actions: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  location: PropTypes.object,
  course: PropTypes.object,
  questions: PropTypes.array.isRequired,
  alreadySubmit: PropTypes.bool,
  readSurvey: PropTypes.bool,
  isFetching: PropTypes.bool,
  afterSubmit: PropTypes.func,
};

function getTypeCls(type) {
  return {
    type: true,
    single: type === 'single',
    multi: type === 'multi',
    qa: type === 'qa',
  };
}

function getFooterCls(isSubmit, l) {
  return {
    footer: true,
    hidden: isSubmit === true || l === 0,
  };
}
function getButtonCls(isNode) {
  return {
    'submit-button': true,
    fixed: !isNode,
  };
}

class Survey extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isSubmit: false,
      userAnswers: [],
      isAlertOpen: false,
      courseIsPass: false,
      answerStatus: [],
      msgType: 'empty',
      qaWordNotFull: null,
    };
    this.noAnswerNum = '';
    this.userAnswers = [];
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.closeAlert = this.closeAlert.bind(this);
    this.setNavBar = this.setNavBar.bind(this);
    this.handleSq = :: this.handleSq;
  }

  componentDidMount() {
    const p = this.props.actions.fetchSurvey({
      id: this.props.params.survey_id,
      plan_id: this.props.params.plan_id,
      solution_id: (this.props.params.solution_id - 0) || '',
      course_id: this.props.params.course_id || '',
      chap_id: this.props.params.chap_id || '',
      chap_node_id: this.props.params.chap_node_id || '',
    });

    p.catch((err) => {
      if (err.message == 1 && this.props.afterSubmit) {
        this.props.afterSubmit();
      }
      if (err.message == 2 && this.props.afterSubmit) {
        this.props.afterSubmit();
      }
    });

    // 共享学习 判断是否已经学习
    const { actions } = this.props;
    if (this.props.params.solution_id - 0 === 0) {
      actions.fetchAssement({
        plan_id: this.props.params.plan_id,
        solution_id: 0,
        course_id: this.props.params.course_id,
      }).then(() => {
        const { course } = this.props;
        const passState = course.assessment.info.pass_state;
        this.setState({ ...this.state, courseIsPass: passState === 2 });
      });
    }
  }

  componentWillUnmount() {
    this.props.actions.initSurvey();
  }

  setNavBar(title) {
    nav.setTitle({
      title: truncate(12, title),
    });
  }

  handleChange(e, question, option) {
    if (question.type !== 'multi') {
      this.userAnswers[question.id] = option.id;
    } else {
      this.userAnswers[question.id] = this.userAnswers[question.id] || [];
      if (e.checked) {
        this.userAnswers[question.id].push(option.id);
      } else {
        const index = this.userAnswers[question.id].indexOf(option.id);
        this.userAnswers[question.id].splice(index, 1);
      }

      if (!this.userAnswers[question.id].length) {
        delete this.userAnswers[question.id];
      }
    }

    this.setState(Object.assign({}, this.state, {
      userAnswers: this.userAnswers,
    }));
  }

  handleSq(id, question, e) {
    if (question.type !== 'qa') {
      return;
    }

    const txt = e.target.value;
    const { answerStatus = status } = this.state;
    this.userAnswers[question.id] = txt;
    if (txt && answerStatus[question.id]) {
      delete status[question.id];
      this.setState({ ...this.state, answerStatus: status });
    }

    this.setState(Object.assign({}, this.state, {
      userAnswers: this.userAnswers,
    }));

    event.stopPropagation();
    event.preventDefault();
  }

  handleSubmit() {
    const { questions } = this.props;
    // const maxLength = questions.length;
    // const len = Object.keys(this.userAnswers).length;

    // if (len < maxLength) {
    //   this.noAnswerNum = maxLength - len;
    //   this.setState({ ...this.state, isAlertOpen: true, isSubmit: true });
    //   this.setState(Object.assign({}, this.state, {
    //     isSubmit: true,
    //     isAlertOpen: true,
    //   }));
    //   return;
    // }

    const data = {
      id: this.props.params.survey_id,
      plan_id: this.props.params.plan_id,
      solution_id: (this.props.params.solution_id - 0) || '',
      course_id: this.props.params.course_id || '',
      chap_id: this.props.params.chap_id || '',
      chap_node_id: this.props.params.chap_node_id || '',
      from: 'teacher',
      questions: [],
    };

    let shouldAnswerCount = 0;
    let hasAnswerCount = 0;
    const answerTags = [];
    const wordNotFull = [];
    const self = this;
    questions.forEach((quetion, i) => {
      let userAnswers = null;
      let userContent = null;
      if (quetion.type !== 'qa') {
        shouldAnswerCount += 1;
        if (self.userAnswers[quetion.id]) {
          hasAnswerCount += 1;
        }
        userAnswers = (typeof self.userAnswers[quetion.id] === 'object' ? self.userAnswers[quetion.id] : [self.userAnswers[quetion.id]]);
      } else {
        if (quetion.min > 0) {
          shouldAnswerCount += 1;
        }
        if (self.userAnswers[quetion.id] && quetion.min > 0) {
          hasAnswerCount += 1;
        }
        if (self.userAnswers[quetion.id] && self.userAnswers[quetion.id].trim().length < quetion.min && quetion.min > 0) {
          answerTags[quetion.id] = quetion.id;
          wordNotFull.push({
            index: i + 1,
            min: quetion.min,
          });
        }
        userContent = self.userAnswers[quetion.id] || '';
      }
      data.questions.push({
        id: quetion.id,
        user_answers: userAnswers,
        user_content: userContent,
      });
    });

    if (hasAnswerCount < shouldAnswerCount) {
      this.noAnswerNum = shouldAnswerCount - hasAnswerCount;
      this.setState({ ...this.state, isAlertOpen: true, isSubmit: true, answerStatus: answerTags, msgType: 'empty' });
      return;
    }

    if (wordNotFull.length > 0) {
      this.setState({
        ...this.state,
        isAlertOpen: true,
        isSubmit: true,
        qaWordNotFull: { index: wordNotFull[0].index, min: wordNotFull[0].min },
        msgType: 'word',
      });
      return;
    }

    const p = this.props.actions.submitSurvey(data);
    if (this.props.afterSubmit) {
      p.then(this.props.afterSubmit);
    }

    // 系列课中的问卷  设为已读
    if (!data.chap_id) {
      const req = {
        plan_id: this.props.params.plan_id,
        solution_id: 0,
        course_id: this.props.params.solution_id,
        chap_node_id: this.props.params.chap_node_id,
      };
      this.props.actions.readSurvey(req);
    }
  }

  closeAlert() {
    this.setState({ ...this.state, isAlertOpen: false });
  }

  render() {
    const { questions, alreadySubmit, params, isFetching } = this.props;
    const { answerStatus } = this.state;
    let questionList = null;
    let courseIsPass = this.state.courseIsPass;
    this.setNavBar(this.props.title);

    if (!alreadySubmit && questions.length) {
      questionList = (questions.map((question, index) => {
        return (
          <div className="question" key={question.id}>
            <div className="title">
              <span className="index">{index + 1}.</span>
              {
                (() => {
                  const typeName = question.type === 'single' ? 'lbSingle' : 'lbMulti';
                  return (
                    <span className={classNames(getTypeCls(question.type))}>
                      <FormattedMessage id={`app.survey.${question.type}`} />
                    </span>
                  );
                })()
              }
              <span>{question.title}</span>
              {
                (() => {
                  if (!this.state.userAnswers[question.id] && this.state.isSubmit === true) {
                    return (
                      <span className="empty"><FormattedMessage id={`${question.type !== 'qa' ? 'app.survey.notSelected' : 'app.survey.notAnswer'}`} /></span>
                    );
                  }
                  return null;
                })()
              }
              {
                question.files.map((file) => {
                  return (
                    <img src={file.url} key={file.id} alt="" />
                  );
                })
              }
            </div>
            {question.type !== 'qa' && <ul className="options">
              {
                question.options.map((option) => {
                  return (
                    <li key={option.id}>
                      {
                        (() => {
                          if (question.type === 'multi') {
                            return (<input type="checkbox" name={question.id} id={option.id} onChange={(e) => { this.handleChange(e.target, question, option); }} />);
                          }
                          return (<input type="radio" name={question.id} id={option.id} onChange={(e) => { this.handleChange(e.target, question, option); }} />);
                        })()
                      }
                      <label htmlFor={option.id} className="inputlabel">
                        {option.content}
                        {
                          option.files.map((optionFile) => {
                            return (
                              <img src={optionFile.url} key={optionFile.id} alt="" />
                            );
                          })
                        }
                      </label>
                    </li>
                  );
                })
              }
            </ul>}
            {question.type === 'qa' && <div className="options">
              <textarea
                maxLength="500"
                className={`${(answerStatus.length && answerStatus[question.id] === question.id) ? 'qa-empty' : ''}`}
                onChange={event => this.handleSq(index, question, event)}
                placeholder={`${question.min > 0 ? `(${question.min}个字以上)` : ''}`}
              />
            </div>}
          </div>
        );
      }));
    }

    // 共享学习 系列课的问卷
    if (params.solution_id - 0 > 0) {
      const { location } = this.props;
      if (location) {
        const passStatus = location.query.passStatus - 0;
        courseIsPass = passStatus === 7;
      }
    }

    if (alreadySubmit || courseIsPass) {
      questionList = (
        <div className="after-submit">
          <h3><FormattedMessage id="app.survey.submitted" /></h3>
          <h4><FormattedMessage id="app.survey.thank" /></h4>
        </div>
      );
    } else if (!isFetching && !questions.length) {
      questionList = (
        <div className="after-submit">
          <FormattedMessage id="app.survey.over" />
        </div>
      );
    }

    return (
      <div className="survey">
        {questionList}
        <div className={classNames(getFooterCls((alreadySubmit || courseIsPass), questions.length))}>
          <div className={classNames(getButtonCls(params.chap_node_id))}>
            <Button type="primary" onClick={this.handleSubmit}><FormattedMessage id="app.survey.submit" /></Button>
          </div>
        </div>
        <Alert
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isAlertOpen}
          onRequestClose={this.closeAlert}
          confirmButton={<span><FormattedMessage id="app.survey.ok" /></span>}
        >
          <span>
            {this.state.msgType === 'empty' && <FormattedMessage
              {...messages.msgTip}
              values={{ num: this.noAnswerNum }}
            />}
            {this.state.msgType === 'word' && <FormattedMessage
              {...messages.qaMsgTip}
              values={{ index: this.state.qaWordNotFull.index, min: this.state.qaWordNotFull.min }}
            />}
          </span>
        </Alert>

      </div>
    );
  }
}

Survey.propTypes = propTypes;

const mapStateToProps = (state) => {
  return {
    questions: state.survey.detail.items || [],
    title: state.survey.detail.title || '',
    alreadySubmit: state.survey.detail.alreadySubmit || false,
    readSurvey: state.survey.detail.readSurvey || false,
    isFetching: state.survey.detail.isFetching || false,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // actions: bindActionCreators(surveyActions, dispatch),
    actions: bindActionCreators(Object.assign({},
      surveyActions,
      courseActions),
      dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Survey);
