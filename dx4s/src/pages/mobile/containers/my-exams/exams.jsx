import React, { Component } from 'react';
import api from 'utils/api';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { nav } from 'utils/dx';
import Pulltext from '../../../../components/pulltext';
import RefreshLoad from '../../components/refreshload';
import { Alert } from '../../../../components/modal';

const fetchSizeInit = 10;
const contextTypes = {
  intl: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};

class Exams extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      exams: [],
      fetchIndex: 0,
      fetchSize: fetchSizeInit,
      isFetching: false,
      isExamsDate: true,
      needPullUp: true,
      isTofetchData: false,
      key: 0,
      isAlertOpen: false,
      clickedCard: null,
    };
    this.fetchExamsList = ::this.fetchExamsList;
    this.setNavBar = ::this.setNavBar;
    this.pullDownCallBack = ::this.pullDownCallBack;
    this.pullUpCallBack = ::this.pullUpCallBack;
    this.refreshLoad = ::this.refreshLoad;

    this.onCardClick = ::this.onCardClick;
    this.onAlertConfirm = ::this.onAlertConfirm;
  }

  componentDidMount() {
    this.fetchExamsList();
  }

  componentWillUnmount() {
  }

  pullDownCallBack(cb) {
    this.refreshLoad(cb);
  }

  pullUpCallBack(cb) {
    this.fetchExamsList(cb);
  }

  setNavBar() {
    nav.setTitle({
      title: this.context.intl.messages['app.exams.title'],
    });
  }

  onCardClick(item) {
    const router = this.context.router;
    const to = `/plan/${item.plan.id}/series/${item.solution_id || 0}/exams/${item.quiz_id}`;

    if (item.item_type === 'live') {
      router.push(router.createPath(to));
      return;
    }
    if (item.valid_status === undefined) {
      router.push(router.createPath(to));
      return;
    }

    if (item.valid_status !== 'invalid') {
      router.push(router.createPath(to));
      return;
    }

    if (item.valid_click === true) {
      router.push(router.createPath(to));
      return;
    }

    if (!item.is_finished && item.exam_unchecked !== true) {
      this.setState({ ...this.state, isAlertOpen: true, clickedCard: item });
      return;
    }

    router.push(router.createPath(to));
  }

  onAlertConfirm() {
    const clickedCard = this.state.clickedCard;
    const confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/0/quiz/${clickedCard.quiz_id}/invalid/confirm`;

    api({ method: 'PUT', url: confirmUrl }).then(() => {
      const to = `/plan/${this.state.clickedCard.plan.id}/series/${this.state.clickedCard.solution_id || 0}/exams/${this.state.clickedCard.quiz_id}`;
      this.setState({ ...this.state, isAlertOpen: false, clickedCard: null });
      const router = this.context.router;
      router.push(router.createPath(to));
    });
  }

  refreshLoad(cb) {
    const self = this;
    api({
      url: '/training/quizs/my',
      params: {
        index: 1,
        size: self.state.fetchSize,
        type: 0,
      },
    }).then(function(resp) {
      const exams = resp.data;
      const isExamsDate = exams.length <= self.state.fetchSize;
      let needPullUp = true;
      if (exams.length < self.state.fetchSize) {
        needPullUp = false;
      }
      self.setState({
        fetchIndex: 1,
        exams: exams,
        isExamsDate: isExamsDate,
        needPullUp: needPullUp,
      }, cb);
    });
  }

  // 获取数据
  fetchExamsList(cb) {
    const self = this;
    const fetchIndex = self.state.fetchIndex + 1;
    // 请求
    function fetchList() {
      (async function fetchData() {
        const fetchExams = await api({
          url: '/training/quizs/my',
          params: {
            index: self.state.fetchIndex,
            size: self.state.fetchSize,
            type: 0,
          },
        });
        const exams = self.state.exams.concat(fetchExams.data);
        const isExamsDate = fetchExams.data.length === self.state.fetchSize;
        let needPullUp = true;
        if (fetchExams.data.length !== self.state.fetchSize) {
          needPullUp = false;
        }
        const rndNum = Math.random();
        self.setState({ exams, isExamsDate, needPullUp, isTofetchData: true, isFetching: false, key: rndNum });
        if (cb)
          cb();
      }());
    }

    self.setState({ fetchIndex, isFetching: true }, fetchList);
  }


  getLoadText() {
    if (!this.state.isExamsDate)
      return (
        <Pulltext isMore={this.state.isExamsDate} />
      )
    return '';
  }

  renderValidStatus(courseInfo) {
    // if (courseInfo.is_elective) {
    //   return null;
    // }

    if (courseInfo.item_type === 'live') {
      return null;
    }

    if (courseInfo.exam_unchecked === true) {
      return (
        /* 未批阅*/
        <div className="valid-status not-mark">
          <FormattedMessage id="app.exams.validStatusNotMark" />
        </div>
      );
    }

    const notStartEl = (
      /* 尚未开始*/
      <div className="valid-status not-started">
        <FormattedMessage id="app.exams.validStatusNotStart" />
      </div>
    );

    const invalidEl = (
      /* 已过期*/
      <div className="valid-status invalid">
        <FormattedMessage id="app.exams.validStatusInvalid" />
      </div>
    );

    const validStatus = courseInfo.valid_status;
    const isFinished = courseInfo.is_finished;
    const validConfirm = courseInfo.valid_click;
    const isPass = courseInfo.is_pass;
    const validTime = courseInfo.valid_time;

    const validTimeEnd = courseInfo.valid_time_end;
    const validTimeStart = courseInfo.valid_time_start;

    switch (validStatus) {
      // 尚未开始
      case 'notStarted':
        return notStartEl;
      // 已过期
      case 'invalid':
        {
          if (!isFinished) {
            // 过期未确认
            if (!validConfirm) {
              return invalidEl;
            }

            if (validTimeEnd === null && validTimeStart === null) {
              return null;
            }

            return (
              /* 未学未通过*/
              <div className="valid-status not-study">
                <FormattedMessage id="app.exams.validStatusNotStudy" />
              </div>
            );
          }

          return isPass ? (
            /* 已学已通过*/
            <div>
              <div className="valid-status pass">
                <FormattedMessage id="app.exams.validStatusPass" />
                <span>{courseInfo.score}</span>
              </div>
              <span className="score pass">
                <FormattedMessage
                  id="app.myExams.points"
                  values={{ score: courseInfo.score.toString() }}
                />
              </span>
            </div>
          ) : (
            /* 已学未通过*/
            <div>
              <div className="valid-status not-pass">
                <FormattedMessage id="app.exams.validStatusNotPass" />
              </div>
              <span className="score failed">
                <FormattedMessage
                  id="app.myExams.points"
                  values={{ score: courseInfo.score.toString() }}
                />
              </span>
            </div>
          );
        }
      // 有效期
      case 'valid':
        {
          if (!isFinished) {
            if (validTime) {
              return <div className="valid-status will-invalid">{validTime}</div>;
            }
            return null;
          }

          return isPass ? (
            /* 已学已通过*/
            <div>
              <div className="valid-status pass">
                <FormattedMessage id="app.exams.validStatusPass" />
              </div>
              <span className="score pass">
                <FormattedMessage
                  id="app.myExams.points"
                  values={{ score: courseInfo.score.toString() }}
                />
              </span>
            </div>
          ) : (
            /* 已学未通过*/
            <div>
              <div className="valid-status not-pass">
                <FormattedMessage id="app.exams.validStatusNotPass" />
              </div>
              <span className="score failed">
                <FormattedMessage
                  id="app.myExams.points"
                  values={{ score: courseInfo.score.toString() }}
                />
              </span>
            </div>
          );
        }
      default:
        return null;
    }
  }

  render() {
    this.setNavBar();

    if (this.state.exams.length > 0) {
      return (
        <RefreshLoad pullDownCallBack={this.pullDownCallBack} needPullUp={this.state.needPullUp}
                     pullUpCallBack={this.pullUpCallBack}>
          <div className="my-exams">
            <ul className="card card-horizontal">
              {this.state.exams.map((item, index) => {
                const linkTo = `/plan/${item.plan.id}/series/${item.solution_id || 0}/exams/${item.quiz_id}`;
                return (
                  <li key={index} onClick={() => this.onCardClick(item) }>
                    <a to={linkTo} style={{ color: '#333' }}>
                      <div className="card-img">
                        <img alt={item.name} src={item.img} />
                      </div>
                      <div className="card-text">
                        <p className="name">
                          {item.name}
                          {(() => {
                            /*if (item.finish_status === 1) {
                              const percentage = parseInt(item.score, 10);

                              if (item.pass_status === 1) {
                                if (item.score_type === 1) {
                                  return <span className="score passed">{ percentage } %</span>;
                                }
                                return <span className="score passed"><FormattedMessage id="app.myExams.points"
                                                                                        values={{ score: item.score.toString() }} /></span>;
                              }

                              if (item.score_type === 1) {
                                return <span className="score failed">{ percentage } %</span>;
                              }
                              return <span className="score failed"><FormattedMessage id="app.myExams.points"
                                                                                      values={{ score: item.score.toString() }} /></span>;
                            }
                            return null;*/
                          })() }
                        </p>

                        {(() => {
                          // if (item.finish_status === 1) {
                          //   if (item.pass_status === 1) {
                          //     return <p className="pass-status passed"><FormattedMessage id="app.myExams.passed" /></p>;
                          //   }
                          //   return <p className="pass-status failed"><FormattedMessage id="app.myExams.failed" /></p>;
                          // }

                          // if (item.rest_chance > 0) {
                          //   return <p className="rest-chance"><FormattedMessage
                          //     id="app.myExams.restChance" values={{ chances: item.rest_chance }} /></p>;
                          // } else if (item.rest_chance < 0) {
                          //   return <p className="rest-chance"><FormattedMessage
                          //     id="app.myExams.unlimitedRestChance" /></p>;
                          // }

                          // return null;
                        })() }
                        {this.renderValidStatus(item)}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
            {this.getLoadText()}
            <Alert
              shouldCloseOnOverlayClick={false}
              isOpen={this.state.isAlertOpen}
              onRequestClose={this.onAlertConfirm}
              confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
            >
              <FormattedMessage id="app.home.invalidMsg" />
            </Alert>
          </div>
        </RefreshLoad>
      );
    } else if (this.state.exams.length == 0) {
      return (
        <RefreshLoad needPullUp={false} key={this.state.key}>
          <div className="list-no-msg">
            <p><FormattedMessage id="app.myExams.noMsg" /></p>
          </div>
        </RefreshLoad>
      );
    }
    return null;
  }
}
Exams.contextTypes = contextTypes;
export default Exams;
