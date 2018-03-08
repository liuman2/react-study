import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux/lib/actions'
import { h5BottomTypeSet, goPage, changeDeadTime, movePage, removeNoAudioPage } from 'modules/courseware-audio-editer/actions/courseware-action-creator'
import UploadBtn from './components/UploadBtn'
import Recorder from './components/Recorder'
import RecorderOver from './components/RecorderOver'
import AudioSource from './components/AudioSource'
import AudioHandle from './components/AudioHandle'
import classnames from 'classnames'
import isNumber from 'lodash/isNumber'
import toNumber from 'lodash/toNumber'
import isNaN from 'lodash/isNaN'
import Modal from 'modules/h5/components/Modal'
import Toast from 'components/toast'
import Header from 'modules/h5/share/header'

const audioTypes = {
  upload: 3,
  record: 2
}

@connect(state => ({
  pages: state.coursewareAudioEditer.courseware.pages,
  currentPage: state.coursewareAudioEditer.courseware.currentPage,
  h5BottomType: state.coursewareAudioEditer.courseware.h5BottomType,
  title: state.coursewareAudioEditer.courseware.title
}), {
  push,
  goPage,
  h5BottomTypeSet,
  changeDeadTime,
  movePage,
  removeNoAudioPage
})
export default class CoursewareEdit extends Component {
  static propTypes = {
    push: React.PropTypes.func,
    pages: React.PropTypes.array,
    currentPage: React.PropTypes.number,
    goPage: React.PropTypes.func,
    h5BottomType: React.PropTypes.number,
    h5BottomTypeSet: React.PropTypes.func,
    changeDeadTime: React.PropTypes.func,
    removeNoAudioPage: React.PropTypes.func,
    title: React.PropTypes.string
  }
  constructor(props) {
    super(props)
    this.state = {
      isDisabled: false,
      modalVisible: false,
      modalBody: null
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentPage !== this.props.currentPage) {
      this.setBottom(nextProps.currentPage, nextProps.pages)
    }
    if (nextProps.pages.length !== this.props.pages.length) {
      this.setState({
        isDisabled: nextProps.pages.length === 0
      })
    }
  }
  componentDidMount() {
    this.setState({
      isDisabled: this.props.pages.length === 0
    })
    this.setBottom(this.props.currentPage, this.props.pages)
  }
  handleGoPage = (index) => {
    if (this.state.isDisabled) return
    if (this.props.currentPage === index) return
    this.props.goPage(index)
    this.setBottom(index)
  }
  handleChangeAudioBottomType = (type) => {
    this.setState({
      audioBottomType: type
    })
  }
  handleChangeDeadTime = (e) => {
    if (this.state.isDisabled) return
    let sec = e.target.value
    if (sec === '') {
      this.props.changeDeadTime(sec)
      return
    }
    sec = toNumber(sec)
    if (!isNumber(sec) || isNaN(sec)) return
    if (sec < 1) {
      sec = 1
    } else if (sec > 60) {
      sec = 60
    }
    this.props.changeDeadTime(sec)
  }
  handleScrollLeft = () => {
    if (this.state.isDisabled) return
    this.refs.pagesWrap.scrollLeft += 100
  }
  handleScrollRight = () => {
    if (this.state.isDisabled) return
    this.refs.pagesWrap.scrollLeft -= 100
  }
  setBottom = (index, pages) => {
    let audioType = this.getAudioType(index, pages)
    let bottomType = 0
    if (audioType) bottomType = audioTypes[audioType]
    this.props.h5BottomTypeSet(bottomType)
  }
  getAudioType = (index, pages) => {
    pages = pages || this.props.pages
    if (!pages[index]) return false
    const currAudio = pages[index].audio || null

    if (currAudio) return currAudio.from
    return false
  }
  handleSave = () => {
    const { pages } = this.props
    let unfinishedCount = []
    pages.map((page, index) => {
      if (!page.audio) {
        unfinishedCount.push(index + 1 + '页')
      }
    })
    const countLength = unfinishedCount.length
    if (countLength === this.props.pages.length) {
      Toast('课件不存在音频')
      return
    }
    if (countLength >= 5) {
      const body = (
        <p className='modal--save__desc'>多个页面还未录制或上传音频，
        确定完成制作这些页面将被删除。</p>
      )
      this.setState({
        modalBody: body
      })
      this.handleToggleModal()
    } else if (countLength < 5 && countLength > 0) {
      const text = unfinishedCount.join('、')
      const body = (
        <p className='modal--save__desc'>
          {`${text}还未录制或上传音频，点击确定${text}将被删除`}
        </p>
      )
      this.setState({
        modalBody: body
      })
      this.handleToggleModal()
    } else {
      // this.props.push('/preview')
      this.props.push('/save')
    }
  }
  handleDeleteUnfinishedPage = () => {
    this.props.removeNoAudioPage()
    this.props.push('/preview')
  }
  handleToggleModal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }
  handleModalCancel = () => {
    this.handleToggleModal()
  }
  render() {
    const comps = {
      0: AudioSource,
      1: Recorder,
      2: RecorderOver,
      3: AudioHandle
    }
    const {
      isDisabled,
      modalVisible,
      modalBody
    } = this.state
    const {
      pages,
      currentPage,
      h5BottomType,
      title
    } = this.props
    const currImg = pages.length > 0 ? pages[currentPage].imageUrl : ''
    const BottomComponent = comps[h5BottomType]
    // const isDisabled = this.props.pages.length
    return (
      <div className='layout-wrapper'>
        <Header
          title='课件制作'
          rightBtnAction={this.handleSave}
          rightBtnDisabled={!pages.length}
        />
        <div className='ui-carousel'>
          <div className='carousel--name'>{title}</div>
          <div className='carousel--view'>
            {
              currImg ? <img src={currImg} /> : <UploadBtn />
            }
          </div>
          <div className='carousel--list'>
            <a
              className={classnames(
                'carousel-btn--pre',
                {
                  'disabled': !pages.length
                }
              )}
              onClick={this.handleScrollRight} />
            <a
              className={classnames(
                'carousel-btn--next',
                {
                  'disabled': !pages.length
                }
              )}
              onClick={this.handleScrollLeft} />
            <div className='carousel--list__wrap'>
              <ul ref='pagesWrap' className='carousel--list__item' style={{ overflowX: 'scroll', overflowY: 'hidden', width: '100%', scrollBehavior: 'smooth' }}>
                {
                  pages.map((page, index) => (
                    <li
                      onClick={() => { this.handleGoPage(index) }}
                      key={index}
                      className={
                        classnames(
                          'carousel--list__cell',
                          {
                            'current': index === currentPage
                          }
                        )
                      }
                    >
                      <img src={page.imageUrl} />
                      <span className={classnames(
                        {
                          'carousel--type__audio': page.audio && page.audio.from === 'upload',
                          'carousel--type__voice': page.audio && page.audio.from === 'record'
                        }
                      )} />
                      <div className='carousel--img-index'>{index + 1}</div>
                    </li>
                  ))
                }
              </ul>
            </div>
          </div>
          <div className={`carousel--time ${pages.length > 0 ? 'enabled-input' : ''}`}>
            音频结束后停顿
            <span className='carousel--time__num'>
              <input type='text' disabled={pages.length === 0} onChange={this.handleChangeDeadTime} className={`carousel--time__ipt ${pages.length > 0 ? 'enabled-input' : ''}`} value={pages[currentPage] ? pages[currentPage].deadTime : 0} /> s
            </span>翻页
          </div>
          <BottomComponent />
        </div>
        <Modal
          visible={modalVisible}
          onOk={this.handleDeleteUnfinishedPage}
          onCancel={this.handleModalCancel}
        >
          {modalBody}
        </Modal>
      </div>
    )
  }
}
