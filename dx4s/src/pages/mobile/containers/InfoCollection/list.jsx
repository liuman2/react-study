import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import Loading from 'react-loading';

import { setTitle } from 'utils/dx/nav';
import RefreshLoad from '../../components/refreshload';
import Pulltext from '../../../../components/pulltext';
import { actionsInfoCollection } from '../../actions';
import List from '../../components/InfoCollection/List';
import Tab from '../../components/InfoCollection/Tab';
import './list.styl';

class InfoCollection extends Component {
  constructor(...args) {
    super(...args);
    this.pullUpCallBack = ::this.pullUpCallBack;
    this.pullDownCallBack = ::this.pullDownCallBack;
    this.onClickTab = ::this.onClickTab;
  }

  componentDidMount() {
    setTitle({ title: this.getIntl('title') });
    const {
      dispatch,
      selected,
      lastItemId,
      pageSize,
    } = this.props;
    const temp = dispatch(actionsInfoCollection.fetchData({ tabId: selected, lastItemId, pageSize }));
    if (temp instanceof Promise) {
      temp.then(() => {
        this.listBox.refresh();
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selected !== this.props.selected) {
      const {
        dispatch,
        selected,
        lastItemId,
        pageSize,
      } = nextProps;
      if (lastItemId === 0) {
        const temp = dispatch(actionsInfoCollection.fetchData({ tabId: selected, lastItemId, pageSize }));
        if (temp instanceof Promise) {
          temp.then(() => {
            this.listBox.refresh();
          });
        }
      } else {
        this.listBox.refresh();
      }
    }
  }

  onClickTab(tabId) {
    const { dispatch } = this.props;
    dispatch(actionsInfoCollection.selectTab(tabId));
  }

  getIntl = id => this.context.intl.messages[`app.info.collection.${id}`]

  pullDownCallBack(cb) {
    const {
      dispatch,
      selected,
      pageSize,
    } = this.props;
    const temp = dispatch(actionsInfoCollection.fetchData({ tabId: selected, lastItemId: 0, pageSize }));
    if (temp instanceof Promise) {
      temp.then(cb);
    }
  }

  pullUpCallBack(cb) {
    const {
      dispatch,
      selected,
      lastItemId,
      pageSize,
    } = this.props;
    const temp = dispatch(actionsInfoCollection.fetchData({ tabId: selected, lastItemId, pageSize }));
    if (temp instanceof Promise) {
      temp.then(cb);
    }
  }

  render() {
    const {
      selected,
      isFetching,
      lastItemId,
      items,
      error,
    } = this.props;
    if (error) {
      return <p className="text-center">{error}</p>;
    }
    const isEmpty = items.length === 0;
    // {isFetching && lastItemId === 0 ? <Loading type="balls" color="#38acff" className="loading" /> : null}
    return (
      <div className="info-collection">
        <Tab options={[{ id: 0, name: this.getIntl('working') }, { id: 1, name: this.getIntl('history') }]} active={selected} onClickTab={this.onClickTab} />
        <RefreshLoad
          absolute
          className="info-collection-refresh"
          needPullDown={!isEmpty}
          needPullUp={!isEmpty && lastItemId !== -1}
          pullDownCallBack={this.pullDownCallBack}
          pullUpCallBack={this.pullUpCallBack}
          ref={(ref) => { this.listBox = ref; }}
        >
          {isEmpty && !isFetching ? <p className="text-center">{this.getIntl('nodata')}</p> : <List items={items} type={selected} />}
          {lastItemId === -1 && <Pulltext isMore={false} />}
        </RefreshLoad>
      </div>
    );
  }
}

InfoCollection.contextTypes = {
  router: PropTypes.object,
  intl: PropTypes.object,
};

InfoCollection.propTypes = {
  selected: PropTypes.number.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastItemId: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  error: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const {
    selected = 0,
    tabs = {},
  } = state.infoCollection;
  const {
    isFetching = false,
    lastItemId = 0,
    pageSize = 20,
    items = [],
    error = '',
  } = tabs[selected] || {};
  return {
    selected,
    isFetching,
    lastItemId,
    pageSize,
    items,
    error,
  };
};

export default connect(mapStateToProps)(InfoCollection);

