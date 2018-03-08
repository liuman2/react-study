import React, { Component } from 'react'
import {routerShape} from 'react-router'
import classnames from 'classnames'
import CSSModules from 'react-css-modules'
import styles from '../styles/header.scss'
import { push } from 'react-router-redux/lib/actions'
import {connect} from 'react-redux'

@connect(state => ({}), {
  push
})
@CSSModules(styles, {allowMultiple: true})
export default class Header extends Component {
  static propTypes = {
    title: React.PropTypes.string,
    rightBtnText: React.PropTypes.string,
    rightBtnAction: React.PropTypes.func,
    hiddenBtn: React.PropTypes.bool,
    rightBtnDisabled: React.PropTypes.bool,
    backUrl: React.PropTypes.string,
    push: React.PropTypes.func
  }
  static defaultProps = {
    title: '',
    rightBtnText: '完成',
    hiddenBtn: false,
    rightBtnAction: () => {},
    rightBtnDisabled: false,
    backUrl: ''
  }
  static contextTypes = {
    router: routerShape.isRequired
  }
  handleBack = () => {
    if (window.location.hash.indexOf('save') > -1 || window.location.hash.indexOf('edit') > -1) {
      window.location = './#'
      return
    }
    if (window.location.hash === '#/') {
      return
    }
    if (this.props.backUrl) {
      this.props.push(this.props.backUrl)
    } else {
      this.context.router.goBack()
    }
  }
  handleRightBtn = (e) => {
    if (this.props.rightBtnDisabled) return
    this.props.rightBtnAction(e)
  }
  render() {
    const {
      title,
      rightBtnText,
      hiddenBtn,
      rightBtnDisabled
    } = this.props
    return (
      <div className='ui-header'>
        <div className='ui-header--left'>
          <a className='ui-btn__back' onClick={this.handleBack} />
        </div>
        <div className='ui-header--mid'>{title}</div>
        <div className='ui-operate--item' hidden={hiddenBtn}>
          <a
            className={classnames(
              styles['ui-operate--item--a'],
              {
                [styles['disabled']]: rightBtnDisabled
              })
            }
            onClick={this.handleRightBtn}>{rightBtnText}</a>
        </div>
      </div>
    )
  }
}
