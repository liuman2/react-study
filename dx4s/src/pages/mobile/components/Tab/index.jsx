import React, { PropTypes } from 'react';
import classNames from 'classnames';

import './tab.styl';

function Tab({ tabs, active, onSwitch }) {
  return (
    <nav>
      { tabs.map(({ id, name, sort }) => (
        <a
          onClick={() => onSwitch(id)}
          className={classNames({ active: active === id })}
          key={id}
        >
          {name}
          {sort && <span className="operation">{sort}</span>}
        </a>
      )) }
    </nav>
  );
}

Tab.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    id: PropTypes.any,
    sort: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  })).isRequired,
  onSwitch: PropTypes.func.isRequired,
  active: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

export const tabShape = Tab.propTypes;
export default Tab;
