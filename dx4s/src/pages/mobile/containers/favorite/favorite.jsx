import React, { Component } from 'react';
import api from 'utils/api';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { nav } from 'utils/dx';
import Pulltext from '../../../../components/pulltext';
import RefreshLoad from '../../components/refreshload';
import messages from './messages';
import { Alert } from '../../../../components/modal';


const fetchSizeInit = 10;
const contextTypes = {
  intl: React.PropTypes.object.isRequired,
  router: React.PropTypes.object.isRequired,
};
class Favorite extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      favorite: [],
      fetchIndex: 0,
      fetchSize: fetchSizeInit,
      isFetching: false,
      isfavoriteDate: true,
      isTofetchData: false,
      needPullUp: true,
      isAlertOpen: false,
      clickedCard: null,
    };

    this.handleDelete = ::this.handleDelete;
    this.fetchFavoriteList = ::this.fetchFavoriteList;
    this.setNavBar = ::this.setNavBar;
    this.pullDownCallBack = ::this.pullDownCallBack;
    this.pullUpCallBack = ::this.pullUpCallBack;
    this.refreshLoad = ::this.refreshLoad;
    this.onAlertConfirm = ::this.onAlertConfirm;
  }

  componentDidMount() {
    this.fetchFavoriteList();
    window.addEventListener('scroll', this.bodyScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.bodyScroll);
  }

  setNavBar() {
    nav.setTitle({
      title: this.context.intl.messages['app.favorite.title'],
    });
  }

  pullUpCallBack(cb) {
    this.fetchFavoriteList("", cb);
  }

  pullDownCallBack(cb) {
    this.refreshLoad(cb);
  }

  refreshLoad(cb) {
    const self = this;
    api({
      url: '/training/my/favor/list',
      params: {
        index: 1,
        size: self.state.fetchSize,
      },
    }).then(function(resp) {
      let favorite = resp.data;
      const isfavoriteDate = resp.data.length === self.state.fetchSize;
      let needPullUp = true;
      if (favorite.length < self.state.fetchSize) {
        needPullUp = false;
      }
      self.setState({
        favorite,
        isfavoriteDate,
        isTofetchData: true,
        isFetching: false,
        needPullUp,
        fetchIndex: 1
      }, cb);
    });
  }


// 获取数据
  fetchFavoriteList(type, cb) {
    const self = this;
    let fetchIndex;
    let fetchSize;

    if (type === 'delete') {
      fetchIndex = 1;
      fetchSize = self.state.favorite.length;
    } else {
      fetchIndex = self.state.fetchIndex + 1;
      fetchSize = fetchSizeInit;
    }
    // 请求
    function fetchList() {
      (async function fetchData() {
        const fetchFavorite = await api({
          url: '/training/my/favor/list',
          params: {
            index: self.state.fetchIndex,
            size: self.state.fetchSize,
          },
        });

        let favorite;

        if (type === 'delete') {
          favorite = fetchFavorite.data;
        } else {
          favorite = self.state.favorite.concat(fetchFavorite.data);
        }

        const isfavoriteDate = fetchFavorite.data.length === self.state.fetchSize;

        let needPullUp = true;
        if (fetchFavorite.data.length < self.state.fetchSize) {
          needPullUp = false;
        }
        self.setState({ favorite, isfavoriteDate, isTofetchData: true, isFetching: false, needPullUp });
        if (cb)
          cb();
      }());
    }
    self.setState({ fetchIndex, fetchSize, isFetching: true }, fetchList);
  }

  getLoadText() {
    if (!this.state.isfavoriteDate)
      return (
        <Pulltext isMore={this.state.isfavoriteDate} />
      )
    return '';
  }

