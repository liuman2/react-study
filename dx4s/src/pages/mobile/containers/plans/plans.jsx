import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { nav } from 'utils/dx';
import api from 'utils/api';
import { plans as plansActions } from '../../actions';
import messages from './messages';
import noMessage from './img/noMessage.png';
import RefreshLoad from '../../components/refreshload';
import { Alert } from '../../../../components/modal';

const propTypes = {
  actions: PropTypes.object.isRequired,
  all: PropTypes.array.isRequired,
  required: PropTypes.array.isRequired,
  minors: PropTypes.array.isRequired,
  ownPurchase: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  active: PropTypes.string.isRequired,
  allEnd: PropTypes.bool.isRequired,
  requiredEnd: PropTypes.bool.isRequired,
  electiveEnd: PropTypes.bool.isRequired,
  ownBuyEnd: PropTypes.bool.isRequired,
};

const contextTypes = {
  intl: React.PropTypes.object.isRequired,
  router: React.PropTypes.object.isRequired,
};
class Plans extends Component {
  constructor(props, context) {
    super(props, context);
    this.listScroll = this.listScroll.bind(this);

    this.initAll = true;
    this.initRequire = false;
    this.initElective = false;
    this.initOwnBuy = false;

    this.finishIndex = 0;
    this.setNavBar = this.setNavBar.bind(this);
    this.tab = this.tab.bind(this);
    this.pullDownCallback = this.pullDownCallback.bind(this);
    this.pullUpCallBack = this.pullUpCallBack.bind(this);
    this.renderValidStatus = ::this.renderValidStatus;

    this.onItemClick = ::this.onItemClick;
    this.linkTo = ::this.linkTo;
    this.onAlertConfirm = ::this.onAlertConfirm;
    this.state = {
      key: 0,
      isAlertOpen: false,
      clickedCard: null,
    };
  }

  componentWillMount() {
    const { actions } = this.props;
    actions.fetchNew();
  }

  componentDidMount() {
    const { actions, active } = this.props;
    const self = this;
    let fetchPromise = null;
    // 激活tab
    actions.fetchActive('all');
    // 按状态调用数据
    switch (active) {
      case 'all':
        fetchPromise = actions.fetchAllPlans(1);
        break;
      case 'required':
        fetchPromise = actions.fetchRequiredPlans(1);
        break;
      case 'minors':
        fetchPromise = actions.fetchElectivePlans(1);
        break;
      case 'ownPurchase':
        fetchPromise = actions.fetchOwnPurchasePlans(1);
        break;
      default:
        break;
    }
    // 回调
    fetchPromise.then(() => {
      // 重设初始化
      self.initUnfinish = false;
      self.initFinish = true;
      self.setState({ key: Math.random() });
    });
  }

