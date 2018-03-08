import React, { Component } from 'react'
import { connect } from 'react-redux'
import { globalSetCurrentTimeTag, goPage } from '../../../actions/courseware-action-creator'
import classnames from 'classnames'
import isUndefined from 'lodash/isUndefined'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import SliderElement from 'utils/slider-element'

@connect(state => ({
  currentPage: state.coursewareAudioEditer.courseware.currentPage,
  timepoints: state.coursewareAudioEditer.courseware.timepoints,
  currentTimeTag: state.coursewareAudioEditer.courseware.currentTimeTag,
  identifier: state.coursewareAudioEditer.courseware.identifier
}), {
  globalSetCurrentTimeTag,
  goPage
})
export default class TagBarEditer extends Component {
  static propTypes = {
    duration: React.PropTypes.number,
    currentTime: React.PropTypes.number,
    currentPage: React.PropTypes.number,
    timepoints: React.PropTypes.array,
    globalSetCurrentTimeTag: React.PropTypes.func,
    currentTimeTag: React.PropTypes.object,
    addTimestmp: React.PropTypes.func,
    goPage: React.PropTypes.func,
    canOperation: React.PropTypes.func.isRequired,
    identifier: React.PropTypes.string
  }
  constructor(props) {
    super(props)
    this.state = {
      barWidth: 0,
      barLeft: 0,
      currSec: 0,
      currPos: 0,
      pointCount: 0,
      sliderElement: null,
      isMoving: false
    }
    this.handleClickBar = this.handleClickBar.bind(this)
    this.getTimePoint = this.getTimePoint.bind(this)
    this.handleDoubleClickBar = this.handleDoubleClickBar.bind(this)
    this.handleChangeTime = this.handleChangeTime.bind(this)
    this.handleSetCurrentTimeTag = this.handleSetCurrentTimeTag.bind(this)
    this.setCurrTimeTag = this.setCurrTimeTag.bind(this)
  }