// 删除收藏
  handleDelete(planId, courseId, solutionId) {
    const self = this;
    (async function fetchData() {
      await api({
        method: 'PUT',
        url: `/training/plan/${planId}/solution/${(solutionId || 0)}/course/${courseId}/favor`,
        data: {
          is_favor: false,
        },
      });

      self.fetchFavoriteList('delete');
    }());
  }

  onItemClick(item) {
    const router = this.context.router;
    const to = `/plan/${item.plan.id}/series/${item.solution_id || 0}/courses/${item.task_id}`;

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

    if (!item.is_finished) {
      this.setState({ ...this.state, isAlertOpen: true, clickedCard: item });
      return;
    }

    router.push(router.createPath(to));
  }

  onAlertConfirm() {
    const clickedCard = this.state.clickedCard;
    const cardType = clickedCard.type;
    let confirmUrl = '';
    switch (cardType) {
      case 'course':
        confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/0/course/${clickedCard.task_id}/invalid/confirm`;
        break;
      case 'solution':
        confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/${clickedCard.task_id}/invalid/confirm`;
        break;
      case 'exam':
        confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/0/quiz/${clickedCard.task_id}/invalid/confirm`;
        break;
      default:
        break;
    }

    api({ method: 'PUT', url: confirmUrl }).then(() => {
      const to = `/plan/${this.state.clickedCard.plan.id}/series/${this.state.clickedCard.solution_id || 0}/courses/${this.state.clickedCard.task_id}`;
      this.setState({ ...this.state, isAlertOpen: false, clickedCard: null });
      const router = this.context.router;
      router.push(router.createPath(to));
    });
  }

  renderValidStatus(courseInfo) {
    // if (courseInfo.is_elective) {
    //   return null;
    // }

    // if (courseInfo.item_type === 'live') {
    //   return null;
    // }

    const notStartEl = (
      <div className="valid-status not-started">
        <FormattedMessage {...messages.validStatusNotStart} />
      </div>
    );

    const invalidEl = (
      <div className="valid-status invalid">
        <FormattedMessage {...messages.validStatusInvalid} />
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
              <div className="valid-status not-study" />
            );
          }

          return isPass ? (
            <div className="valid-status pass" />
          ) : (
            <div className="valid-status not-pass" />
          );
        }
      // 有效期
      case 'valid':
        {
          if (!isFinished) {
            if (validTime) {
              return <div className="valid-status will-invalid">{validTime}</div>;
            }

            if (validTimeEnd === null && validTimeStart === null) {
              return null;
            }

            // 有效期内未完成
            if (!isPass) {
              return null;
            }

            return (
              <div className="valid-status not-study" />
            );
          }

          return isPass ? (
            <div className="valid-status pass" />
          ) : (
            <div className="valid-status not-pass" />
          );
        }
      default:
        return null;
    }
  }

  render() {
    this.setNavBar();

    if (this.state.favorite.length > 0) {
      return (
        <RefreshLoad  pullUpCallBack={this.pullUpCallBack}
                     pullDownCallBack={this.pullDownCallBack} needPullUp={this.state.needPullUp}>
          <div className="favorite">
            <ul className="dx-list">
              {this.state.favorite.map((item, index) => {
                return (
                  <li
                    key={index}
                    className="one-slide"
                  >
                    <div className="dx-flex-box">
                      <div className="dx-flex-img" onClick={() => { this.onItemClick(item); }}>
                        <img alt={item.task_name} src={item.img} />
                        <span className="type-icon"><FormattedMessage id="app.favorite.type" /></span>
                      </div>
                      <div className="dx-flex-info" onClick={() => { this.onItemClick(item); }}>
                        <div>
                          <div className="dx-flex-info-title mb0 ">{item.task_name}</div>
                          {this.renderValidStatus(item)}
                        </div>
                      </div>
                      <div className="dx-flex-operation">
                        <a className="remove" onClick={(event) => { event.stopPropagation(); this.handleDelete(item.plan.id, item.task_id, item.solution_id); }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {/*<ul className="card card-horizontal">
              {this.state.favorite.map((item, index) => {
                return (
                  <li
                    key={index}
                    onClick={() => { this.onItemClick(item); }}
                  >
                    <div className="card-img">
                      <a>
                        <img alt={item.task_name} src={item.img} />
                        <span className="type-icon"><FormattedMessage id="app.favorite.type" /></span>
                      </a>
                    </div>
                    <div className="card-text">
                      <p className="name">
                        <a>
                          {item.task_name}
                        </a>
                      </p>
                      {this.renderValidStatus(item)}
                      <i className="icon icon-delete" onClick={(event) => { event.stopPropagation(); this.handleDelete(item.plan.id, item.task_id, item.solution_id); }} />
                    </div>
                  </li>
                );
              })}
            </ul>*/}
            {this.getLoadText()}
            <Alert
              shouldCloseOnOverlayClick={false}
              isOpen={this.state.isAlertOpen}
              onRequestClose={this.onAlertConfirm}
              confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
            >
              <FormattedMessage id="app.favorite.invalidMsg" />
            </Alert>
          </div>
        </RefreshLoad>
      );
    } else if (this.state.isTofetchData) {
      return (
        <div className="list-no-msg">
          <p><FormattedMessage id="app.favorite.noMsg" /></p>
        </div>
      );
    }
    return null;
  }
}
Favorite.contextTypes = contextTypes;
export default Favorite;
