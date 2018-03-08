import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { setting } from 'utils/storage';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import dxConfig from 'dxConfig';
import { Link } from 'react-router';
import api from 'utils/api';
import { isUltimate } from 'utils/dx/edition';
import { nav } from 'utils/dx';
import store from 'store2';

import './style.styl';

import Carousel from '../../components/Carousel';
import RefreshLoad from '../../components/refreshload';
import Card from './card';
import Header from './Header';
import Footer from '../../components/footer';
import SignIn from './sign-in';
import TrainItem from '../../components/ListItems/TrainItem';
import DDGuide from '../../components/DDGuide';

import messages from './messages';
import banner1 from './assets/banner-1.jpg';
import banner2 from './assets/banner-2.jpg';
import NoMsg from './nomsg';
import {
  newMessage as newMessageActions,
  account as accountActions,
} from '../../actions';
import { Alert } from '../../../../components/modal';

function linkTo(options) {
  const temp = options;
  if (!options.plan) {
    temp.plan = { id: 0 };
  }
  const type = options.item_type || options.type;
  const id = options.item_id || options.id;
  const pid = temp.plan.id;
  switch (type) {
    case 'course':
      return `/plan/${pid}/series/0/courses/${id}`;
    case 'solution':
      return `/plan/${pid}/series/${id}`;
    case 'exam':
      return `/plan/${pid}/series/0/exams/${id}`;
    case 'live':
    case 'meeting':
      return `/live/${id}`;
    default:
      return null;
  }
}
class Home extends React.Component {
  static contextTypes = {
    intl: PropTypes.object,
    router: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      newTrain: [],
      plan: [],
      live: [],
      elective: { optionalCourses: [] },
      planIsLoading: true,
      electiveIsLoading: true,
      banners: [],
      key: 0,
      inited: false,
      isBannerFetched: false,
      isAlertOpen: false,
      clickedCard: null,
      examMarkMsg: null,
      updateInfo: {
        isMyElectiveUpdate: false,
        isMyExamUpdate: false,
        isMyStudyUpdate: false,
      },
    };
    this.refreshNav = this.refreshNav.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.pullDownCallBack = this.pullDownCallBack.bind(this);
    this.getBanners = this.getBanners.bind(this);
    this.getImgLinks = this.getImgLinks.bind(this);
    this.getCustomBanner = ::this.getCustomBanner;
    this.getDingTalkBanner = ::this.getDingTalkBanner;
    this.onCardClick = ::this.onCardClick;
    this.onAlertConfirm = ::this.onAlertConfirm;
    this.onTrainClick = ::this.onTrainClick;
  }


  componentDidMount() {
    const self = this;
    self.fetchData().then(() => {
      const rndNum = Math.random();
      self.setState({ key: rndNum });
    });
    // 更新用户信息
    if (!self.props.user.lastUpdated) {
      this.props.fetchUser().catch((err) => {
        if (err.message && typeof (err.message) === 'string') {
          const error = JSON.parse(err.message);
          if (error.errorCode === 123456) {
            window.location = './#/account/changeDefaultPwd';
          }
        }
      });
    }
  }

  getDingTalkBanner() {
    return (
      <Carousel dots autoplay>
        <img src={banner1} alt="多学" />
        <img src={banner2} alt="多学" />
      </Carousel>
    );
  }

  getCustomBanner() {
    return (
      <Carousel dots autoplay>
        { this.getImgLinks() }
      </Carousel>
    );
  }

  getBanners() {
    return this.getCustomBanner();
  }

  onTrainClick() {

  }

  onCardClick(item) {
    const router = this.context.router;
    const to = linkTo(item);

    if (item.item_type === 'live' ) {
      router.push(router.createPath(to));
      return;
    }

    if (item.type === 'meeting') {
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
      const to = linkTo(this.state.clickedCard);
      this.setState({ ...this.state, isAlertOpen: false, clickedCard: null });
      const router = this.context.router;
      router.push(router.createPath(to));
    });
  }

  getImgLinks() {
    // link_switch: 0  :getImgUrl  link #
    // link_switch:1 :getImgUrl
    // link: link_type: 1:选修课 2:抽奖 3.考试 4. 培训班 5. 问券
    //

    const banners = this.state.banners;
    if (banners.length > 0) {
      return banners.map((item, index) => {
        let linkPath;
        if (item.link_switch === 0) {
          return (<img src={item.image_url} alt="" key={`img${index}`} />);
        } else {
          switch (item.link_type) {
            case 0:
              return (<img
                src={item.image_url}
                alt=""
                key={`img${index}`}
                onClick={() => {
                  location.href = item.link_url;
                }}
              />);
            case 1:
              linkPath = `/plan/${item.plan.id}/series/0/courses/${item.link_course_id}/detail`;
              return (<img
                src={item.image_url}
                alt=""
                key={`img${index}`}
                onClick={() => {
                  this.context.router.push(linkPath);
                }}
              />);
            case 2:
              return (<img src={item.image_url} key={`img${index}`} alt="" />);
            case 3:
              linkPath = `/plan/${item.plan.id}/series/0/exams/${item.link_course_id}`;
              return (<img
                src={item.image_url}
                key={`img${index}`} alt=""
                onClick={() => {
                  this.context.router.push(linkPath);
                }}
              />);
            case 4:
              return (<img src={item.image_url} alt="" key={`img${index}`} />);
            case 5:
              // const ticket = Cookie.get('USER-TICKET');
              const ticket = setting.get('ticket');
              return (<img
                src={item.image_url}
                alt=""
                key={`img${index}`}
                onClick={() => {
                  const surveyPageParams = `survey/index.html?id=${item.link_course_id}&ticket=${ticket}`;
                  linkPath = `${window.location.protocol}${dxConfig.SURVEY.origin}/${surveyPageParams}`;
                  location.href = linkPath;
                }}
              />);
            default:
              return null;
          }
        }
      });
    }
    return null;
  }

  refreshNav() {
    nav.setTitle({
      title: this.context.intl.messages['app.home.navTitle'],
    });
    if (__platform__.dingtalk) {
      nav.setRight({
        text: this.context.intl.messages['app.home.courseManage'],
        event: () => { this.context.router.push('/manage'); },
      });
    }
  }

  async fetchData() {
    const fetchPlan = api({ url: '/training/studyArrange/h5/index/list' });
    // const fetchElective = api({ url: '/training/optional-course/recommendation' });
    // TODO change the fetchNewTrain Url
    const fetchNewTrain = api({ url: '/training/new-staff/h5/index' });
    const fetchElective = api({ url: '/training/optional-course/list' });
    // const fetchBanner = api({ url: '/account/advertisement/get?type=3' });
    const fetchBanner = api({ url: '/account/billing/get?type=3' });

    const fetchLive = api({ url: '/training/lives/index' });

    // 获取考试阅卷消息
    const fetchExamMarkMsg = api({
      method: 'GET',
      url: '/account/message/get-latest-user-message',
    }).then((res) => {
      let msg = null;
      if (res.data && res.data.length) {
        let extraObj = null;
        if (res.data[0].extra) {
          extraObj = JSON.parse(res.data[0].extra);
        }
        msg = {
          itemId: res.data[0].item_id,
          content: res.data[0].content,
          extra: extraObj,
        };
      }
      return msg;
    }).catch();

    // 获取更新小红点信息
    const fetchUpdateInfo = api({
      method: 'GET',
      url: '/training/get-index-update-tip',
    }).then((res) => {
      return {
        isMyElectiveUpdate: res.data.is_my_elective_update,
        isMyExamUpdate: res.data.is_my_exam_update,
        isMyStudyUpdate: res.data.is_my_study_update,
      };
    }).catch(() => {      
      return {
        isMyElectiveUpdate: false,
        isMyExamUpdate: false,
        isMyStudyUpdate: false,
      }
    });

    let [plan, elective, newTrain, live, examMarkMsg, updateInfo] =
      await Promise.all([fetchPlan, fetchElective, fetchNewTrain, fetchLive, fetchExamMarkMsg, fetchUpdateInfo]);
    [plan, elective, newTrain, live, examMarkMsg, updateInfo] = [plan.data, elective.data, newTrain.data, live.data, examMarkMsg, updateInfo];
    const check = arg => arg ? (Object.keys(arg).length ? arg : null) : null;
    this.setState({
      plan,
      elective,
      newTrain: check(newTrain) ? [newTrain] : null,
      live,
      examMarkMsg,
      updateInfo,
      planIsLoading: false,
      electiveIsLoading: false,
      inited: true,
    }, () => {
      fetchBanner.then((data) => {
        this.setState({
          banners: data.data,
          isBannerFetched: true,
        });
      });
    });
    if (__platform__.dingtalk) {
      this.props.actions.fetchNewMessage();
    }
  }

  pullDownCallBack(cb) {
    this.fetchData().then(() => {
      cb();
    });
  }

  entrance() {
    const learnIcon = require('./assets/icon/learn.png');
    const examIcon = require('./assets/icon/exam.png');
    const electiveIcon = require('./assets/icon/elective.png');
    const collectIcon = require('./assets/icon/collect.png');

    const { updateInfo } = this.state;

    return (
      <div className="dd-entrance">
        <div className="wrapper">
          <Link to="/plans" className={`${updateInfo && updateInfo.isMyStudyUpdate ? 'red-dot' : ''}`}>
            <img src={learnIcon} alt="我的学习" /><span><FormattedMessage {...messages.entranceLearn} /></span>            
          </Link>
        </div>
        <div className="wrapper">
          <Link to="/exams" className={`${updateInfo && updateInfo.isMyExamUpdate ? 'red-dot' : ''}`}>
            <img src={examIcon} alt="我的考试" /><span><FormattedMessage {...messages.entranceExam} /></span>            
          </Link>
        </div>
        <div className="wrapper">
          <Link to="/electives" className={`${updateInfo && updateInfo.isMyElectiveUpdate ? 'red-dot' : ''}`}>
            <img src={electiveIcon} alt="选修课" /><span><FormattedMessage {...messages.entranceElective} /></span>            
          </Link>
        </div>
        <div className="wrapper">
          <Link to="/favorites">
            <img src={collectIcon} alt="收藏" /><span><FormattedMessage {...messages.entranceCollect} /></span>
          </Link>
        </div>
      </div>
    );
  }

  renderExamMarkMsg() {
    const { examMarkMsg } = this.state;
    if (examMarkMsg === null) {
      return null;
    }

    return (
      <div
        className="notify-bar"
        role="link"
        tabIndex={0}
        onClick={() => {
          api({
            method: 'PUT',
            url: `/account/message/${examMarkMsg.itemId}`,
            data: {
              is_read: true,
            },
          });
          const router = this.context.router;
          router.push(router.createPath(`/plan/${examMarkMsg.extra.planId}/series/${examMarkMsg.extra.solutionId}/exams/${examMarkMsg.extra.quizId}`));
        }}
      >
        <div className="icon" />
        <div className="content">{examMarkMsg.content}</div>
      </div>
    );
  }

  render() {
    if (!this.state.inited) return null;
    let newTrainArea; // area of newTrain .Hide When none;
    let planArea; // area of the plan.Hide when none
    let liveArea;
    let electiveArea;// area of the elective.Hide when none

    this.refreshNav();
    if (!this.state.newTrain) newTrainArea = null;
    else {
      newTrainArea = (
        <div>
          <Header to="/plan">
            <FormattedMessage {...messages.newTrainTitle} />
          </Header>
          <div className="train">
            {
              this.state.newTrain.map(p => (
                <TrainItem
                  link={`/plan/detail/${p.plan_id}`}
                  valid_time_end={p.valid_time_end}
                  icon_text={'截止'}
                  img_Url={p.img_url}
                  name={p.plan_name}
                  task_rate={p.finish_rate}
                  key={p.plan_id}
                  trainClick={this.onTrainClick}
                  trainInfo={p}
                />
              ))
            }
          </div>
        </div>
      );
    }
    const hasPlan = this.state.plan.length;
    const courseTypeInof = function getTypeInfo(info) {
      switch (info) {
        case 'elective':
          return {
            msgKey: 'elective',
            cls: 'blue',
          };
        case 'personal':
          return {
            msgKey: 'private',
            cls: 'orange',
          };
        case 'exchange':
          return {
            msgKey: 'exchange',
            cls: 'orange',
          };
        default:
          return null;
      }
    };

    if (!hasPlan) {
      planArea = (
        <div>
          <Header to="/plans">
            <FormattedMessage {...messages.planTitle} />
          </Header>
          <div>
            <NoMsg />
          </div>
        </div>
      );
    } else {
      planArea = (
        <div>
          <Header to="/plans">
            <FormattedMessage {...messages.planTitle} />
          </Header>
          {
            this.state.plan.map((p, i) => (
              <Card
                key={`${i}-plans-${p.item_id}`}
                alt={p.item_name}
                content={p.item_name}
                imageURL={`${p.item_img_url}`}
                type={p.item_type}
                to={linkTo(p)}
                externalClass={i % 2 ? '' : 'left'}
                isNew={p.is_new}
                typeInfo={courseTypeInof(p.task_source)}
                cardClick={this.onCardClick}
                courseInfo={p}
                showValidStatus={!false}
              />
            ))
          }
        </div>
      );
    }

    // TODO live area
    const shouldShowliveArea = !!this.state.live.length;
    const timeStampFormat = function getTimeStampFormat(timeStamp) {
      if (!timeStamp) {
        return '';
      }
      const newDate = new Date();
      newDate.setTime(timeStamp);
      return moment(newDate).format('YYYY-MM-DD HH:mm');
    };
    const liveStatus = function getLiveStatus(status) {
      /* 直播时间状态 */
      switch (status) {
        case 'not_start':
          return {
            msgKey: 'liveStatusNotStart',
            cls: 'b3',
          };
        case 'about_to_start':
          return {
            msgKey: 'liveStatusAboutToStart',
            cls: 'b3',
          };
        case 'on_live':
          return {
            msgKey: 'liveStatusOnLive',
            cls: 'a1',
          };
        case 'over':
          return {
            msgKey: 'liveStatusOnLive',
            cls: 'z2',
          };
        default:
          return null;
      }
    };
    if (!shouldShowliveArea) liveArea = null;
    else {
      liveArea = (
        <div>
          <Header to="/lives">
            <FormattedMessage {...messages.liveCourseTitle} />
          </Header>
          {
            this.state.live.filter((_, i) => i < 2).map((p, i) => (
              <Card
                key={`${p.id}-live-${i}`}
                alt={p.name}
                content={p.name}
                imageURL={`${p.img}`}
                to={linkTo(p)}
                externalClass={i % 2 ? '' : 'left'}
                type={p.type}
                isNew={false}
                statusInfo={timeStampFormat(p.begin_time)}
                typeInfo={liveStatus(p.status)}
                cardClick={this.onCardClick}
                courseInfo={p}
                showValidStatus={false}
              />
            ))
          }
        </div>
      );
    }

    const hasElective = this.state.elective.optionalCourses.length;
    if (!hasElective) electiveArea = null;
    else {
      // display 8 electives when no plan
      const electiveLength = 4; // hasPlan ? 4 : 4;
      electiveArea = (
        <div>
          <Header to="/electives">
            <FormattedMessage {...messages.electiveTitle} />
          </Header>
          {
            this.state.elective.optionalCourses.filter((_, i) => i < electiveLength).map((p, i) => (
              <Card
                key={`${p.id}-elective-${i}`}
                alt={p.name}
                content={p.name}
                imageURL={`${p.thumbnail_url}`}
                to={linkTo(p)}
                externalClass={i % 2 ? '' : 'left'}
                type={p.type}
                isNew={false}
                cardClick={this.onCardClick}
                courseInfo={p}
                showValidStatus={false}
              />
            ))
          }
        </div>
      );
    }
    const pushArea = (
      <div className="home" key={this.state.key}>
        <RefreshLoad
          needPullUp={false}
          pullDownCallBack={this.pullDownCallBack}
          pullUpCallBack={() => {}}
        >
          {this.state.banners.length ?
            <div className="carousel">
              { this.getBanners() }
            </div> : null
          }
          <div className="main clearfix">
            {this.entrance()}
            {this.renderExamMarkMsg()}
            {newTrainArea}
            {planArea}
            {liveArea}
            {electiveArea}
          </div>
          <div className="bottomBlank" />
        </RefreshLoad>
      </div>
    );
    const showDDGuide = __platform__.dingtalk && !store('notShowDDGuide');
    return (
      <div>
        {pushArea}
        <Footer />
        <SignIn />
        <Alert
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isAlertOpen}
          onRequestClose={this.onAlertConfirm}
          confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
        >
          <FormattedMessage id="app.home.invalidMsg" />
        </Alert>
        {showDDGuide ? <DDGuide show /> : null}
      </div>
    );
  }
}

Home.propTypes = {
  user: PropTypes.shape({}),
  newMessage: PropTypes.shape({}),
  actions: PropTypes.shape({ fetchNewMessage: PropTypes.func }),
  fetchUser: PropTypes.func,
};


// export default connect()(Home);
const mapStateToProps = state => (
  {
    user: state.account.user,
    newMessage: state.newMessage.newMessage || {},
  }
);

const mapDispatchToProps = dispatch => (
  {
    actions: bindActionCreators(newMessageActions, dispatch),
    fetchUser: bindActionCreators(accountActions.fetchUser, dispatch),
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(Home);
