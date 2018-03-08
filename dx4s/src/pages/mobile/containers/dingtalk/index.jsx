import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import axios from 'axios';

import api from 'utils/api';

import Footer from '../../components/footer';

import swipe from './swipe';
import './style.styl';

const sign = () => (
  api({
    method: 'GET',
    url: '/account/account/isTodaySignin',
  }).then((res) => {
    if (!res.data.flag) {
      return api({ method: 'GET', url: '/account/account/signin' });
    }
    return null;
  })
);

const fetchCourseRecommendList = () => api.get('/training/course/recommend/list?type=1');

const fetchAdvertisementList = () => api.get('/training/advertisement/list?type=4');

const fetchData = () => axios.all([
  fetchCourseRecommendList(),
  fetchAdvertisementList(),
]);

const AD_TYPE = {
  0: 'url', // 链接直接跳转
  7: 'mall', // 跳转mall平台
};

const iconStudy = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABYCAMAAABGS8AGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABUUExURUxpccTs/8Ts/8Pr/sTs/8Ts/8Pr/sTs/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/zMzMzis/////0VJSzg5OnKDjFdgZLzR2+Pn6ai/y52wuYCVn4ujrzIlabsAAAAOdFJOUwCn3vZcAe2CK8cGAwkNHXsTkQAAAmlJREFUWMO9mdtyqzAMRY1tfKMjzgmQJu3//2dNypAQQJYN6n7JhIc1mi3ZI0tCJNU4bSsvjQJlpPeV1a4RR1U76xWspLx19QGssxJ2Ja0rozbaQ0Je53sStASCpA6Z0ZKwv+iMqJ2HDHmq18FCpmw4P1x60NpAgYxOHQgLhbLogWkqKFaFVEc4wI3kQI6379otdX1ezPUq3nZH3V7M2z6v87YHbnczuFlnsAX+vxYCho2qc+oMsFqdlLB13vLB4EPS4BKP1zY7OAsMCzMafx7YN3hFTOB/oybU8odSGR/yTLD8wDNXDH7mL5hzwSbgDheDZ5f92WCP1fAR8FTL9nzwI321PB8sa9SJcvDDC8sBtlhNHAHHumgUB1g1mMUHwNFkzQPWWO6OgK2oeMAVVhRHwF5IHrAUhgdshOIBKwE8YOCKGLg8VjlV8fxKSZ7nAUsusOc70myXENu16Xg8dqIxHGATm+SKA1xhLeERsE42LPlPhblhwVusMvCjxcKbwjKwTbSxfWTc356P9/itp7Wx+9eFGiLltuDe4pdB0RpvpC5Gcnd94V47And+KoT9M2IuC/LIvSSnUfPjBruIrpF8+Zy4n+OfK9BShz0g38hE7ssDEr3ibt1EHrndDYDqMPJIf5KHCB5o3MUjHb08YSzdYeS299WhSYwV0PwBfEdC9KH9hjTYUkY3s74ekC9Ig1ejG+HQ8uwpB3ksYUcajy2GhhQuaNpAL38kmxxBtjlKjSBfh6ZF4P1B73PMWwKuwt8PpvlG6XzDf8Z1Bd+ChW8lxLjE4lu7MS4KGVebnMvY9/XxY39MXB//AIIIVAlPd9apAAAAAElFTkSuQmCC';
const iconExam = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABYCAMAAABGS8AGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABsUExURUxpccTs/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/zMzMzis/////2BrcLzi9HeHjmx3fYGPlj1AQlZfY/n6+pCcoarK2kVKTI6ns8rR1L3FydTrfngAAAASdFJOUwBgBsHwp80rAeCKg1MDeHAJDdIPEn0AAALLSURBVFjDtZnZduIwDIazOHZMlvaICdBAS+i8/zuO4zCQRd5jXXFC+PCRJVv6lSRGa1hdFTknBIBwmhdVzZok1ErW5gK4NpK3rAzAsoqD0njF/KhNmoPB8tTdJ1nKwcJ4mjmu1go7oR1WzSg4GLX1dXYARztk+y/XftE1AQ8jtSkhKvC0SpswTQHeVmiiIwvgCnIWY726NZeBXEHG/VxBsB3QOJu/cTna22X2OyTq2CJ+jy42j+dNpmTLfPMFA12Hxup8EK//sbMVeO1mBnuBYeGMhu4HpvNoTmE/MKRv7iffE8w/X+AP2BMMH69Q4/uCeabycEAcL7xM9wZTPIbDwc9YPuBgywMNfVOmX8n3B/NS4YlQsPRFGwPcCnCufn22O8p/wr/IxflDYoBJg7s4GCycnEIMH4vkq+KAq6SIAy7woFj5WJ276vYk4XHAPCHB4DNaMGvBVtZf7ygYAsH98YiSQ8H96CKM7OTjrav76cmWTJyiYgMeuae/V4RMEhoAltzv7hchc22CGOwycTuMnAek9IvbdfLjKqVbX/CM+yM+3s6rK6T2BOu5omdgfmADVxz0uqvJnyuuJnz3DOCR+6Xhir3Dalgj2MiVlax7wWLmyoLFucSS3E7LlSWWa1H4teSezsrWlzmBZ9xexf3fklEHsBWXalsFf+6rVcCbG0vuoGlu8HYM4f6suOOzQdOO4Q0kAr6Jx/2Si4BnDSTa8iIFxKR7LM/fQdfyok36Fvx4KiqLc33QNumYrIBuXT9u321+XwxaWQETQrZgcbP9ft/kqt/30KAXQhDpZsO9j24Y3tyztMEg3ejFpuusOBlDbvmOVmxayWMYeHLC9fQ4gxKMirIHte52fQbbcLlv//xiEPRMEuTj9Lj7SZDRRNN4Mm88YTqelB5P/I84rog3YIk3Eoo4xIo3dos4KIw42ow5jN2Ojwm3HR//A/zEtpfwM2BUAAAAAElFTkSuQmCC';
const iconElective = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABYCAMAAABGS8AGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUxpccTs/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/zMzMzis/////z0/QXiMlXaJkbPa6ToAAAALdFJOUwCnJDAF8IbHW+B1DCIluAAAAfpJREFUWMO1melyxSAIhWNcULlt0/d/2WbmLs2iqCDnd/IlA8cFWJamnI3BQPIe0ScAE6J1i1g2ww68ykO2EuoaElaVwsqjugjYEETHwCbsUBpF92Gf6JGMAQ4IevPoAg4qdMVjBRwWdBgkemTINyMdkKlAh9cgW8bpcCmyjEuQhdyd3Mzb9hjQ1shgPHz6MaTDiwXXrX4G2N9Wijutt+fT53cqujwEjlwYfPA1zBZngfG818E8MNQccQeTGbt//eAMl2aC03/+MrbAP2eRYMzVH76Dv8+iwZ9fjjgX/IkyzAZD0cMTwC8vh/ng5/JLHeAhV+zpq0RC5uN3LLIGOBc9Idsr3r5wXgPs3bKiBngPckSNGO+LL+iAQ/kyIQeboikmxBiWpANOi9cBez0w6oBxGXp6BOx1wJ5yhQwMWnZTWyBGB2yKB8iEGGdq25SAI7XRS8ArdTQJwPvRVMyeGGzI418AzuSFRQC25BWLD070pZAPDvQ1lg+2xMWbV/KeK7I4Gxyp4qZfv9XipliOfXWougFRBSQffCggSyXv68WKKHCki3Q2GBptBTbYNhoh3BiHVuuGCb61brjNpusGv85qj1GOkDT0tq6WrFYLUq9pqtbm1WtM67XSFZv/euMKvQGL3khIcYilOHbTGxQqjjY1h7H38bFPvePjPzT3DDkTC8OBAAAAAElFTkSuQmCC';
const iconSign = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABYCAMAAABGS8AGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABCUExURUxpccTs/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/8Ts/zMzMzis/zw+QP///2h3fmuAjHeJkoCJjjywT7MAAAANdFJOUwAFdYJbAqfmxyuKhYn6aTBUAAACjElEQVRYw8WZ65arIAyFK14CdehYdd7/Vcfq1CruQAQ5Z/9k4beyYgIkud2Cqk1VNpqIrCXSumkrU9+SZZSegK5IK5NELQF0hZeR7KLSNiBdFRFYsgLRSXQtwy7oE3/SaHtCWurr4sue1L243ly50XLv7j0d4pY2UqU/GhobrcYTHUUCdyIXOez12pzInciY29pktTDO0M7xMWsMLy4CUWegCY8/hRf/dMiUQl8D1m5o3C0Hfj4B+Li4nhsSR8SA986oNfxns2aGq91it/uNuvZExOMU2LF9ExkFXQmmz/9TwLXfs96M762cxYO3FWtwIng1ubI+8CwXvF08xsfby/pqsGZjeP1qWBDDDuwsgog2XNK5NnoFwEv60fVg4rI5FTz7QuUAKxgT+8yT6Hh6TucP5QBTjQ/MZPDk5IoBy29QuLnCb6p0cIsfE+ngBgbFBWB9ozxgigP322uOAdsIcD9doDnA/evMDG2OAL+4fXDzeR+73KvABy7nY0Ecj93g4SaAuw8LcLkEEaT0sNIQl0tpJfDxmwe5GKxkx+ZCxFzu2DSiqHgxO8y1zEHPXU0gyjDXMlcT/Htgb89xIbjhr//D2rCJ5uBmxT9Y0s5jwz+x/LDRf0uT51EYtHJb3eBHoYkDd4tg8Ws8D+8QuHvO+kFc7SsVZGDIXUsFWNyIwD/7S+pQj6lIMOZ+yjFYQArADHdTQKKSNwxmuLtmiFukS8Acd1eku7EsTJBB0GO5R4AHQSPEad18EosRyz20bm6GTpYKkEvG3x4bg9huhC6q/mVDL18LMl/TNFubN43cFP+jlZ6x+Z9vXDE5+p5nwJJvJJRxiJVv7JZxUJhxtJlzGLuOj9vX+HgmknR8/Atfhz0qVH+JZgAAAABJRU5ErkJggg==';
const entranceList = [
  { title: '我的学习', img: iconStudy, link: '/plans', id: 'entrance-0' },
  { title: '我的考试', img: iconExam, link: '/exams', id: 'entrance-1' },
  { title: '选修课', img: iconElective, link: '/electives', id: 'entrance-2' },
  { title: '签到', img: iconSign, link: '/sign-in-record', onClick: sign, id: 'entrance-3' },
];

