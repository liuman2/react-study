import React, { Component } from 'react';
import { locationShape } from 'react-router';
import classnames from 'classnames';
import { FormattedMessage } from 'react-intl';
import api from 'utils/api';
import { setTitle } from 'utils/dx/nav';
import messages from './messages';

import TabList from '../../components/TabList';

import './DeptRank.styl';

const deptRankItem = ({
  rank,
  department_name: departmentName,
  on_jon_num: onJonNum,
  active_rate: activeRate,
}) => {
  const isTop3 = rank <= 3;
  const orderClass = classnames(
    'order',
    { first: rank === 1 },
    { second: rank === 2 },
    { third: rank === 3 }
  );
  return (
    <div className="deptRankItem">
      <div className={orderClass}>{!isTop3 && rank}</div>
      <div className="profile">
        <div className="name">{departmentName}</div>
        <div className="department"><FormattedMessage {...messages.employedNumberParam} values={{ onJonNum }} /></div>
      </div>
      <div className="complete"><FormattedMessage {...messages.activityRate} /> <span className="percentage">{activeRate}%</span></div>
    </div>
  );
};

const { string, number } = React.PropTypes;
deptRankItem.propTypes = {
  rank: number,
  department_name: string,
  on_jon_num: string,
  active_rate: number,
};

class DeptRank extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    setTitle({ title: this.getIntl('title') });
  }

  onFetch = async (id) => {
    const { data } = await api({
      url: '/training/report/department/brief/get_rank_list',
      params: { time_key: id },
    });
    return data.map(value => deptRankItem(value));
  };

  getIntl = id => this.context.intl.messages[`app.report.deptRank.${id}`]

  render() {
    const { location: { query: { type: activeID } } } = this.props;
    return (
      <TabList
        tabs={[
          { name: <FormattedMessage {...messages.lastWeek} />, id: 'lw' },
          { name: <FormattedMessage {...messages.lastMonth} />, id: 'lm' },
          { name: <FormattedMessage {...messages.thisMonth} />, id: 'tm' },
        ]}
        activeID={activeID}
        asyncRenderList={this.onFetch}
      />
    );
  }
}

const { object } = React.PropTypes;
DeptRank.contextTypes = {
  intl: object,
};

DeptRank.propTypes = {
  location: locationShape,
};

export default DeptRank;
