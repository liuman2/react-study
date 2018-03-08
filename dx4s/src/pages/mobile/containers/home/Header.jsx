import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

import messages from './messages';
import more from './img/arrow-right.png';

function Header(props) {
  return (
    <div className="title">
      <div className="title-content pull-left">
        {props.children}
      </div>
      <div className="title-more pull-right">
        <Link to={props.to}> <img src={more} alt=""/> </Link>
      </div>
    </div>
  );
}

Header.propTypes = {
  children: React.PropTypes.element.isRequired,
  to: React.PropTypes.string,
};

export default Header;
