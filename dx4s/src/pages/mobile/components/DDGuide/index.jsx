import React from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router';
import store from 'store2';

import './styles.styl';

class DDGuide extends React.Component {
  constructor(props) {
    super(props);
    this.close = ::this.close;
    this.toggleNotRemind = ::this.toggleNotRemind;
    this.state = {
      show: true,
      isRemind: true,
    };
  }

  close() {
    this.setState({ show: false });
  }

  toggleNotRemind() {
    this.setState({ isRemind: !this.state.isRemind });
    store('notShowDDGuide', !store('notShowDDGuide'));
  }

  componentWillUnmount() {
    window.sessionStorage.setItem('sessionDDGuide', '1');
  }

  render() {
    if (window.sessionStorage.getItem('sessionDDGuide')) {
      return null;
    }
    const show = this.state.show && this.props.show;
    const isRemind = this.state.isRemind;
    const settings = {
      arrows: false,
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      dotsClass: 'DDGuide-slider-dots slick-dots',
    };

    return (
      <div className="DDGuide-container" style={{ display: show ? 'block' : 'none' }}>
        <div className="DDGuide-close" onClick={this.close} />
        <div className="DDGuide-content">
          <Slider {...settings}>
            <div className="DDGuide-slider-item">
              <div className="DDGuide-slider-item-img DDGuide-slider-item-img-one" />
              <Link to="/ddguide/step" className="DDGuide-slider-item-btn">查看详情</Link>
            </div>
            <div className="DDGuide-slider-item">
              <div className="DDGuide-slider-item-img DDGuide-slider-item-img-two" />
              <Link to="/electives" className="DDGuide-slider-item-btn">查看更多课程</Link>
            </div>
          </Slider>
           <div className="DDGuide-footer" onClick={this.toggleNotRemind}>
            <i className={isRemind ? 'DDGuide-icon-not-remind' : 'DDGuide-icon-remind'} />
            <span className={isRemind ? 'DDGuide-text-not-remind' : 'DDGuide-text-remind'}>不再提醒</span>
          </div> 
        </div>
      </div>
    );
  }
}

DDGuide.propTypes = {
  show: React.PropTypes.bool,
};
DDGuide.defaultProps = {
  show: false,
};

export default DDGuide;
