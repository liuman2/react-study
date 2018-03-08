import React from 'react';
import { withRouter, routerShape } from 'react-router';
import classnames from 'classnames';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

import defaultAvatar from './imgs/head-default.png';

function User({ userId, order, avatar, name, dept, rate, myOrder, router }) {
  const orderClass = classnames(
    'order',
    { first: order === 1 },
    { second: order === 2 },
    { third: order === 3 }
  );
  let str;
  if (order) {
    if (order <= 3) {
      str = '';
    } else {
      str = order;
    }
  } else {
    str = <FormattedMessage {...messages.rankFlunk} />;
  }
  const goPage = () => {
    if (myOrder === order) {
      router.go(-1);
    } else {
      router.push(`report/other?userId=${userId}`);
    }
  };
  return (
    <li className={myOrder === order ? 'mark' : ''} onClick={goPage}>
      <div className={orderClass}>{str}</div>
      <div className="head"><img src={avatar || defaultAvatar} alt="" /></div>
      <div className="userinfo">
        <div className="name">{name}</div>
        <div className="department">{dept}</div>
      </div>
      <div className="complete">
        <FormattedMessage {...messages.rankFinishRate} />
        {order ? <span className="percentage">{rate}%</span> : <FormattedMessage {...messages.rankFlunkRate} />}
      </div>
    </li>
  );
}
const { string, number } = React.PropTypes;
User.propTypes = {
  userId: number,
  order: number,
  avatar: string,
  name: string,
  dept: string,
  rate: number,
  myOrder: number,
  router: routerShape,
};

export default withRouter(User);
