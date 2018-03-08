import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from '../styles/modal.scss'

const nonFn = () => {}

@CSSModules(styles, {allowMultiple: true})
export default class ModalComponent extends Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    okText: React.PropTypes.string,
    cancelText: React.PropTypes.string,
    children: React.PropTypes.element,
    hideOk: React.PropTypes.bool,
    hideCancel: React.PropTypes.bool,
    clickWrapperClose: React.PropTypes.bool
  }
  static defaultProps = {
    visible: false,
    onOk: nonFn,
    onCancel: nonFn,
    onClose: nonFn,
    okText: '确定',
    cancelText: '取消',
    hideCancel: false,
    hideOk: false,
    clickWrapperClose: true
  }
  handleClickWrapper = () => {
    if (!this.props.clickWrapperClose) return
    this.props.onCancel()
  }
  render() {
    const {
      visible,
      onOk,
      onCancel,
      okText,
      cancelText,
      children,
      hideOk,
      hideCancel
    } = this.props
    return (
      <div hidden={!visible} className='ui-pop'>
        <div className='ui-mask' onClick={this.handleClickWrapper} />
        <div className='ui-modal'>
          <div className='modal--body'>
            {children}
          </div>
          <div className='modal--foot modal--confirm'>
            <a className='modal--confirm__btn' hidden={hideCancel} onClick={onCancel}>{cancelText}</a>
            <a className='modal--confirm__btn' hidden={hideOk} onClick={onOk}>{okText}</a>
          </div>
        </div>
      </div>
    )
  }
}