const chargingImgForOne = require('./img/s2-1.png');
const chargingImgForTwo = require('./img/s2-2.png');
const chargingImgForThree = require('./img/s2-3.png');

const chargingList = [
  { title: '管理提升', img: chargingImgForOne, link: '/mall/more/4035', id: 'charging-0' },
  { title: '业务进阶', img: chargingImgForTwo, link: '/mall/more/3987', id: 'charging-1' },
  { title: '新人入职', img: chargingImgForThree, link: '/mall/more/2298', id: 'charging-2' },
];

const advantageImgForOne = require('./img/s3-1.png');
const advantageImgForTwo = require('./img/s3-2.png');
const advantageImgForThree = require('./img/s3-3.png');

const advantageList = [
  { title: '今天有趣学 今天有效用', img: advantageImgForOne, id: 'advantage-0' },
  { title: '大数据挖掘 课程高度适配', img: advantageImgForTwo, id: 'advantage-1' },
  { title: '专利技术 保障信息安全', img: advantageImgForThree, id: 'advantage-2' },
];
// 轮播图
const carouselPropTypes = {
  title: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  available: PropTypes.bool.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
};
const Carousel = ({ available, startTime, endTime, title, img, link, type, id }) => {
  if (available && (Date.parse(startTime) <= Date.now() <= Date.parse(endTime))) {
    const carouselList = {
      url: <div><a href={link}><img src={img} alt={title} /></a></div>,
      mall: <div><Link to={`/products/course/${id}`}><img src={img} alt={title} /></Link></div>,
    };

    return carouselList[AD_TYPE[type]];
  }
  return null;
};
Carousel.propTypes = carouselPropTypes;
// 入口
const entrancePropTypes = {
  title: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};
