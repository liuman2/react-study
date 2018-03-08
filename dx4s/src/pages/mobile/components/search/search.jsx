import React from 'react';
import SlideNav from '../slide-nav';

function noop() {

}
class Search extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleSubmit = ::this.handleSubmit;
    this.handleBlur = ::this.handleBlur;
    this.state = {
      showSlide: false,
      filter: [],
    };
  }

  onFilter(filter) {
    this.setState({ filter }, () => {
      this.props.onFilter(filter);
      this.setState({ showSlide: false });
      this.onQuery();
    });
  }

  onQuery() {
    const filter = this.state.filter || {};
    const search = (this.searchInput && this.searchInput.value) || '';  // DX-12546
    this.props.onQuery({ filter, search });
  }

  focus() {
    this.searchInput.focus();
  }

  handleSubmit(e) {
    e.preventDefault();
    const name = this.searchInput.value.trim();
    this.searchInput.className = name ? 'not-empty' : '';
    this.props.onSearch(name);
    this.onQuery();
  }

  handleBlur() {
    const name = this.searchInput.value.trim();
    this.searchInput.className = name ? 'not-empty' : '';
    this.props.onBlur();
  }

  render() {
    const { query, defaultFilter, placeholder, buttonText, onFocus, children } = this.props;
    const search = (
      <div className="search">
        <div className="search-placeholder"><span>{placeholder}</span></div>
        <form className="search-input" onSubmit={e => this.handleSubmit(e)} action="#">
          <input
            type="search"
            ref={(ref) => { this.searchInput = ref; }}
            onFocus={onFocus}
            onBlur={this.handleBlur}
          />
        </form>
      </div>
    );
    return (
      <div className="search-box-wrap">
        <div className="search-box">
          {children || search}
          {
            query ? (
              <a className="icon-type" onClick={() => this.setState({ showSlide: true })}>&nbsp;</a>
            ) : ''
          }
        </div>
        {
          this.props.query ? (
            <SlideNav
              query={query}
              onSure={filter => this.onFilter(filter)}
              defaultSelected={defaultFilter}
              buttonText={buttonText}
              isOpen={this.state.showSlide}
            />
          ) : null
        }
      </div>

    );
  }
}

Search.propTypes = {
  query: React.PropTypes.arrayOf(React.PropTypes.object),
  onFocus: React.PropTypes.func,
  onBlur: React.PropTypes.func,
  onSearch: React.PropTypes.func,
  onFilter: React.PropTypes.func,
  onQuery: React.PropTypes.func,
  defaultFilter: React.PropTypes.arrayOf(React.PropTypes.string),
  placeholder: React.PropTypes.string,
  buttonText: React.PropTypes.string,
  children: React.PropTypes.element,
};

Search.defaultProps = {
  onSearch: noop,
  onFilter: noop,
  onQuery: noop,
  onFocus: noop,
  onBlur: noop,
  defaultFilter: [],
  buttonText: 'OK',
};

export default Search;
