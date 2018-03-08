import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { routerShape } from 'react-router';
import { FormattedMessage } from 'react-intl';
import withAuth from 'hocs/withAuth';
import * as cartActions from 'dxActions/shopping-cart';
import Toast from 'components/modal/toast';
import { setTitle } from 'utils/dx/nav';
import moment from 'moment';

import './style.styl';
import messages from './messages';

import { transformToBasicLive } from './helper';
import { getLive } from '../../apis.js';
import ProductPop from '../course/basic-product-pop';
import Loading from '../../components/loading';
import BasicLiveContainer from './BasicContainer';
import Cart from '../../components/cart';

class LiveProduct extends Component {
  constructor() {
    super();
    this.onTab = ::this.onTab;
    this.onShowMore = ::this.onShowMore;
    this.state = {
      basicLive: null,
      live: null,
      showComboMenu: false,
      comboMenuActionType: 'BUY_NOW',
      isToastShow: false,
      toastMessageId: 'app.product.addCartSuccess',
      activeTab: 'basic',
      teacherMore: false,
      descMore: false,
    };
  }

  async componentDidMount() {
    setTitle({ title: this.context.intl.messages['app.live.title.detail'] });
    const liveId = this.props.params.product_id;
    const live = await getLive(liveId);
    const basicLive = transformToBasicLive(live);
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ live, basicLive });
  }

  componentDidUpdate() {
    const teacherBox = document.getElementById('teacherBox');
    if (teacherBox !== null) {
      const teacherBoxHeight = teacherBox.clientHeight;
      const teacherBoxScrollHeight = teacherBox.scrollHeight;

      const bthShowTeacher = document.getElementById('btnShowTeacherMore');
      if (teacherBoxHeight >= teacherBoxScrollHeight && bthShowTeacher.className !=='unfold collapse') {
        document.getElementById('btnShowTeacherMore').className = 'hidden';
      }
    }

    // const descBox = document.getElementById('descBox');
    // if (descBox !== null) {
    //   const descBoxHeight = descBox.clientHeight;
    //   const descBoxScrollHeight = descBox.scrollHeight;
    //   const bthShowDesc = document.getElementById('btnShowDescMore');
    //   if (descBoxHeight >= descBoxScrollHeight && bthShowDesc.className !=='unfold collapse') {
    //     bthShowDesc.className = 'hidden';
    //   }
    // }
  }

  onTab(tab) {
    this.setState({ activeTab: tab });
  }

  onShowMore(moreType) {
    switch (moreType) {
      case 'teacher':
        this.setState({ teacherMore: !this.state.teacherMore });
        break;
      case 'desc':
        this.setState({ descMore: !this.state.descMore });
        break;
      default:
        break;
    }
  }

  closeComboMenu = () => { this.setState({ showComboMenu: false }); };
  openComboMenu = (comboMenuActionType) => {
    const { live } = this.state;
    if (!live.can_buy) {
      this.setState({ isToastShow: true, toastMessageId: 'app.product.canNoBuy' });
      return;
    }

    const { isAdmin } = this.props;
    if (!isAdmin) {
      this.setState({ comboMenuActionType: comboMenuActionType }, () => {
        this.confirmOrder({
          buyMode: 'private',
          purchaseType: this.isFreeLive() ? 'free' : 'amount',
          qty: 1,
        });
      });
      return;
    }

    this.setState({
      showComboMenu: true,
      comboMenuActionType,
    });
  };

  isFreeLive = () => this.state.live.price.is_free;
  hasBought = () => this.state.live.has_bought;

  confirmOrder = (order) => {
    const { actions } = this.props;
    const router = this.context.router;
    const beginTime = this.state.live.begin_time;
    // const isLate = moment().isAfter(beginTime);
    // if (isLate) {
    //   this.setState({ isToastShow: true, toastMessageId: 'app.live.toast.timeout' });
    //   return;
    // }

    const orderView = {
      belong: order.buyMode,
      from: 'buy_now',
      source: 'phone',
      products: [{
        count: order.qty,
        product_id: this.props.params.product_id,
        purchase_type: order.purchaseType,
      }],
    };

    switch (this.state.comboMenuActionType) {
      case 'TO_CART': {
        const shopCart = actions.addShoppingCart({
          id: this.props.params.product_id,
          qty: order.qty,
          type: order.buyMode,
          purchase_type: this.isFreeLive() ? 'free' : order.purchaseType,
        });
        shopCart.then(() => {
          actions.fetchShoppingCartCount();
          this.setState({ isToastShow: true, toastMessageId: 'app.product.addCartSuccess' });
        });
      }
        break;
      case 'BUY_NOW':
        actions.goSettlement(orderView);
        router.push(router.createPath('order/confirm'));
        break;
      default:
        break;
    }
  };

  renderFooter = () => {
    if (this.state.showComboMenu) return null;
    const footer = (
      <div key="footer" className="dx-footer">
        <Cart />
        <div className="button to-cart" onClick={() => this.openComboMenu('TO_CART')}>
          <FormattedMessage {...messages.addToCart} />
        </div>
        <div className="button to-order" onClick={() => this.openComboMenu('BUY_NOW')}>
          <FormattedMessage {...messages.addToOrder} />
        </div>
      </div>
    );

    const alert = (
      <div
        key="alert"
        className="alert"
        onClick={() => this.context.router.push(`/live/${this.state.live.course_id}`)}
      >
        <FormattedMessage {...messages.hasBought} />
      </div>
    );

    return this.hasBought()
      ? [alert, footer]
      : footer;
  };

  render() {
    const { live, showComboMenu, basicLive } = this.state;
    const self = this;
    if (!live) return <Loading />;
    const liveEl =
      <BasicLiveContainer
        {...basicLive}
        onTab={this.onTab}
        activeTab={this.state.activeTab}
        onShowMore={this.onShowMore}
        teacherMore={this.state.teacherMore}
        descMore={this.state.descMore}
      />;
    const popup = (!showComboMenu || !live)
      ? null
      : <ProductPop
        priceInfo={live.price}
        closePop={this.closeComboMenu}
        popAction={this.state.comboMenuActionType}
        onBuy={this.confirmOrder}
      />;

    const footerEl = this.renderFooter();

    return (
      <div className="live">
        {liveEl}
        {footerEl}
        {popup}
        <Toast
          style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.25)' } }}
          isOpen={this.state.isToastShow}
          timeout={2000}
          shouldCloseOnOverlayClick={false}
          onRequestClose={() => {
            this.setState({ isToastShow: false });
          }}
        >
          <FormattedMessage id={this.state.toastMessageId} />
        </Toast>
      </div>
    );
  }
}

const { shape, string, object, bool } = React.PropTypes;
LiveProduct.contextTypes = {
  router: routerShape,
  intl: object,
};

LiveProduct.propTypes = {
  params: shape({ product_id: string.isRequired }),
  actions: shape({}),
  isAdmin: bool,
};

const mapStateToProps = state => ({
  isAdmin: state.account.user.is.admin || false,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(cartActions, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withAuth,
)(LiveProduct);