const Entrance = ({ title, img, link, onClick }) => (
  onClick ?
    <div className="wrapper" onClick={onClick}>
      <Link to={link}><img src={img} alt={title} /><span>{title}</span></Link>
    </div> :
    <div className="wrapper">
      <Link to={link}><img src={img} alt={title} /><span>{title}</span></Link>
    </div>
);
Entrance.propTypes = entrancePropTypes;
// 最热课程
const hotPropTypes = {
  title: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
};
const Hot = ({ title, img, id }) => (
  <p>
    <Link to={`/products/course/${id}`}><img src={`${img}?w_250`} alt={title} className="cover" /><span className="title">{title}</span></Link>
  </p>
);
Hot.propTypes = hotPropTypes;
// 快速充电
const chargingPropTypes = {
  title: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};
const Charging = ({ title, img, link }) => (
  <dt>
    <Link to={link}><img src={img} alt={title} /></Link>
  </dt>
);
Charging.propTypes = chargingPropTypes;
// 多学优势
const advantagePropTypes = {
  title: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
};
const Advantage = ({ title, img }) => (
  <dt>
    <img src={img} alt={title} />
  </dt>
);
Advantage.propTypes = advantagePropTypes;

class MDDHome extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      advertisementList: [],
      hotList: [],
    };
    this.renderCarousel = ::this.renderCarousel;
  }

  componentDidMount() {
    fetchData().then(axios.spread((hotListRes, advertisementListRes) => {
      this.setState({
        advertisementList: advertisementListRes.data || [],
        hotList: hotListRes.data.courseRecommendList || [],
      });
      swipe(document.querySelector('.swipe'), { speed: 400, auto: 2000, continuous: true });
    }));
  }

  renderCarousel() {
    const { advertisementList } = this.state;
    const verifyCarousel = advertisementList.map(item => (
      <Carousel
        available={item.is_available}
        startTime={item.start_time}
        endTime={item.end_time}
        img={item.img}
        title={item.title}
        link={item.link_url}
        type={item.link_type}
        id={item.link_id}
        key={item.id}
      />
    ));
    if (verifyCarousel.length) {
      return (<div className="dd-carousel swipe">
        <div className="inner swipe-wrap">
          {verifyCarousel}
        </div>
        <div className="dot" />
      </div>);
    }
    return null;
  }

  render() {
    const { hotList } = this.state;
    return (
      <div className="dd-home">
        {this.renderCarousel()}
        <div className="dd-entrance">
          {entranceList.map(item => (
            <Entrance
              img={item.img}
              title={item.title}
              link={item.link}
              key={item.id}
              onClick={item.onClick ? item.onClick : null}
            />
          ))}
        </div>
        <div className="dd-section dd-s1">
          <h2><span className="ico" />热门课程</h2>
          <div>
            {hotList.map(item => (
              <Hot
                img={item.img}
                title={item.name}
                id={item.id}
                key={item.id}
              />
            ))}
          </div>
        </div>
        <div className="dd-section dd-s2">
          <h2><span className="ico" />快速充电</h2>
          <dl>
            {chargingList.map(item => (
              <Charging
                img={item.img}
                title={item.title}
                link={item.link}
                key={item.id}
              />
            ))}
          </dl>
        </div>
        <div className="dd-section dd-s3">
          <h2><span className="ico" />多学优势</h2>
          <dl>
            {advantageList.map(item => (
              <Advantage
                img={item.img}
                title={item.title}
                key={item.id}
              />
            ))}
          </dl>
        </div>
        <Footer />
      </div>
    );
  }
}

export default MDDHome;
