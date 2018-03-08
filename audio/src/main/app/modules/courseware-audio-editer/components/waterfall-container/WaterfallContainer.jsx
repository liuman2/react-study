import React, { PropTypes } from 'react'
import WaterfallItem from './WaterfallItem'
import map from 'lodash/map'
import { connect } from 'react-redux'
import { prevPage, nextPage, goPage, movePage, changeDeadTime } from '../../actions/courseware-action-creator'
import classnames from 'classnames'

@connect(state => {
  const {pages: coursewarePages, currentPage, identifier} = state.coursewareAudioEditer.courseware
  return {
    coursewarePages,
    currentPage,
    identifier
  }
}, {
  prevPage,
  nextPage,
  goPage,
  movePage,
  changeDeadTime
})
class WaterfallContainer extends React.Component {
  static propTypes = {
    coursewarePages: PropTypes.arrayOf(PropTypes.object),
    currentPage: PropTypes.number, // 当前编辑页
    prevPage: PropTypes.func,
    nextPage: PropTypes.func,
    goPage: PropTypes.func,
    movePage: PropTypes.func,
    changeDeadTime: PropTypes.func,
    identifier: PropTypes.string
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentPage !== null && nextProps.currentPage !== undefined && nextProps.currentPage > -1) {
      this.scrollTop(nextProps.currentPage)
    }
  }

  canPrev = (page) => page > 0
  canNext = (page) => page < (this.props.coursewarePages.length - 1)

  getImagesYPos() {
    const scrollElm = this.scroll
    const scrollTop = scrollElm.offsetTop
    const imgTags = scrollElm.getElementsByTagName('li')

    return Array.prototype.map.call(imgTags, img => (img.offsetTop - scrollTop))
  }

  scrollTop(page) {
    const heights = this.getImagesYPos()
    this.scroll.scrollTop = heights[page - 1]
  }

  prevPageClick = () => {
    console.log(this.scroll)
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

  /**
   * 非数字，且最大 99
   */
  handleDeadTimeChange = event => {
    const { currentPage, changeDeadTime } = this.props
    if (currentPage < 0) {
      return
    }
    if (!event.target.value) { // 支持删除
      changeDeadTime('')
    } else {
      let sec = Number(event.target.value)
      if (!isNaN(sec)) {
        if (sec < 1) {
          sec = 1
        } else if (sec > 60) {
          sec = 60
        }
        changeDeadTime(sec)
      }
    }
  }

  handleGoPage = (index) => {
    if (this.props.currentPage === index) return
    this.props.goPage(index)
  }

  render() {
    const {
      coursewarePages, currentPage, movePage, identifier
    } = this.props
    const currentPageInfo = coursewarePages[currentPage]
    return <div className='ac-ui-layout__sider ac-ui-layout__scroll'>
      <div className='ac-ui-layout__sider-wrap'>
        <div className='ac-ui-layout__sider-con'>
          <div className='aui__sider-con-wrap ac-left-sider-scroll' ref={(ref) => { this.scroll = ref }}>
            <a className={classnames(
              'ac-ui-button-icon aubi-to-top',
              {'ac-ui-button-icon--disabled': !this.canPrev(currentPage)}
            )} onClick={this.prevPageClick} />
            {/* <!-- ac-ui-button-icon加类ac-ui-button-icon==active表示选中 --> */}

            <a className={classnames(
              'ac-ui-button-icon aubi-to-bottom',
              {'ac-ui-button-icon--disabled': !this.canNext(currentPage)}
            )} onClick={this.nextPageClick} />
            {/* <!-- ac-ui-button-icon加类ac-ui-button-icon==active表示选中 --> */}
            <ul className='aui__sider-ul'>
              {
                map(coursewarePages, (page, index) => <WaterfallItem key={index} page={page} index={index} isActive={currentPage === index} goPage={() => { this.handleGoPage(index) }} movePage={movePage} />)
              }
            </ul></div>
        </div>
        <div className='ac-ui-layout__sider-bottom'>
          <div className={classnames(
            'ac-ui-layout__sider-page',
            {
              'ac-ui-layout_sp--disabled': coursewarePages.length === 0
            }
          )}>
            <span className='ac-ui-layout__sp-txt'>
              音频结束后停顿
            </span>
            <input className={classnames(
              'ac-ui-small-input',
              {
                'disabled': coursewarePages.length === 0 || (identifier !== undefined && identifier !== '')
              }
            )} disabled={coursewarePages.length === 0 || (identifier !== undefined && identifier !== '')} value={currentPageInfo ? currentPageInfo.deadTime : ''} onChange={this.handleDeadTimeChange} />
            <span className='ac-ui-layout__sp-txt'>
              s 翻页
            </span></div>
        </div>
      </div>
    </div>
  }
}

export default WaterfallContainer
