/**
 * 课程管理列表
 */

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setTitle } from 'utils/dx/nav';
import api from 'utils/api';
import './management.styl';
import RefreshLoad from '../../components/refreshload';
import img from './img/icon-empty-list.png';

const size = 10;

class ManagementCourseList extends Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor() {
    super();
    this.state = {
      index: 1,
      list: [],
    };
    this.renderEmpty = ::this.renderEmpty;
    this.renderList = ::this.renderList;
  }

  async componentDidMount() {
    await this.fetchList();
  }

  async fetchList(index = this.state.index) {
    const { data } = await api({
      url: '/training/course/reference/list',
      params: { index, size },
    });

    const list = index === 1 ? data.courses : this.state.list.concat(data.courses);
    const hasMoreData = data.courses.length >= 10;
    this.setState({ list, index, hasMoreData });
    if (index === 1 && this.listBox) this.listBox.refresh();
    return data.courses;
  }

  renderEmpty() {
    return (
      <div className="guide-page">
        <img src={img} alt={img} />
        <p className="sub-content">{this.context.intl.messages['app.management.list.empty']}</p>
      </div>
    );
  }

  renderList() {
    const { list, hasMoreData } = this.state;
    const emptyEl = this.renderEmpty();
    return (
      list.length ?
        <RefreshLoad
          needPullDown
          needPullUp={hasMoreData}
          className={`${__platform__.dingtalk ? 'refresh-container-bottom' : 'refresh-container'}`}
          pullDownCallBack={cb => this.fetchList(1).then(cb)}
          pullUpCallBack={cb => this.fetchList(this.state.index + 1).then(cb)}
          ref={(ref) => { this.listBox = ref; }}
        >
          <ul className={`exam-list ${hasMoreData ? '' : 'pb-100'}`}>
            {
              list.map(item => (
                <li key={item.id}>
                  <div className="exam-item pt-24 pl-24 mb-16">
                    <div className="exam-img">
                      <img src={item.cover_url} />
                      {
                        item.source === 'mall' && <div className={`exam-img-corner ${item.source}`}>{this.context.intl.messages[`app.management.course.${item.source}`]}</div>
                      }
                    </div>
                    <div className="exam-info">
                      <div className="exam-info-title">{item.name}</div>
                      <div className="exam-info-desc">
                        <div className="pull-left">
                          <span>{this.context.intl.messages['app.management.course.author']}：</span><span className="mr-10">{item.author_name.length > 4 ? (item.author_name.substr(0, 4) + '...') : item.author_name}</span>
                        </div>
                        <div className="pull-right">
                          { item.available_num === null && (<span>{this.context.intl.messages['app.management.course.available']}：{this.context.intl.messages['app.management.course.unlimited']}</span>) }
                          { item.available_num !== null && (<span>{this.context.intl.messages['app.management.course.used']}：{item.used_qty}|{item.available_num}</span>) }
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            }
          </ul>
        </RefreshLoad> : emptyEl
    );
  }

  render() {
    setTitle({ title: this.context.intl.messages['app.management.course.title'] });
    return (
      <div className="management">
        { this.renderList() }
        <div className="dx-footer">
          <a className="dx-footer-button" onClick={() => this.context.router.push('management/course/guid')}>
            <span className="icon-plus" />
            { this.context.intl.messages['app.management.course.new'] }
          </a>
        </div>
      </div>
    );
  }
}

ManagementCourseList.contextTypes = {
  intl: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Object.assign({}),
    dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManagementCourseList);
