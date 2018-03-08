import React from 'react';
import PropTypes from 'prop-types';
import './Tab.styl';

const Tab = ({ options, active, onClickTab }) => (
  <ul className="info-collection-tab">
    {
      options.map(option => (
        <li
          role="presentation"
          key={option.id}
          className={option.id === active ? 'active' : ''}
          onClick={() => onClickTab(option.id)}
        >
          {option.name}
        </li>),
      )
    }
  </ul>
);

Tab.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  active: PropTypes.number.isRequired,
  onClickTab: PropTypes.func.isRequired,
};

export default Tab;
