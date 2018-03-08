import React, { Component, PropTypes } from 'react';
import { locationShape } from 'react-router';
import { FormattedMessage } from 'react-intl';
import api from 'utils/api';
import { setTitle } from 'utils/dx/nav';
import messages from './messages';

import TabList from '../../components/TabList';

import './DeptNotLogged.styl';
import defaultUserImg from './imgs/head-default.png';

const notLoggedItem = (data) => {
  let loggedTime;
  if (data.is_entry) {
    if (data.last_active_time) {
      loggedTime = data.last_active_time;
    } else {
      loggedTime = <FormattedMessage {...messages.notLogged} />;
    }
  } else {
    loggedTime = <FormattedMessage {...messages.notEntry} />;
  }

  return (<div className="notLoggedItem" key={data.user_id}>
    <img src={data.head_url || defaultUserImg} alt="" />
    <div className="profile">
      <div className="name">{data.user_name}</div>
      <div className="department">{data.department_name}</div>
    </div>
    <div className="loggedTime">{loggedTime}</div>
  </div>);
};

class DeptNotLogged extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    setTitle({ title: this.getIntl('title') });
  }

  onFetch = async (id, page, size) => {
    const { data } = await api({
      url: '/training/report/department/brief/get_not_login_list',
      params: { department_id: this.props.params.dept_id, time_key: id, index: page, size },
    });
    return data.map(value => notLoggedItem(value));
  };

  getIntl = id => this.context.intl.messages[`app.report.DeptNotLogged.${id}`]

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
DeptNotLogged.contextTypes = {
  intl: object,
};

DeptNotLogged.propTypes = {
  location: locationShape,
  params: PropTypes.object,
};

export default DeptNotLogged;
