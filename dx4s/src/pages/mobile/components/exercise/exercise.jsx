import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import ImageViewer from '../imageviewer';
import messages from './messages';

const propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['show', 'handle']).isRequired,
  status: PropTypes.string.isRequired,
  handle: PropTypes.func,
  showAnalysis: PropTypes.bool,
  intl: intlShape.isRequired,
};

const defaultProps = {
  showAnalysis: false,
  type: 'show',
  status: 'avoid',
  data: {},
  handle() { },
};

class Exercise extends Component {

  constructor(props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);
    this.handleSq = this.handleSq.bind(this);
    this.handleImgClick = this.handleImgClick.bind(this);
    this.hiddenImageViewerClick = this.hiddenImageViewerClick.bind(this);
    this.chooseAnswerIds = [];
    this.sqAnswers = [];
    this.upperAlpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    this.rightAnswer = [];
    this.isClick = false;
    this.state = {
      answers: this.props.data.answer,
      chooseAnswerIds: this.chooseAnswerIds,
      sqAnswers: this.sqAnswers,
      showImg: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.rightAnswer = [];
    this.chooseAnswerIds = nextProps.data.chooseAnswerIds || [];
    this.sqAnswers = nextProps.data.chooseAnswerIds || [];

    this.setState({
      answers: nextProps.data.answer,
      chooseAnswerIds: this.chooseAnswerIds,
      sqAnswers: this.sqAnswers,
    });
  }

  handleClick(id, event) {
    const { data, handle } = this.props;

    if (data.type !== 'multi') {
      this.chooseAnswerIds = [id];
    } else {
      const index = this.chooseAnswerIds.indexOf(id);
      if (index !== -1) {
        this.chooseAnswerIds.splice(index, 1);
      } else {
        this.chooseAnswerIds.push(id);
      }
    }

    handle(this.chooseAnswerIds);
    this.setState(Object.assign({}, this.state, { chooseAnswerIds: this.chooseAnswerIds }));
    event.stopPropagation();
    event.preventDefault();
  }

  handleSq(id, e) {
    const { handle } = this.props;
    // const { filling_num } = data;
    const txt = e.target.value;
    // if (!txt) {
    //   this.sqAnswers.splice(id, 1);
    // } else {
    //   this.sqAnswers[id] = txt;
    // }

    this.sqAnswers[id] = txt;

    handle(this.sqAnswers);
    this.setState(Object.assign({}, this.state, { sqAnswers: this.sqAnswers }));
    event.stopPropagation();
    event.preventDefault();
  }

  handleImgClick(img, event) {
    this.img = img;
    this.setState(Object.assign({}, this.state, { showImg: true }));
    event.stopPropagation();
    event.preventDefault();
  }

  hiddenImageViewerClick() {
    this.setState(Object.assign({}, this.state, { showImg: false }));
  }

