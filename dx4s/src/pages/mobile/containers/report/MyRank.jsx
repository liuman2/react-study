import React, { Component } from 'react';
import classNames from 'classnames';
import { withRouter, routerShape, locationShape } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { setTitle } from 'utils/dx/nav';
import api from 'utils/api';

import Loading from '../../components/loading';
import RefreshLoad from '../../components/refreshload';
import User from './User';

import messages from './messages';
import './MyRank.styl';

const SIZE = 10;

function transform(rank) {
  return {
    userId: rank.user_id,
    name: rank.user_name,
    rate: rank.finish_rate,
    order: rank.ranking,
    avatar: rank.header_url,
    dept: rank.dept_name,
  };
}

class MyRank extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      initialed: false,
      list: [],
      myRank: {},
      active: this.props.location.query.type || 'dept',
      page: 1,
      date: '',
    };

    this.renderList = ::this.renderList;
  }

  async componentDidMount() {
    setTitle({ title: this.getIntl('title') });
    await this.fetchAndRender();
    await this.asyncSetState({
      initialed: true,
    });
    this.listBox.refresh();
  }

  getIntl = id => this.context.intl.messages[`app.report.MyRank.${id}`];
  asyncSetState = state => new Promise(resolve => this.setState(state, resolve));
// eslint-disable-next-line arrow-parens
  switchTab = async (tab) => {
    this.context.router.replace({ pathname: 'report/my-rank', query: { type: tab } });
    this.fetchAndRender(1, tab, true);
  }

  async fetchRank(page, type) {
    const { data } = await api({
      url: '/training/report/user/brief/ranking',
      params: { type, index: page, size: SIZE },
    });
    const { my_ranking: myRank, ranking_list: rankList, date } = data;
    return { myRank: transform(myRank), rankList: rankList.map(transform), date };
  }

  async fetchAndRender(page = this.state.page,
                       type = this.state.active,
                       shouldRefresh = page === 1) {
    const originList = this.state.list;
    if (this.state.loading) return originList;
    await this.asyncSetState({ loading: true });
    let fetchedList;
    let myRank = {};
    let date;
    try {
      const res = await this.fetchRank(page, type);
      fetchedList = res.rankList;
      myRank = res.myRank;
      date = res.date;
    } catch (e) {
      return [];
    }
    const list = page === 1 ? fetchedList : originList.concat(fetchedList);
    await this.asyncSetState({
      date,
      myRank,
      list,
      page,
      active: type,
      loading: false,
      hasMoreData: fetchedList.length >= 10,
    });
    if (shouldRefresh && this.listBox) this.listBox.refresh();
    return fetchedList;
  }

  renderList() {
    const { list, hasMoreData, loading, myRank, page } = this.state;
    const x = myRank.order / (page * SIZE);
    const mark = Math.floor(x) === 0 || x === 1;
    return (
      <RefreshLoad
        absolute
        loading={loading}
        className={classNames('report-list-refresh-box', { bottom0: mark })}
        needPullDown
        needPullUp={hasMoreData}
        pullDownCallBack={cb => this.fetchAndRender(1).then(cb)}
        pullUpCallBack={cb => this.fetchAndRender(this.state.page + 1).then(cb)}
        ref={(ref) => { this.listBox = ref; }}
      >
        {
          list.length ?
            <ul>
              {list.map(user => <User {...user} myOrder={myRank.order} key={user.order} />)}
            </ul>
            : <div style={{ padding: '30px', textAlign: 'center' }}>暂无数据</div>
        }
      </RefreshLoad>
    );
  }

  render() {
    if (!this.state.initialed) return <Loading wrap />;
    const { active, myRank, date, page } = this.state;
    const x = myRank.order / (page * SIZE);
    return (
      <div className="report-list">
        <aside><FormattedMessage {...messages.deadline} values={{ date }} /></aside>
        <nav>
          <a
            onClick={() => this.switchTab('dept')}
            className={classNames({ active: active === 'dept' })}
          >
            <FormattedMessage {...messages.dept} />
          </a>
          <a
            onClick={() => this.switchTab('tenant')}
            className={classNames({ active: active === 'tenant' })}
          >
            <FormattedMessage {...messages.tenant} />
          </a>
        </nav>
        {this.renderList()}
        { myRank.order && (Math.floor(x) === 0 || x === 1)
          ? null
          : <ul className="fixed-bottom mark">
            <User {...myRank} myOrder={myRank.order} />
          </ul>
        }
      </div>
    );
  }
}

const { object } = React.PropTypes;
MyRank.contextTypes = {
  router: object,
  intl: object,
};

MyRank.propTypes = {
  // router: routerShape,
  location: locationShape,
};

export default withRouter(MyRank);
