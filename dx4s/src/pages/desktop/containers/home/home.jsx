import React, { Component, PropTypes } from 'react';
import { setting } from 'utils/storage';
import { Link } from 'react-router';
import api from 'utils/api';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormattedMessage } from 'react-intl';
import dingTalkPCOpenLink from 'utils/dingtalk';
import { isUltimate } from 'utils/dx/edition';
import dxConfig from 'dxConfig';
import { hasMallModuleSelector } from 'dxSelectors/account-user';
import Cookie from 'tiny-cookie';

import messages from './messages';
import { signIn as actions } from '../../actions';
import DxHeader from '../../components/header';
import Carousel from '../../components/carousel';
import DxCarouselArrow from '../../components/carousel/dx-carousel-arrow';
import DxFooter from '../../components/footer';
import Cultivate from './cultivate';
import HotListHeader from './header';
import Card from '../../components/card';

import Confirm from '../../components/confirm';

import banner1 from './img/banner1.jpg';
import banner2 from './img/banner2.jpg';
import banner3 from './img/banner3.jpg';
import banner4 from './img/banner4.jpg';
import banner5 from './img/banner5.jpg';

class Home extends Component {
  static contextTypes = {
    intl: PropTypes.object,
    router: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.updateDimensions = ::this.updateDimensions;
    this.fetchData = ::this.fetchData;
    this.onCardClick = ::this.onCardClick;
    this.onAlertConfirm = ::this.onAlertConfirm;
    this.state = {
      bodyWidth: document.body.clientWidth,
      newTrain: null,
      plan: [],
      elective: [],
      live: [],
      maxElectiveLength: 15,
      banners: [],
      dingBanners: [],
      mallTicket: null,
      bannerIsFetched: false,
      dingBannersIsFetched: false,
      isAlertOpen: false,
      clickedCard: null,
      examMarkMsg: null,
    };
  }