  renderCompletion(fillingNum, answers) {
    const { data, type, intl } = this.props;
    const str = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'];
    const list = new Array(fillingNum).fill('');
    const userContents = data.user_answer_contents || [];
    return (
      <ul className="exercise-answer">
        {list.map((item, index) => {
          return (
            <li className="answer-input" key={index}>
              <span>{str[index]}</span>
              {
                type === 'handle' && <input
                  type="text"
                  key={index}
                  placeholder={intl.messages['app.exercise.placeholder']}
                  maxLength="100"
                  onChange={event => this.handleSq(index, event)}
                  value={(answers[index] || '')}
                />
              }
              {
                type === 'show' && <span className="answer-item">{userContents[index] || ''}</span>
              }
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    this.rightAnswer = [];
    const { data, type, showAnalysis, status, intl } = this.props;
    const { answers, chooseAnswerIds, showImg } = this.state;
    const { content, analysis, score, imgs, filling_num: fillingNum } = data;
    const exerciseType = data.type;
    const isRight = data.answer_is_right;
    const userAnswerId = data.user_answer_id || this.chooseAnswerIds || [];
    const answerRight = data.answer_right || [];
    const userAnswerContents = data.user_answer_contents || [];

    let qaAnswerContent = '';
    if (exerciseType === 'qa' && userAnswerContents.length) {
      qaAnswerContent = userAnswerContents[0].replace(/\n/g, '<br>');
    }
    let analysisContent =  '';
    if(analysis && analysis.content) {
      analysisContent = analysis.content.replace(/\n/g, '<br>');
    }
    const zhTypeClass = classnames({
      'exercise-type': true,
      single: exerciseType === 'single',
      multi: exerciseType === 'multi',
      judge: exerciseType === 'judge',
      completion: exerciseType === 'completion',
      qa: exerciseType === 'qa',
    });

    const enTypeClass = classnames({
      'exercise-type': true,
      'en-single': exerciseType === 'single',
      'en-multi': exerciseType === 'multi',
      'en-judge': exerciseType === 'judge',
      'en-completion': exerciseType === 'completion',
      'en-qa': exerciseType === 'qa',
    });

    const renderAnswerTitle = (<p className="answer-title"><FormattedMessage {...messages.reply} />：</p>);

    if (showImg) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return (
      <div className="exercise">
        <div className="exercise-body">
          {exerciseType !== 'completion' &&
          <div className="exercise-content">
            <FormattedMessage
              {...messages.type}
              values={{ enType: <i className={enTypeClass} />, zhType: <i className={zhTypeClass} /> }}
            />
            <span className="content">{content}（{score}<FormattedMessage {...messages.unit} />）</span>
            { imgs &&
              <ul className="exercise-img-content"> {
                imgs.map(img => (
                  <li
                    onClick={event => this.handleImgClick(img, event)}
                    key={img.id || img.file_id}
                    className="exercise-img"
                    // style={{ background: `url(${img.img_url}) no-repeat`, backgroundSize: 'cover' }}
                  >
                    <img style={{maxWidth:'100%'}} src={`${img.img_url}`} />
                  </li>
                ))
              }
              </ul>
            }
          </div>}
          {exerciseType === 'completion' &&
          <div className="exercise-content">
            <FormattedMessage
              {...messages.type}
              values={{ enType: <i className={enTypeClass} />, zhType: <i className={zhTypeClass} /> }}
            />
              <span className="content" style={{ float: 'right' }}>
               （{score}<FormattedMessage {...messages.unit} />）
              </span>
              <div className="exercise-title" dangerouslySetInnerHTML={{ __html: content }}></div>
            { imgs &&
              <ul className="exercise-img-content"> {
                imgs.map(img => (
                  <li onClick={event => this.handleImgClick(img, event)} key={img.id || img.file_id} className="exercise-img" style={{ background: `url(${img.img_url}) no-repeat`, backgroundSize: 'cover' }} />
                ))
              }
              </ul>
            }
          </div>}

          {/* 客观题*/}
          {(exerciseType !== 'completion' && exerciseType !== 'qa') &&
            <ul className="exercise-answer">
              {
                answers.map((answer, index) => {
                  const cloneAnswer = answer;

                  if (cloneAnswer.is_right) {
                    this.rightAnswer.push(index);
                  } else if (answerRight.length) {
                    for (let i = 0, length = answerRight.length; i < length; i += 1) {
                      if (answerRight[i].is_right === 1 && cloneAnswer.id === answerRight[i].id) {
                        this.rightAnswer.push(index);
                      }
                    }
                  }

                  let itemClass;
                  if (type === 'show') {
                    if (answerRight.length) {
                      itemClass = classnames({
                        'exercise-answer-item': true,
                        active: userAnswerId.indexOf(cloneAnswer.id) !== -1,
                      });
                    } else {
                      itemClass = classnames({
                        'exercise-answer-item': true,
                        choose: !isRight && userAnswerId.indexOf(cloneAnswer.id) !== -1,
                        active: isRight && userAnswerId.indexOf(cloneAnswer.id) !== -1,
                      });
                    }

                    return (
                      <li key={cloneAnswer.id} className={itemClass}>
                        <span className="exercise-answer-item-content">{this.upperAlpha[index]}. {cloneAnswer.content}</span>
                        { cloneAnswer.imgs &&
                          <ul className="exercise-answer-img"> {
                            cloneAnswer.imgs.map(img => (
                              <li onClick={event => this.handleImgClick(img, event)} key={img.id} className="exercise-img" style={{ background: `url(${img.img_url}) no-repeat`, backgroundSize: 'cover' }} />
                            ))
                          }
                          </ul>
                        }
                      </li>
                    );
                  }
                  if (chooseAnswerIds.indexOf(cloneAnswer.id) !== -1) {
                    cloneAnswer.active = true;
                  } else {
                    cloneAnswer.active = false;
                  }
                  itemClass = classnames({
                    'exercise-answer-item': true,
                    active: cloneAnswer.active,
                  });
                  return (
                    <li
                      key={cloneAnswer.id}
                      className={itemClass}
                      onClick={event => this.handleClick(cloneAnswer.id, event)}
                    >
                      <span className="exercise-answer-item-content">{this.upperAlpha[index]}. {cloneAnswer.content}</span>
                      { cloneAnswer.imgs &&
                        <ul className="exercise-answer-img"> {
                          cloneAnswer.imgs.map(img => (
                            <li onClick={event => this.handleImgClick(img, event)} key={img.id} className="exercise-img" style={{ background: `url(${img.img_url}) no-repeat`, backgroundSize: 'cover' }} />
                          ))
                        }
                        </ul>
                      }
                    </li>
                  );
                })
              }
            </ul>
          }

          {
            ((exerciseType === 'completion' || exerciseType === 'qa') && type === 'show') && renderAnswerTitle
          }
          {
            /* 填空题*/
            exerciseType === 'completion' && this.renderCompletion(fillingNum, userAnswerId)
          }
          {
            /* 问答题*/
            (exerciseType === 'qa' && type === 'handle') &&
            <div className="exercise-answer">
              <textarea
                maxLength="500"
                onChange={event => this.handleSq(0, event)}
                value={(userAnswerId[0] || '')}
              />
            </div>
          }
          {
            (exerciseType === 'qa'&& type === 'show') &&
            <div className="exercise-answer">
              <div className="ml-24" dangerouslySetInnerHTML={{ __html: qaAnswerContent }} />
            </div>
          }
        </div>
        {
          showAnalysis && (
            <div className="exercise-analysis">
              {
                ((exerciseType === 'qa' || exerciseType === 'completion') && status === 'checked') &&
                <div className="analysis-title">
                  <FormattedMessage {...messages.resultScore} />: {data.user_score}{intl.messages['app.exercise.unit']}
                </div>
              }
              {
                ((exerciseType === 'qa' || exerciseType === 'completion') && status === 'unChecked') &&
                <div className="analysis-title uncheck">
                  <FormattedMessage {...messages.resultScore} />: {intl.messages['app.exercise.unmark']}
                </div>
              }
              {
                ((exerciseType === 'qa' || exerciseType === 'completion') && status === 'checked' && data.remark) &&
                <div>
                  <div className="analysis-title"><FormattedMessage {...messages.comment} /></div>
                  <div className="mb20">{data.remark}</div>
                </div>
              }

              {analysis.content && <div className="analysis-title"><FormattedMessage {...messages.analysis} /></div>}
              <p className="analysis-content" dangerouslySetInnerHTML={{ __html: analysisContent }}></p>
              {(exerciseType !== 'completion' && exerciseType !== 'qa') && <div className="analysis-answer"><FormattedMessage {...messages.answer} />：{this.rightAnswer.map(value => this.upperAlpha[value]).join('')}</div>}
              { analysis.imgs &&
                <ul className="exercise-analysis-img"> {
                  analysis.imgs.map(img => (
                    <li
                      onClick={event => this.handleImgClick(img, event)}
                      key={img.id}
                      className="exercise-img"
                      style={{ background: `url(${img.img_url}) no-repeat`, backgroundSize: 'cover' }}
                    />
                  ))
                }
                </ul>
              }
            </div>
          )
        }
        {
          showImg && (
            <div className="exercise-image-viewer" onClick={this.hiddenImageViewerClick}>
              <ImageViewer imageUrl={this.img.img_url} />
            </div>
          )
        }
      </div>
    );
  }
}

Exercise.propTypes = propTypes;
Exercise.defaultProps = defaultProps;

export default injectIntl(Exercise);
