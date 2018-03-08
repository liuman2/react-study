import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { hasMallModuleSelector, hasManagementCenterSelector } from 'dxSelectors/account-user';
import classNames from 'classnames';
import withAuth from 'hocs/withAuth';
import messages from './messages';

const propTypes = {
  newMessage: PropTypes.object.isRequired,
  hasMallModule: PropTypes.bool,
  hasManagementCenter: PropTypes.bool,
};

function getNewMsg(newMessage) {
  return {
    menu_profile: true,
    'red-dot': newMessage.announcement_msg,
  };
}

class Footer extends React.Component {
  render() {
    const newMessage = this.props.newMessage;
    let mallModule = null;
    if (this.props.hasMallModule) {
      mallModule = (
        <li>
          <Link to="/mall" className="menu_mall" activeClassName="active">
            <FormattedMessage {...messages.mall} />
          </Link>
        </li>);
    }
    let managementCenter = null;
    if (this.props.hasManagementCenter) {
      managementCenter = (
        <li>
          <Link to="/management" className="menu_management" activeClassName="active">
            <FormattedMessage {...messages.management} />
          </Link>
        </li>);
    }
    return (
      <div className="footer">
        <div className="fixed-bottom">
          <ul>
            <li><Link to="/home" className="menu_home" activeClassName="active"><FormattedMessage {...messages.course} /></Link></li>
            {mallModule}
            {managementCenter}
            <li><Link to="/profile" className={classNames(getNewMsg(newMessage))} activeClassName="active"><FormattedMessage {...messages.mine} /></Link></li>
          </ul>
        </div>
      </div>
    );
  }
}

Footer.propTypes = propTypes;
const mapStateToProps = state => (
  {
    newMessage: state.newMessage.newMessage || {},
    hasMallModule: hasMallModuleSelector(state),
    hasManagementCenter: hasManagementCenterSelector(state),
  }
);

export default connect(mapStateToProps)(withAuth(Footer));