  onItemClick(item) {
    const router = this.context.router;
    const to = this.linkTo(item);

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
    const cardType = clickedCard.item_type;
    let confirmUrl = '';
    switch (cardType) {
      case 'course':
        confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/0/course/${clickedCard.item_id}/invalid/confirm`;
        break;
      case 'solution':
        confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/${clickedCard.item_id}/invalid/confirm`;
        break;
      case 'exam':
        confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/0/quiz/${clickedCard.item_id}/invalid/confirm`;
        break;
      default:
        break;
    }

    api({ method: 'PUT', url: confirmUrl }).then(() => {
      const to = this.linkTo(this.state.clickedCard);
      this.setState({ ...this.state, isAlertOpen: false, clickedCard: null });
      const router = this.context.router;
      router.push(router.createPath(to));
    });
  }

  setNavBar() {
    nav.setTitle({
      title: this.context.intl.messages['app.plan.title'],
    });
  }

  linkTo(item) {
    const temp = item;
    if (!item.plan) {
      temp.plan = { id: 0 };
    }
    const type = item.item_type || item.type;
    const id = item.item_id || item.id;
    const pid = temp.plan.id;
    switch (type) {
      case 'course':
        return `/plan/${pid}/series/0/courses/${id}`;
      case 'solution':
        return `/plan/${pid}/series/${id}`;
      case 'exam':
        return `/plan/${pid}/series/0/exams/${id}`;
      case 'live':
        return `/lives/${id}`;
      default:
        return null;
    }
  }

  pullUpCallBack(cb) {
    this.listScroll(cb);
  }

  pullDownCallback(cb) {
    const { actions, active } = this.props;
    actions.fetchNew();
    setTimeout(() => {
      // 调用
      switch (active) {
        case 'all':
          actions.fetchAllPlans(1).then(cb);
          break;
        case 'required':
          actions.fetchRequiredPlans(1).then(cb);
          break;
        case 'minors':
          actions.fetchElectivePlans(1).then(cb);
          break;
        case 'ownPurchase':
          actions.fetchOwnPurchasePlans(1).then(cb);
          break;
        default:
          break;
      }
    }, 50);
  }

  tab(i) {
    const {
      actions, all, required, minors, ownPurchase, allEnd, requiredEnd, electiveEnd, ownBuyEnd, isFetching,
    } = this.props;
    // 判断tab
    actions.fetchActive(i);
    switch (i) {
      case 'all': // 全部
        if (allEnd !== true && isFetching === false) {
          if (all.length < 1) {
            actions.fetchAllPlans(1).then(() => {
              this.initAll = true;
              this.setState({ key: Math.random() });
            });
          } else {
            this.setState({ key: Math.random() });
          }
        } else {
          this.setState({ key: Math.random() });
        }
        break;
      case 'required': // 必修
        if (requiredEnd !== true && isFetching === false) {
          if (required.length < 1) {
            actions.fetchRequiredPlans(1).then(() => {
              this.initRequire = true;
              this.setState({ key: Math.random() });
            });
          } else {
            this.setState({ key: Math.random() });
          }
        } else {
          this.setState({ key: Math.random() });
        }
        break;
      case 'minors': // 选修
        if (electiveEnd !== true && isFetching === false) {
          if (minors.length < 1) {
            actions.fetchElectivePlans(1).then(() => {
              this.initElective = true;
              this.setState({ key: Math.random() });
            });
          } else {
            this.setState({ key: Math.random() });
          }
        } else {
          this.setState({ key: Math.random() });
        }

        break;
      case 'ownPurchase': // 自购
        if (ownBuyEnd !== true && isFetching === false) {
          if (ownPurchase.length < 1) {
            actions.fetchOwnPurchasePlans(1).then(() => {
              this.initOwnBuy = true;
              this.setState({ key: Math.random() });
            });
          } else {
            this.setState({ key: Math.random() });
          }
        } else {
          this.setState({ key: Math.random() });
        }
        break;
      default:
        break;
    }
  }


  listScroll(cb) {
    const { actions, active, allEnd, requiredEnd, electiveEnd, ownBuyEnd, isFetching } = this.props;
    let fetchPromise = null;

    switch (active) {
      case 'all':
        if (allEnd !== true && isFetching === false) {
          fetchPromise = actions.fetchAllPlans();
        }
        break;
      case 'required':
        if (requiredEnd !== true && isFetching === false) {
          fetchPromise = actions.fetchRequiredPlans();
        }

        break;
      case 'minors':
        if (electiveEnd !== true && isFetching === false) {
          fetchPromise = actions.fetchMinorsPlans();
        }
        break;
      case 'ownPurchase':
        if (ownBuyEnd !== true && isFetching === false) {
          fetchPromise = actions.fetchOwnPurchasePlans();
        }
        break;
      default:
        break;
    }
    // promise回调
    if (fetchPromise != null) {
      fetchPromise.then(() => {
        if (cb) {
          cb();
        }
      });
    }
  }

  outPut(list) {
    const { isFetching, active } = this.props;
    if (list.length > 0) {
      return (
        <ul id="plansUl" className="card card-horizontal">
          {list.map((item, index) => {
            const TextIcon = classNames({
              hidden: active !== 'all',
              plansTextIcon: true,
              plansTextIconGreen: item.is_elective === true,
              plansTextIconBlue: item.is_elective === false,
              planTextIconOrange: item.task_source === 'personal' || item.task_source === 'exchange',  // TODO
            });
            if (!item.plan)
              item.plan = { id: 0 };
            let iconFont;
            let linkTo;
            let iconBg;

            if (item.is_new) {
              iconFont = 'New';
              iconBg = 'type-icon icon-bg-new';
              switch (item.item_type) {
                case 'course':
                  linkTo = `/plan/${item.plan.id}/series/${item.solution_id || 0}/courses/${item.item_id}`;
                  break;
                case 'exam':
                  linkTo = `/plan/${item.plan.id}/series/${item.solution_id || 0}/exams/${item.item_id}`;
                  break;
                case 'solution':
                  linkTo = `plan/${item.plan.id}/series/${item.item_id}`;
                  break;
                default:
              }
            } else {
              switch (item.item_type) {
                case 'course':
                  iconFont = <FormattedMessage {...messages.mini} />;
                  linkTo = `/plan/${item.plan.id}/series/${item.solution_id || 0}/courses/${item.item_id}`;
                  iconBg = 'type-icon';
                  break;
                case 'exam':
                  linkTo = `/plan/${item.plan.id}/series/${item.solution_id || 0}/exams/${item.item_id}`;
                  iconFont = <FormattedMessage {...messages.exam} />;
                  iconBg = 'type-icon icon-bg-exam';
                  break;
                case 'trainingClass':
                  iconFont = <FormattedMessage {...messages.trainingClass} />;
                  iconBg = 'type-icon icon-bg-trainingClass';
                  break;
                case 'solution':
                  iconFont = <FormattedMessage {...messages.solution} />;
                  linkTo = `plan/${item.plan.id}/series/${item.item_id}`;
                  iconBg = 'type-icon icon-bg-solution';
                  break;
                default:
              }
            }
            return (
              <li
                key={`${item.item_id}_${index}`}
                onClick={() => {
                  // const path = linkTo;
                  // this.context.router.push(path);
                  this.onItemClick(item);
                }}
              >
                <div className="card-img">
                  <a to={linkTo}>
                    <img alt={item.item_name} src={item.item_img_url} />
                    {
                      (() =>
                         item.item_type != 'course' || item.is_new ? (
                            <span className={iconBg}>{iconFont}</span>) : null
                      )()
                    }
                  </a>
                </div>
                <div className="card-text plansText">
                  <p><a to={linkTo}>{item.item_name}</a></p>
                  <div className={TextIcon}>
                    {(() => {
                      switch (item.task_source) {
                        case 'training':
                          return <FormattedMessage {...messages.required} />;
                        case 'elective':
                          return <FormattedMessage {...messages.minors} />;
                        case 'personal':
                          return <FormattedMessage {...messages.ownPurchase} />;
                        case 'exchange':
                          return <FormattedMessage {...messages.exchange} />;
                        default:
                          return null;
                      }
                    })()
                    }
                  </div>
                  {this.renderValidStatus(item)}

                  {
                    /*(() => {
                      if (item.is_finished) {
                        return (
                          <div className="finish-icon">
                            <FormattedMessage {...messages.done} />
                          </div>
                        );
                      }
                      return null;
                    })()*/
                  }

                </div>
              </li>
            );
          })
          }
        </ul>
      );
    } else if (isFetching === false && list.length === 0) {
      return (
        <div className="noMessage">
          <img alt="plansImg" src={noMessage} />
          <p><FormattedMessage {...messages.emptyFont} /></p>
        </div>
      );
    }
    return null;
  }

  renderValidStatus(courseInfo) {
    // if (courseInfo.is_elective) {
    //   return null;
    // }

    if (courseInfo.item_type === 'live') {
      return null;
    }

    if (courseInfo.exam_unchecked === true) {
      return <div className="valid-status not-mark" />;
    }

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

            return null;

            // if (validTimeEnd === null && validTimeStart === null) {
            //   return null;
            // }

            // // 有效期内未完成
            // if (!isFinished && !isPass) {
            //   return null;
            // }

            // return (
            //   <div className="valid-status not-study" />
            // );
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
    const {
      all, required, minors, ownPurchase, isFetching,
      allEnd, requiredEnd, electiveEnd, ownBuyEnd, active,
    } = this.props;
    const finishShow = (function() {
      if (active === 'all') {
        return (all.length >= 10 ? 'block' : 'none');
      } else if (active === 'required') {
        return (required.length >= 10 ? 'block' : 'none');
      } else if (active === 'minors') {
        return (minors.length >= 10 ? 'block' : 'none');
      } else {
        return (ownPurchase.length >= 10 ? 'block' : 'none');
      }
    })();
    const allClass = (active === 'all') ? 'active newSelect' : 'new';
    const requiredClass = (active === 'required') ? 'active hotSelect' : 'new';
    const minorsClass = (active === 'minors') ? 'active newSelect' : 'new';
    const ownPurchaseClass = (active === 'ownPurchase') ? 'active hotSelect' : 'new';
    const widthClass = localStorage.modules_mall === 'true' ? "w25per" : "w33per";
    let loadingFinish;
    this.setNavBar();
    let needPullUp = true;
    if (active === 'all') {
      needPullUp = !allEnd;
      if (all.length < 10) {
        needPullUp = false;
      }

    } else if (active === 'required') {
      needPullUp = !requiredEnd;
      if (required.length < 10) {
        needPullUp = false;
      }
    } else if (active === 'minors') {
      needPullUp = !electiveEnd;
      if (minors.length < 10) {
        needPullUp = false;
      }
    } else {
      needPullUp = !ownBuyEnd;
      if (ownPurchase.length < 10) {
        needPullUp = false;
      }
    }
    if (!needPullUp) {
      loadingFinish = <FormattedMessage {...messages.noMore} />;
    }
    return (
      <div id="plans">
        <ul className="tab">
          <li className={widthClass}>
            <span
              className={allClass}
              onClick={() => this.tab('all')}
            >
              <FormattedMessage {...messages.allPlans} />
            </span>
          </li>
          <li className={widthClass}>
            <span
              className={requiredClass}
              onClick={() => this.tab('required')}
            >
              <FormattedMessage {...messages.required} />
            </span>
          </li>
          <li className={widthClass}>
            <span
              className={minorsClass}
              onClick={() => this.tab('minors')}
            >
              <FormattedMessage {...messages.minors} />
            </span>
          </li>
          {localStorage.modules_mall === 'true' && <li className="w25per">
            <span
              className={ownPurchaseClass}
              onClick={() => this.tab('ownPurchase')}
            >
              <FormattedMessage {...messages.ownPurchase} />
            </span>
          </li>}
        </ul>
        <RefreshLoad
          isSpecial
          needPullUp={needPullUp}

          pullDownCallBack={this.pullDownCallback}
          pullUpCallBack={this.pullUpCallBack}
          key={this.state.key}
        >
          {this.props.active === 'all' ? this.outPut(all) :
            (this.props.active === 'required' ? this.outPut(required) :
              (this.props.active === 'minors' ? this.outPut(minors) : this.outPut(ownPurchase)))}
          <p className="loading" style={{ display: finishShow }}>{ loadingFinish }</p>
        </RefreshLoad>
        <Alert
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isAlertOpen}
          onRequestClose={this.onAlertConfirm}
          confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
        >
          <FormattedMessage id="app.plan.invalidMsg" />
        </Alert>
      </div>

    );
  }
}

Plans.propTypes = propTypes;
Plans.contextTypes = contextTypes;

export default connect(state => ({
  all: state.plans.all || [],
  required: state.plans.required || [],
  minors: state.plans.minors || [],
  ownPurchase: state.plans.ownPurchase || [],
  isFetching: state.plans.isFetching || false,
  active: state.plans.active || 'all',
  allEnd: state.plans.allEnd || false,
  requiredEnd: state.plans.requiredEnd || false,
  electiveEnd: state.plans.electiveEnd || false,
  ownBuyEnd: state.plans.ownBuyEnd || false,
}), dispatch => ({
    actions: bindActionCreators(plansActions, dispatch),
  }
))(Plans);