  async componentDidMount() {
    this.props.fetchIsSigned();
    window.addEventListener('resize', this.updateDimensions);
    this.fetchData().then((values) => {
      const banners = values[0];
      const dingBanners = values[1];
      const newTrain = values[2];
      const plan = values[3];
      const elective = values[4];
      const live = values[5];
      const examMarkMsg = values[6];
      this.setState({
        bodyWidth: document.body.clientWidth,
        banners,
        dingBanners,
        newTrain,
        plan,
        elective,
        live,
        examMarkMsg,
        bannerIsFetched: true,
        dingBannersIsFetched: true,
        maxElectiveLength: !plan.length ? 30 : 15,
      });
    });
    const getTicket = platform => api({
      method: 'GET',
      url: '/account/change-ticket',
      params: {
        target_platform: platform,
      },
    });
    const [mallTicket] = await Promise.all([
      getTicket('dxMall'),
    ]);
    this.setState({
      mallTicket: mallTicket.data.ticket,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  getOutsourceBanner(bannerSrc) {
    const isSelfPage = Cookie.get('NEW_PAGE') === '0';
    const aTarget = (__PLATFORM__.DINGTALKPC || isSelfPage) ? '_self' : '_blank';
    return (
      <Link
        to={null}
        target={aTarget}
      >
        <img src={bannerSrc} alt="" />
      </Link>
    );
  }

  getBanners() {
    const isBannerFetched = this.state.bannerIsFetched;
    const isDingTalkPC = __PLATFORM__.DINGTALKPC;
    if (!isDingTalkPC && !isBannerFetched) {
      return <div className="empty-banners" />;
    }
    const settings = {
      className: 'dx-carousel',
      centerMode: true,
      infinite: true,
      autoplay: true,
      draggable: false,
      dots: true,
      dotsClass: 'dx-carousel-dots',
      centerPadding: `${(this.state.bodyWidth - 1200) / 2}px`,
      speed: 500,
      nextArrow: <DxCarouselArrow type="next" />,
      prevArrow: <DxCarouselArrow type="prev" />,
    };
    const isUltimateEdition = isUltimate();
    const isBannerNotEmpty = this.state.banners.length;
    const canShowBanner = isBannerFetched && isBannerNotEmpty;
    const isDingTalkBannerFetched = this.state.dingBannersIsFetched;
    const isDingTalkBannerNotEmpty = this.state.dingBanners.length;
    // 旗舰版显示企业自己设置的banner
    if (isUltimateEdition && canShowBanner) {
      return (<Carousel {...settings}>{this.getImgLinks()}</Carousel>);
    }
    // 钉钉PC显示钉钉banner
    if (isDingTalkPC && (isDingTalkBannerFetched && isDingTalkBannerNotEmpty)) {
      return (
        <Carousel {...settings}>
          {this.getDingLinks()}
        </Carousel>
      );
    }
    // 钉钉banner和企业设置banner都为空，显示一些推荐课程
    if ((isDingTalkBannerFetched && !isDingTalkBannerNotEmpty)
      && (isBannerFetched && !isBannerNotEmpty)
    ) {
      return (
        <Carousel {...settings}>
          {this.getOutsourceBanner(banner1)}
          {this.getOutsourceBanner(banner2)}
          {this.getOutsourceBanner(banner3)}
          {this.getOutsourceBanner(banner4)}
          {this.getOutsourceBanner(banner5)}
        </Carousel>
      );
    }
    // 非钉钉平台下，各种版本显示企业设置的banner
    if (!isDingTalkPC && (isBannerFetched && isBannerNotEmpty)) {
      return (
        <Carousel {...settings}>
          {this.getImgLinks()}
        </Carousel>
      );
    }
  }

  getDingLinks() {
    const dingBanners = this.state.dingBanners;
    const isSelfPage = Cookie.get('NEW_PAGE') === '0';
    const aTarget = (__PLATFORM__.DINGTALKPC || isSelfPage) ? '_self' : '_blank';
    if (dingBanners.length > 0) {
      return dingBanners.map((item, index) => {
        if (!item.is_available ||
          !(Date.parse(item.start_time) <= Date.now() <= Date.parse(item.end_time))
        ) {
          return null;
        }
        if (item.link_type === 0) {
          return (
            <a
              target={aTarget}
              rel="noopener noreferrer"
              href={item.link_url}
              key={`img-${index}`}
              // onClick={() => {
              //   if (__PLATFORM__.DINGTALKPC) {
              //     // eslint-disable-next-line
              //     DingTalkPC.biz.util.openLink({
              //       url: item.link_url,
              //       onSuccess: () => {},
              //       onFail: () => {},
              //     });
              //   }
              // }}
            >
              <img src={item.img} alt="" key={`img-${index}`} />
            </a>
          );
        }
        if (item.link_type === 7) {
          return (
            <a
              target={aTarget}
              rel="noopener noreferrer"
              href={`${window.location.protocol}${dxConfig.MALL.origin}/detail?id=${item.link_id}&ticket=${this.state.mallTicket}`}
              key={`img-${index}`}
              // onClick={() => {
              //   if (__PLATFORM__.DINGTALKPC) {
              //     // eslint-disable-next-line
              //     DingTalkPC.biz.util.openLink({
              //       url: `${dxConfig.MALL.origin}/detail?id=${item.link_id}&ticket=${this.state.mallTicket}`,
              //       onSuccess: () => {},
              //       onFail: () => {},
              //     });
              //   }
              // }}
            >
              <img src={item.img} alt="" />
            </a>
          );
        }
        return null;
      });
    }
    return null;
  }

  getImgLinks() {
    /*
     link_switch: 0 不跳转
     link_type: {
     0:url,    跳转到一个url
     1:选修课,  跳转到选修课详情
     2:抽奖,    不跳转
     3.考试,    跳转到考试详情
     4. 培训班, 不跳转
     5. 问券    跳转到hybrid
     }
     */
    const isSelfPage = Cookie.get('NEW_PAGE') === '0';
    const aTarget = (__PLATFORM__.DINGTALKPC || isSelfPage) ? '_self' : '_blank';
    const banners = this.state.banners;
    if (banners.length > 0) {
      return banners.map((item, index) => {
        if (!item.link_switch) {
          return (
            <Link to={null} key={`img-${index}`}>
              <img src={item.image_url} alt="" key={`img-${index}`} />
            </Link>
          );
        }
        let routePath = null;
        let linkPath = null;
        switch (item.link_type) {
          case 0:
            linkPath = item.link_url;
            return (
              <Link href={linkPath} target={aTarget} key={`img-${index}`}>
                <img src={item.image_url} alt="" />
              </Link>
            );
          case 1:
            if (!item.plan) {
              return null;
            }
            routePath = `/plan/${item.plan.id}/series/0/courses/${item.link_course_id}`;
            return (
              <Link to={routePath} target={aTarget} key={`img-${index}`}>
                <img src={item.image_url} alt="" />
              </Link>
            );
          case 2:
            return (
              <Link key={`img-${index}`}>
                <img src={item.image_url} alt="" />
              </Link>
            );
          case 3:
            if (!item.plan) {
              return undefined;
            }
            routePath = `/plan/${item.plan.id}/series/0/exams/${item.link_course_id}`;
            return (
              <Link to={routePath} target={aTarget} key={`img-${index}`}>
                <img src={item.image_url} alt="" />
              </Link>
            );
          case 4:
            return (
              <Link key={`img-${index}`}>
                <img src={item.image_url} alt="" />
              </Link>
            );
          case 5: {
            // const ticket = Cookie.get('USER-TICKET');
            const ticket = setting.get('ticket');

            const surveyPageParams = `survey/index.html?id=${item.link_course_id}&ticket=${ticket}`;
            // eslint-disable-next-line

            linkPath = `${window.location.protocol}${dxConfig.SURVEY.origin}/${surveyPageParams}`;
            return (
              <Link href={linkPath} target={aTarget} key={`img-${index}`}>
                <img src={item.image_url} alt="" />
              </Link>
            );
          }
          default:
            return false;
        }
      });
    }
    return null;
  }

  fetchData() {
    // fetchBanner
    const fetchBanner = api({ url: '/account/billing/get?type=3' }).then((res) => {
      const banners = res.data;
      return banners;
      // this.setState({ banners, bannerIsFetched: true });
    }).catch((err) => {
      if (err.response && err.response.data && err.response.data.errorCode === 123456) {
        window.location = './#/account/changeDefaultPwd';
        return;
      }

      this.setState({ bannerIsFetched: true });
    });

    const fetchDingBanner = api({ url: '/training/advertisement/list?type=5' }).then((res) => {
      const dingBanners = res.data;
      return dingBanners;
      // this.setState({ dingBanners: res.data, dingBannersIsFetched: true });
    }).catch((err) => {
      this.setState({ dingBannersIsFetched: true });
    });

    // fetchNewTrain
    const fetchNewTrain = api({ url: '/training/new-staff/h5/index' }).then((res) => {
      const newTrain = res.data;
      return newTrain;
      // this.setState({ newTrain });
    }).catch();

    // fetchPlan
    const fetchPlan = api({
      method: 'GET',
      url: '/training/studyArrange/h5/index/list',
      params: { size: 15 },
    }).then((res) => {
      const plan = res.data;
      return plan;
      // this.setState({
      //   plan,
      //   maxElectiveLength: !plan.length ? 30 : 15,
      // });
    }).catch();

    // fetchElective
    const fetchElective = api({
      method: 'GET',
      url: '/training/optional-course/list',
      params: {
        index: 1,
        size: 30,
      },
    }).then((res) => {
      const elective = res.data.optionalCourses;
      return elective;
      // this.setState({ elective });
    }).catch();

    // fetchLive
    const fetchLive = api({
      method: 'GET',
      url: '/training/lives/index',
      params: {
        index: 1,
        size: 5,
      },
    }).then((res) => {
      const live = res.data;
      return live;
      // this.setState({ live });
    }).catch();

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

    return Promise.all([
      fetchBanner,
      fetchDingBanner,
      fetchNewTrain,
      fetchPlan,
      fetchElective,
      fetchLive,
      fetchExamMarkMsg,
    ]);
  }

  updateDimensions() {
    this.setState({ bodyWidth: document.body.clientWidth });
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
      case 'meeting':
        return `/lives/${id}`;
      default:
        return null;
    }
  }

  onCardClick(item) {
    const router = this.context.router;
    const to = this.linkTo(item);

    if (item.item_type === 'live') {
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
      const to = this.linkTo(this.state.clickedCard);
      this.setState({ ...this.state, isAlertOpen: false, clickedCard: null });
      const router = this.context.router;
      router.push(router.createPath(to));
    });
  }

  getMallLink() {
    const mallLink = window.location.protocol + dxConfig.MALL.origin;
    const mallTicketLink = `${mallLink}?ticket=${this.state.mallTicket}`;
    return mallTicketLink;
  }

  renderPlan() {
    const { plan } = this.state;
    if (plan.length) {
      return (
        <div className="home-plan-list">
          <div className="dx-container dx-hot-list">
            <HotListHeader title={this.context.intl.messages['app.home.title.plan']} link="plans" />
            <div className="dx-hot-list-content">
              {
                plan.map((p, i) => (
                  <Card
                    key={`${i}-${p.item_id}`}
                    type={p.item_type}
                    img={p.item_img_url}
                    name={p.item_name}
                    isNew={p.is_new}
                    to={this.linkTo(p)}
                    cardClick={this.onCardClick}
                    style={((i + 1) % 5) ? null : { marginRight: 0 }}
                    courseInfo={p}
                    showValidStatus={!false}
                  />
                ))
              }
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="home-plan-list">
        <div className="dx-container dx-hot-list">
          <HotListHeader title={this.context.intl.messages['app.home.title.plan']} link="plans" hasMore={false} />
          {this.renderEmptyCourse()}
        </div>
      </div>
    );
  }

  renderElective() {
    const { elective, maxElectiveLength } = this.state;
    if (elective.length) {
      return (
        <div className="home-elective-list">
          <div className="dx-container dx-hot-list">
            <HotListHeader title={this.context.intl.messages['app.home.title.elective']} link="electives" />
            <div className="dx-hot-list-content">
              {
                elective.filter((_, i) => (
                  i < maxElectiveLength
                )).map((p, i) => (
                  <Card
                    key={`${i}-${p.id}`}
                    type={p.type}
                    img={`${p.thumbnail_url}?w_250`}
                    name={p.name}
                    to={this.linkTo(p)}
                    cardClick={this.onCardClick}
                    style={((i + 1) % 5) ? null : { marginRight: 0 }}
                    courseInfo={p}
                    showValidStatus={false}
                  />
                ))
              }
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="home-elective-list">
        <div className="dx-container dx-hot-list">
          <HotListHeader
            title={this.context.intl.messages['app.home.title.elective']}
            link="electives"
            hasMore={false}
          />
          {this.renderEmptyCourse()}
        </div>
      </div>
    );
  }

  renderLive() {
    const { live } = this.state;
    if (live.length) {
      return (
        <div className="home-plan-list">
          <div className="dx-container dx-hot-list">
            <HotListHeader title={this.context.intl.messages['app.home.title.live']} link="lives" />
            <div className="dx-hot-list-content">
              {
                live.map((p, i) => (
                  <Card
                    key={`${i}-${p.id}`}
                    type="live"
                    img={p.img}
                    name={p.name}
                    to={this.linkTo(p)}
                    cardClick={this.onCardClick}
                    beginTime={p.begin_time}
                    liveStatus={p.status}
                    style={((i + 1) % 5) ? null : { marginRight: 0 }}
                    courseInfo={p}
                    showValidStatus={false}
                  />
                ))
              }
            </div>
          </div>
        </div>
      );
    }
    return null;
    /* return (
     <div className="home-plan-list">
     <div className="dx-container dx-hot-list">
     <HotListHeader title={this.context.intl.messages['app.home.title.live']} link="live" hasMore={false} />
     {this.renderEmptyCourse()}
     </div>
     </div>
     );*/
  }

  renderEmptyCourse() {
    const mallLink = this.getMallLink();
    const isSelfPage = Cookie.get('NEW_PAGE') === '0';
    const aTarget = (__PLATFORM__.DINGTALKPC || isSelfPage) ? '_self' : '_blank';
    const { hasMallModule } = this.props;

    return (
      hasMallModule ?
        <div className="dx-course-empty">
          <FormattedMessage {...messages.emptyPart1} />
          <a
            href={mallLink}
            className="empty-link"
            rel="noopener noreferrer"
            target={aTarget}
            // onClick={() => {
            //   if (__PLATFORM__.DINGTALKPC) {
            //     // eslint-disable-next-line
            //     DingTalkPC.biz.util.openLink({
            //       url: mallLink,
            //       onSuccess: () => {},
            //       onFail: () => {},
            //     });
            //   }
            // }}
          ><FormattedMessage {...messages.emptyPart2} /></a>
          <FormattedMessage {...messages.emptyPart3} />
        </div> : <div className="dx-course-empty"><FormattedMessage {...messages.emptyPart0} /></div>
    );
  }

  renderExamMarkMsg() {
    const { examMarkMsg } = this.state;
    if (examMarkMsg === null) {
      return null;
    }

    return (
      <div className="notify-bar">
        <div className="dx-container notify">
          <span className="icon" />
          <span className="content">{examMarkMsg.content}，</span>
          <a
            className="info-link"
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
          >点击查看</a>
        </div>
      </div>
    );
  }

  render() {
    const { newTrain } = this.state;
    return (
      <div>
        <DxHeader />
        {this.getBanners()}
        {newTrain ? (
          <Cultivate
            key={newTrain.plan_id}
            id={newTrain.plan_id}
            name={newTrain.plan_name}
            deadline={newTrain.valid_time_end}
            rate={newTrain.finish_rate}
            moreLink="/plan"
          />
        ) : null}
        {this.renderExamMarkMsg()}
        {this.renderPlan()}
        {this.renderLive()}
        {this.renderElective()}
        <DxFooter />
        {
          this.props.isSigned ? null : (
            <Link to="sign-in-record" className="home-icon-sign-in">&nbsp;</Link>
          )
        }
        <Confirm
          isOpen={this.state.isAlertOpen}
          confirm={this.onAlertConfirm}
          confirmButton={this.context.intl.messages['app.course.ok']}
          buttonNum={1}
        >
          <FormattedMessage {...messages.invalidMsg} />
        </Confirm>
      </div>
    );
  }
}

Home.propTypes = {
  isSigned: React.PropTypes.bool,
  fetchIsSigned: React.PropTypes.func,
  hasMallModule: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isSigned: state.signIn.is_signed,
  hasMallModule: hasMallModuleSelector(state),
});

const mapDispatchToProps = dispatch => ({
  fetchIsSigned: bindActionCreators(actions.fetchIsSigned, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
