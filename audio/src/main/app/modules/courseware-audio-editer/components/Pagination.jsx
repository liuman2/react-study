import React, {PropTypes} from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'
import {prevPage, nextPage} from '../actions/courseware-action-creator'

@connect(state => {
  const {pages: coursewarePages, currentPage} = state.coursewareAudioEditer.courseware
  return {
    totalPage: coursewarePages.length,
    currentPage
  }
}, {
  prevPage,
  nextPage
})
class Pagination extends React.Component {
  static propTypes = {
    totalPage: PropTypes.number, // 总页数
    currentPage: PropTypes.number, // 当前编辑页
    prevPage: PropTypes.func,
    nextPage: PropTypes.func
  }

  canPrev = (page) => page > 0
  canNext = (page) => page < (this.props.totalPage - 1)

  prevPageClick = () => {
    const {currentPage, prevPage} = this.props
    if (this.canPrev(currentPage)) {
      prevPage()
    }
  }

  nextPageClick = () => {
    const {currentPage, nextPage} = this.props
    if (this.canNext(currentPage)) {
      nextPage()
    }
  }

  render() {
    const {currentPage, totalPage} = this.props
    return <div className='ac-ui-page-wrap'>
      <div className='ac-ui-page'>
        <a className={classnames(
          'ac-ui-button ac-ui-button--text-grey',
          {'ac-ui-button--disabled': !this.canPrev(currentPage)}
        )} onClick={this.prevPageClick} >上一页</a>
        {/* <!-- ac-ui-button不可点击加类名ac-ui-button--disabled --> */}
        <span className='aup__input-wrap'>
          <span className='aup__input-txt'>{currentPage + 1}</span>
          <span className='aup__input-line'>/</span>
          <span className='aup__input-txt'>{totalPage}</span>
          {/* <!-- <input  type='text' value='10'> --> */}
        </span>
        <a className={classnames(
          'ac-ui-button ac-ui-button--text-grey',
          {'ac-ui-button--disabled': !this.canNext(currentPage)}
        )} onClick={this.nextPageClick} >下一页</a>
        {/* <!-- ac-ui-button不可点击加类名ac-ui-button--disabled --> */}
      </div>
    </div>
  }
}

export default Pagination
