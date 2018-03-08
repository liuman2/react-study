import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Lightbox from 'react-image-lightbox';
import messages from './messages';

const propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['show', 'handle']).isRequired,
  status: PropTypes.string.isRequired,
  handle: PropTypes.func,
  showAnalysis: PropTypes.bool,
  NO: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
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
    this.images = [];
    this.state = {
      answers: this.props.data.answer,
      chooseAnswerIds: this.chooseAnswerIds,
      showImg: false,
      photoIndex: 0,
    };
  }

  handleClick(id, event) {
    const { NO, data, handle } = this.props;

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

    handle(NO - 1, this.chooseAnswerIds);
    this.setState({ chooseAnswerIds: this.chooseAnswerIds });
    event.stopPropagation();
    event.preventDefault();
  }

  handleSq(id, e) {
    const { NO, handle } = this.props;
    const txt = e.target.value;
    if (!txt) {
      this.sqAnswers.splice(id, 1);
    } else {
      this.sqAnswers[id] = txt;
    }

    handle(NO - 1, this.sqAnswers);
    event.stopPropagation();
    event.preventDefault();
  }

  handleImgClick(img, event) {
    this.setState({
      showImg: true,
      photoIndex: this.images.indexOf(img),
    });
    event.stopPropagation();
    event.preventDefault();
  }

  hiddenImageViewerClick() {
    this.setState({ showImg: false });
  }

  renderCompletion(fillingNum) {
    const { data, type, intl } = this.props;
    const str = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'];
    const list = new Array(fillingNum).fill('');
    const userContents = data.user_answer_contents || [];
    return (
      <ul className="exercise-answer">
        {list.map((item, index) => {
          return (
            <li className={`answer-input ${type === 'handle' ? '' : 'ml-24'}`} key={index}>
              <span className="answer-index">{str[index]}</span>
              {
                type === 'handle' && <input
                  type="text"
                  placeholder={intl.messages['app.exercise.placeholder']}
                  maxLength="100"
                  onChange={event => this.handleSq(index, event)}
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
    const { data, type, showAnalysis, NO, id, status, intl } = this.props;
    const { answers, chooseAnswerIds, showImg, photoIndex } = this.state;
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
    const zhTypeClass = classnames({
      'exercise-type': true,
      single: exerciseType === 'single',
      multi: exerciseType === 'multi',
      judge: exerciseType === 'judge',
      completion: exerciseType === 'completion',
      qa: exerciseType === 'qa',
    });

    let analysisContent =  '';
    if(analysis && analysis.content) {
      analysisContent = analysis.content.replace(/\n/g, '<br>');
    }
    const enTypeClass = classnames({
      'exercise-type': true,
      'en-single': exerciseType === 'single',
      'en-multi': exerciseType === 'multi',
      'en-judge': exerciseType === 'judge',
      'en-completion': exerciseType === 'completion',
      'en-qa': exerciseType === 'qa',
    });

    const renderAnswerTitle = (<p className="answer-title"><FormattedMessage {...messages.reply} />：</p>);

    this.images = [];

    return (
      <div className="exercise" id={id}>
        <div className="exercise-body">
          <div className="exercise-content">
            {exerciseType !== 'completion' &&
            <div className="content">
              <span>{`${NO}、`}</span>
              <FormattedMessage
                {...messages.type}
                values={{ enType: <i key="enType" className={enTypeClass} />, zhType: <i key="zhType" className={zhTypeClass} /> }}
              />
              {content}（{score}<FormattedMessage {...messages.unit} />）
            </div>}

            {exerciseType === 'completion' &&
            <div>
              <div className="content">
                <span>{`${NO}、`}</span>
                <FormattedMessage
                  {...messages.type}
                  values={{ enType: <i key="enType" className={enTypeClass} />, zhType: <i key="zhType" className={zhTypeClass} /> }}
                />（{score}<FormattedMessage {...messages.unit} />）
              </div>
              <div className="exercise-title" dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>}

            {imgs ?
              <ul className="exercise-img-content"> {
                imgs.map((img) => {
                  this.images.push(img.img_url);
                  return (<li
                    onClick={event => this.handleImgClick(img.img_url, event)}
                    key={img.id || img.file_id}
                    className="exercise-img"
                    style={{ background: `url(${img.img_url}) no-repeat`, backgroundSize: 'cover' }}
                  />);
                })
              }
              </ul> : null
            }
          </div>
          {/* 客观题*/}
          {(exerciseType !== 'completion' && exerciseType !== 'qa') &&
            <ul className="exercise-answer">
              {answers && answers.map((answer, index) => {
                if (answer.is_right) {
                  this.rightAnswer.push(index);
                } else if (answerRight.length) {
                  for (let i = 0, length = answerRight.length; i < length; i += 1) {
                    if (answerRight[i].is_right === 1 && answer.id === answerRight[i].id) {
                      this.rightAnswer.push(index);
                      // eslint-disable-next-line no-param-reassign
                      answer.is_right = 1;
                    }
                  }
                }

                let itemClass;
                if (type === 'show') {
                  itemClass = classnames({
                    'exercise-answer-item': true,
                    right: isRight && answer.is_right,
                    wrong: !isRight && answer.is_right,
                    active: userAnswerId.indexOf(answer.id) !== -1,
                    multi: data.type === 'multi',
                    noMulti: data.type !== 'multi',
                  });

                  return (
                    <li key={answer.id} className={itemClass}>
                      <span className="exercise-answer-item-content">{this.upperAlpha[index]}. {answer.content}</span>
                      {answer.imgs ?
                        <ul className="exercise-answer-img"> {
                          answer.imgs.map((img) => {
                            this.images.push(img.img_url);
                            return (<li
                              onClick={event => this.handleImgClick(img.img_url, event)}
                              key={img.id || img.file_id}
                              className="exercise-img"
                              style={{ background: `url(${img.img_url}) no-repeat`, backgroundSize: 'cover' }}
                            />);
                          })
                        }
                        </ul> : null
                      }
                    </li>
                  );
                }

                itemClass = classnames({
                  'exercise-answer-item': true,
                  active: chooseAnswerIds.indexOf(answer.id) !== -1,
                  multi: data.type === 'multi',
                  noMulti: data.type !== 'multi',
                });
                return (
                  <li
                    key={answer.id}
                    className={itemClass}
                    onClick={event => this.handleClick(answer.id, event)}
                  >
                    <span className="exercise-answer-item-content">{this.upperAlpha[index]}. {answer.content}</span>
                    {answer.imgs ?
                      <ul className="exercise-answer-img"> {
                        answer.imgs.map((img) => {
                          this.images.push(img.img_url);
                          return (<li
                            onClick={event => this.handleImgClick(img.img_url, event)}
                            key={img.id || img.file_id}
                            className="exercise-img"
                            style={{ background: `url(${img.img_url}) no-repeat`, backgroundSize: 'cover' }}
                          />);
                        })
                      }
                      </ul> : null
                    }
                  </li>
                );
              })}
            </ul>
          }
          {
            ((exerciseType === 'completion' || exerciseType === 'qa') && type === 'show') && renderAnswerTitle
          }
          {
            /* 填空题*/
            exerciseType === 'completion' && this.renderCompletion(fillingNum)
          }
          {
            /* 问答题*/
            (exerciseType === 'qa' && type === 'handle') &&
            <div className="exercise-answer">
              <textarea
                maxLength="500"
                onChange={event => this.handleSq(0, event)}
              ></textarea>
            </div>
          }
          {
            (exerciseType === 'qa'&& type === 'show') &&
            <div className="exercise-answer">
              <div className="ml-24" dangerouslySetInnerHTML={{ __html: qaAnswerContent }} />
            </div>
          }
        </div>
        {showAnalysis ?
          <div className="exercise-analysis">
            {
              ((exerciseType === 'qa' || exerciseType === 'completion') && status === 'checked') &&
              <div className="analysis-title mb-20">
                <FormattedMessage {...messages.resultScore} />: {data.user_score}{intl.messages['app.exercise.unit']}
              </div>
            }
            {
              ((exerciseType === 'qa' || exerciseType === 'completion') && status === 'unChecked') &&
              <div className="analysis-title uncheck mb-20">
                <FormattedMessage {...messages.resultScore} />: {intl.messages['app.exercise.unmark']}
              </div>
            }
            {
              ((exerciseType === 'qa' || exerciseType === 'completion') && status === 'checked' && data.remark) &&
              <div>
                <div className="analysis-title mb-10"><FormattedMessage {...messages.comment} /></div>
                <div className="mb-20">{data.remark}</div>
              </div>
            }
            {analysis.content && <div className="analysis-title"><FormattedMessage {...messages.analysis} /></div>}
            <p className="analysis-content" dangerouslySetInnerHTML={{ __html: analysisContent }}></p>
            {
              (exerciseType !== 'completion' && exerciseType !== 'qa') &&
              <div className="analysis-answer">
                <FormattedMessage {...messages.answer} />：{this.rightAnswer.map(value => this.upperAlpha[value]).join('')}
              </div>
            }
            {analysis.imgs ?
              <ul className="exercise-analysis-img">
                {analysis.imgs.map((img) => {
                  this.images.push(img.img_url);
                  return (<li
                    onClick={event => this.handleImgClick(img.img_url, event)}
                    key={img.id || img.file_id}
                    className="exercise-img"
                    style={{ background: `url(${img.img_url}) no-repeat`, backgroundSize: 'cover' }}
                  />);
                })}
              </ul> : null
            }
          </div> : null
        }
        {showImg ?
          <Lightbox
            mainSrc={this.images[photoIndex]}
            nextSrc={this.images[(photoIndex + 1) % this.images.length]}
            prevSrc={this.images[(photoIndex + this.images.length - 1) % this.images.length]}

            onCloseRequest={() => this.setState({ showImg: false })}
            onMovePrevRequest={() => this.setState({
              photoIndex: (photoIndex + this.images.length - 1) % this.images.length,
            })}
            onMoveNextRequest={() => this.setState({
              photoIndex: (photoIndex + 1) % this.images.length,
            })}
          /> : null
        }
      </div>
    );
  }
}

Exercise.propTypes = propTypes;
Exercise.defaultProps = defaultProps;

export default injectIntl(Exercise);
