import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import './List.styl';

const List = ({ items, type }) => (
  <ul className="info-collection-list">
    {
      items.map(item => (
        <li key={item.id}>
          <Link to={`info-collection/${item.id}?type=${type}`}>
            <div>{item.name}</div>
            <div className="createTime">{item.create_time}</div>
          </Link>
        </li>),
      )
    }
  </ul>
);

List.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  type: PropTypes.number.isRequired,
};

export default List;
