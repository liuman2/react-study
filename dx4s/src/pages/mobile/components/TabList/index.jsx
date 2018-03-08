import React, { Component } from 'react';
import classNames from 'classnames';

import RefreshLoad from '../../components/refreshload';
import Tab, { tabShape } from '../Tab';
import './TabList.styl';

class TabList extends Component {
  constructor() {
    super();
    this.state = {
      hasMoreData: true,
      active: '',
      isFetching: false,
      page: 1,
      size: 10,
      list: [],
    };
  }

  async componentDidMount() {
    const { activeID } = this.props;
    this.switchTab(activeID);
  }

  asyncSetState = state => new Promise(resolve => this.setState(state, resolve));

  switchTab = (tabId) => {
    this.fetchAndRender({ page: 1, id: tabId });
  };

  async fetchAndRender(data) {
    const { page = this.state.page, id = this.state.active, size = this.state.size } = data;
    const { isFetching, list: prevList } = this.state;
    if (isFetching) return;
    await this.asyncSetState({ isFetching: true });
    const { asyncRenderList, onListRenderFail } = this.props;
    let fetchedList;
    try {
      fetchedList = await asyncRenderList(id, page, size);
    } catch (e) {
      if (onListRenderFail) onListRenderFail(e);
      this.setState({ isFetching: false });
      return;
    }
    const list = page === 1 ? fetchedList : prevList.concat(fetchedList);
    await this.asyncSetState({
      list,
      page,
      isFetching: false,
      active: id,
      hasMoreData: fetchedList.length === size,
    });
    if (page === 1 && this.listBox) this.listBox.refresh();
  }

  renderTab() {
    const { tabs } = this.props;
    const { active } = this.state;
    return (
      <Tab tabs={tabs} active={active} onSwitch={this.switchTab} />
    );
  }

  renderList() {
    const { isFetching, hasMoreData, list, page } = this.state;
    const { listClassName } = this.props;
    const empty = page === 1 && !list.length;
    return (
      <RefreshLoad
        absolute
        empty={empty}
        loading={isFetching}
        className={listClassName || 'tab-list-refresh-load'}
        needPullDown
        needPullUp={!empty && hasMoreData}
        pullDownCallBack={cb => this.fetchAndRender({ page: 1 }).then(cb)}
        pullUpCallBack={cb => this.fetchAndRender({ page: this.state.page + 1 }).then(cb)}
        ref={(ref) => { this.listBox = ref; }}
      >
        {list.length ? list : <div style={{ padding: '30px', textAlign: 'center' }}>暂无数据</div>}
      </RefreshLoad>
    );
  }

  render() {
    return (
      <div className={this.props.className || 'tab-list'}>
        {this.props.children}
        {this.renderTab()}
        {this.renderList()}
      </div>
    );
  }
}

const { string, element, func } = React.PropTypes;
TabList.propTypes = {
  tabs: tabShape,
  asyncRenderList: func.isRequired,
  onListRenderFail: func,
  listClassName: string,
  className: string,
  children: element,
  activeID: string,
};

export default TabList;