  componentDidMount() {
    const sliderOpt = new SliderElement(this.refs.barBase, [this.refs.timepoint], {
      onMove: (data) => {
        if (!this.props.canOperation()) return
        if (this.props.identifier) return
        if (!this.state.isMoving) this.setState({ isMoving: true })
        const { event, target, left } = data
        if (left) {
          this.setCurrTimeTag(event)
          target[this.props.currentPage].style.left = left
        }
      },
      onUp: (data) => {
        if (this.state.isMoving) {
          this.props.addTimestmp()
          this.setState({ isMoving: false })
        }
      }
    })
    this.setState({
      barWidth: this.refs.barBase.offsetWidth,
      barLeft: this.getBarOffset(this.refs.barBase),
      sliderElement: sliderOpt
    })
  }
  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.timepoints, this.props.timepoints) && this.state.sliderElement) {
      let targetArr = []
      this.props.timepoints.map((p, i) => {
        const ref = this.refs[`timepoint-${i}`]
        if (ref) targetArr.push(ref)
      })
      this.state.sliderElement.setTarget(targetArr)
      console.log(targetArr)
    }
  }
  minToSec(min) {
    const timeArr = min.split(':')
    const _min = parseInt(timeArr[0], 10)
    const _sec = parseInt(timeArr[1], 10)

    return _min * 60 + _sec
  }
  secToMin(sec) {
    let _min = Math.floor(sec / 60)
    let _sec = (sec % 60).toFixed(0)
    if (_min <= 0) {
      _min = 0
    }

    if (_sec <= 0) {
      _sec = 0
    }

    if (_min < 10) {
      _min = `0${_min}`
    }
    if (_sec < 10) {
      _sec = `0${_sec}`
    }

    return `${_min}:${_sec}`
  }
  getCurrentProgress(now, sum) {
    return `${(now / sum) * 100}%`
  }
  getBarOffset(element) {
    let elementLeft = element.offsetLeft
    let parent = element.offsetParent

    while (parent !== null) {
      elementLeft += parent.offsetLeft
      parent = parent.offsetParent
    }

    return elementLeft
  }
  secToLeft(sec) {
    const left = (sec / (this.props.duration * 1000)) * 100
    return `${left}%`
  }
  getTimePoint(e) {
    const currPage = this.props.currentPage
    const sum = this.state.barWidth
    const posX = e.clientX - this.state.barLeft
    let position = posX / sum
    if (position < 0) {
      position = 0
    } else if (position > 1) {
      position = 1
    }
    const currSec = this.props.duration * position
    const left = `${position * 100}%`
    const newTag = {
      index: currPage,
      context: currPage + 1,
      position: position,
      left: left,
      value: this.secToMin(currSec),
      sec: currSec
    }
    return newTag
  }
  handleClickPoint(e, index) {
    e.stopPropagation()
    this.props.goPage(index)
    this.setCurrTimeTag(e)
  }
  setCurrTimeTag(e) {
    if (!this.props.canOperation()) return
    if (this.props.identifier) return
    const newTag = this.getTimePoint(e)
    this.props.globalSetCurrentTimeTag(newTag)
  }
  handleDoubleClickBar(e) {
    if (!this.props.canOperation()) return
    if (this.props.identifier) return
    if (e.target !== this.refs.barBase && e.target !== this.refs.barProgress && e.target !== this.refs.barInput) {
      return
    }
    this.props.addTimestmp()
  }
  handleClickBar(e) {
    if (e.target !== this.refs.barBase && e.target !== this.refs.barProgress) {
      return
    }
    this.setCurrTimeTag(e)
  }
  handleChangeTime(e, tag) {
    e.stopPropagation()
    const value = e.target.value
    this.props.globalSetCurrentTimeTag({ value: value })
  }
  handleSetCurrentTimeTag(e) {
    e.stopPropagation()
    if (e.keyCode !== 13 && e.type !== 'blur') return false
    const re = /^\d\d:\d\d$/g
    const value = e.target.value
    if (re.test(value)) {
      const _sec = this.minToSec(value)
      if (_sec > this.props.duration || _sec < 0) return false
      this.props.globalSetCurrentTimeTag({
        left: this.secToLeft(_sec * 1000),
        sec: _sec
      })
    }
  }
  render() {
    const {
      duration,
      currentTime,
      currentTimeTag,
      timepoints,
      currentPage,
      identifier
    } = this.props
    return (
      <div className='ac-ui-edit'>
        <span className='ac-ui-edit__time ac-ui-edit__time--start'>{this.props.duration ? this.secToMin(this.props.currentTime) : '00:00'}</span>
        <span ref='barBase' className='ac-ui-edit__base' onDoubleClick={this.handleDoubleClickBar} onClick={this.handleClickBar} style={{ cursor: 'pointer', height: '4px' }}>
          <span ref='barProgress' className='ac-ui-edit__bar' style={{ width: this.getCurrentProgress(currentTime, duration) }} />
          {
            !isEmpty(currentTimeTag) ? <span key={currentTimeTag.index} className='ac-ui-edit__message ac-ui-edit__message--active' style={{ left: currentTimeTag.left }}>
              <span className='ac-ui-input' ref='barInput'>
                <input type='text' disabled={!!identifier} onBlur={this.handleSetCurrentTimeTag} onKeyUp={this.handleSetCurrentTimeTag} value={currentTimeTag.value} onChange={(e) => { this.handleChangeTime(e, currentTimeTag) }} />
              </span>
            </span> : null
          }
          {
            timepoints.map((tag, index) => {
              const tagElement = !isUndefined(tag.startTime) ? <span ref={`timepoint-${index}`} onMouseDown={(e) => { this.handleClickPoint(e, index) }} key={index} className={classnames(
                'ac-ui-edit__message',
                {
                  'ac-ui-edit__message--active': index === currentPage
                }
              )} style={{ left: this.secToLeft(tag.startTime) }}>
                <span className='ac-ui-edit__index'>
                  {index + 1}
                </span>
              </span> : null
              return tagElement
            })
          }
        </span>
        <span className='ac-ui-edit__time ac-ui-edit__time--end'>{this.props.duration ? this.secToMin(this.props.duration) : '00:00'}</span>
      </div>
    )
  }
}
