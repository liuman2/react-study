import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { locationShape, routerShape, withRouter } from 'react-router';
// import Loading from 'react-loading';
import Textarea from 'react-textarea-autosize';

import api from 'utils/api';
import { setTitle } from 'utils/dx/nav';
// import messages from './messages';
import Button from '../../../../components/button';
import { Toast } from '../../../../components/modal/index';
import './form.styl';

class InfoCollectionForm extends Component {
  constructor(...args) {
    super(...args);
    this.fetchData = ::this.fetchData;
    this.renderText = ::this.renderText;
    this.renderSelect = ::this.renderSelect;
    this.onClickSave = ::this.onClickSave;
    this.onChange = ::this.onChange;
    this.onRequestClose = ::this.onRequestClose;
    this.state = {
      toastIsOpen: false,
      toastMsg: '',
      btnDisabled: false,
      isHistory: this.props.location.query.type === '1', // 0: 新增, 1: 历史
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  onClickSave() {
    if (this.state.btnDisabled) {
      this.setSate({
        toastMsg: '您已提交',
        toastIsOpen: true,
      });
      return;
    }

    const errors = this.state.items.filter((item) => {
      if (item.required && (!item.value || item.value.length === 0)) {
        return true;
      }
      return false;
    });

    if (errors.length > 0) {
      // const str = errors.map(error => error.name).join(';\n');
      this.setState({
        toastIsOpen: true,
        toastMsg: this.getIntl('required'), // '带星[*]字段必填',
      });
      return;
    }

    this.setState({
      toastIsOpen: true,
      toastMsg: this.getIntl('saving'),
    });

    // console.log(this.state);
    // console.log(errors);

    // const id = this.props.params.id;
    api({
      method: 'POST',
      url: '/account/infos/forms/content',
      data: { ...this.state },
    }).then(() => {
      this.setState({
        btnDisabled: true,
        toastIsOpen: true,
        toastMsg: this.getIntl('submitSuccess'), // '提交成功',
      });
    }).catch((err) => {
      this.setState({
        btnDisabled: false,
        toastIsOpen: true,
        toastMsg: err.response.data.message,
      });
    });
  }

  onChange(e, id) {
    const value = e.target.value;
    const items = this.state.items.map(item => (item.id === id ? { ...item, value } : item));
    this.setState({ items });
  }

  onRequestClose() {
    this.setState({ toastIsOpen: false });
    if (this.state.btnDisabled) {
      this.props.router.go(-1);
    }
  }

  getIntl = id => this.context.intl.messages[`app.info.collection.${id}`]

  async fetchData() {
    const id = this.props.params.id;
    // const type = this.props.location.query.type;
    const url = this.state.isHistory ? `/account/infos/forms/history/${id}` : `/account/infos/forms/${id}`;
    const { data } = await api({
      url,
    });
    this.setState({
      ...data,
    });
    setTitle({ title: data.name });
  }

  // type: 0 文本类型收集项
  renderText({
    name,
    id,
    value,
    required = false,
  }) {
    return (<div className="group" key={id}>
      <label htmlFor={id}>{name}{required ? ' *' : ''}</label>
      <Textarea
        disabled={this.state.isHistory}
        value={!value ? '' : value}
        id={id}
        onChange={e => this.onChange(e, id)}
        style={{ padding: '6px 4px 8px' }}
      />
    </div>);
  }

  // type: 1 选择类型收集项
  renderSelect({
    name,
    id,
    value,
    items,
    required = false,
  }) {
    return (<div className="group" key={id}>
      <label htmlFor={id}>{name}{required ? ' *' : ''}</label>
      <select
        disabled={this.state.isHistory}
        value={!value ? '' : value}
        id={id}
        onChange={e => this.onChange(e, id)}
      >
        <option value="">{this.getIntl('please')}</option>
        {
          items.map(item => (
            <option key={item}>{item}</option>
          ))
        }
      </select>
    </div>);
  }

  render() {
    const {
      items = [],
      create_time: createTime,
    } = this.state;
    // if (items.length === 0) return <p className="loading">loading...</p>;
    return (
      <div className="info-collection-form">
        <div className="infos">
          {
            items.map((item) => {
              const temp = {
                0: this.renderText,
                1: this.renderSelect,
              };
              return temp[item.type](item);
            })
          }
        </div>
        {
          this.state.isHistory
          ?
            <p className="times">{this.getIntl('submitTime')}{createTime}</p>
          :
            <div className="buttons">
              <Button type="primary" size="block" onClick={this.onClickSave} disabled={this.state.btnDisabled}>{this.getIntl('submit')}</Button>
            </div>
        }
        <Toast
          isOpen={this.state.toastIsOpen}
          timeout={1500}
          onRequestClose={this.onRequestClose}
        >
          <span>{this.state.toastMsg}</span>
        </Toast>
      </div>
    );
  }
}

InfoCollectionForm.contextTypes = {
  router: PropTypes.object,
  intl: PropTypes.object,
};

InfoCollectionForm.propTypes = {
  location: locationShape.isRequired,
  router: routerShape,
  params: PropTypes.shape({
    id: PropTypes.string,
  }).isRequired,
};


export default withRouter(InfoCollectionForm);

// <label htmlFor="key1">* 客户名称</label>
// <Textarea
//   value={this.state.key1}
//   onChange={e => this.setState({ key1: e.target.value })}
//   style={{ padding: '6px 4px 8px' }}
// />
// <label htmlFor="key2">客户名称</label>
// <Textarea
//   style={{ padding: '6px 4px 8px' }}
// />
// <label htmlFor="key2">* 客户意见</label>
// <select name="" id="">
//   <option value="">请选择</option>
//   <option value="">非常好</option>
//   <option value="">一般</option>
// </select>
// <label>客户名称</label>
// <Textarea
//   style={{ padding: '6px 4px 8px' }}
// />
