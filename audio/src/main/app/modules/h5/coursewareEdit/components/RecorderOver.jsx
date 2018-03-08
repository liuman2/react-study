import React, { Component } from 'react'
import {connect} from 'react-redux'
import ReactPlayer from 'react-player'
import { h5BottomTypeSet, removeAudio, playAudio } from 'modules/courseware-audio-editer/actions/courseware-action-creator'
import DeleteBtn from './DeleteBtn'

let playTimer

@connect(state => ({
  pages: state.coursewareAudioEditer.courseware.pages,
  currentPage: state.coursewareAudioEditer.courseware.currentPage,
  playing: state.coursewareAudioEditer.courseware.playing
}), {
  h5BottomTypeSet,
  removeAudio,
  playAudio
})
export default class RecorderOver extends Component {
  static propTypes = {
    h5BottomTypeSet: React.PropTypes.func,
    pages: React.PropTypes.array,
    currentPage: React.PropTypes.number,
    removeAudio: React.PropTypes.func,
    playing: React.PropTypes.bool,
    playAudio: React.PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      playing: false,
      audioInfo: {}
    }
  }
  componentDidMount() {
    const { pages, currentPage } = this.props
    const currAudio = pages[currentPage].audio
    this.setState({
      audioInfo: currAudio
    })
  }
  secToMin(sec) {
    let _min = Math.floor(sec / 60)
    let _sec = (sec % 60).toFixed(0)

    if (_min < 10) {
      _min = `0${_min}`
    }
    if (_sec < 10) {
      _sec = `0${_sec}`
    }

    return `${_min}'${_sec}''`
  }
  handleChangeType = (type) => {
    this.props.h5BottomTypeSet(type)
  }
  handlePlayAudio = () => {
    const { playing } = this.props
    this.setState({
      playing: !this.state.playing
    })
    this.props.playAudio(!playing)
    if (playTimer) playTimer = null
    playTimer = setTimeout(() => {
      this.setState({
        playing: false
      })
      this.props.playAudio(false)
    }, this.state.audioInfo.duration)
  }
  handleRerecord = () => {
    this.props.removeAudio()
    this.handleChangeType(1)
  }
  render() {
    // const {
    //   audioInfo
    // } = this.state
    const { pages, currentPage, playing } = this.props
    const audioInfo = pages[currentPage].audio
    return (
      <div className='upload--recording'>
        <div className='upload--recording__info' onClick={this.handlePlayAudio}>
          <a className={`recording--voice ${playing ? 'playing' : ''}`}>{this.secToMin(audioInfo.duration / 1000)}</a>
        </div>
        <ul className='upload--btn__list'>
          <li className='upload--btn__cell' onClick={this.handleRerecord}>
            <a className='ui-btn ui-btn__circle type-reset' />
            <p className='upload--btn__name'>重新录音</p>
          </li>
        </ul>
        <DeleteBtn />
        <ReactPlayer
          ref={this.ref}
          className='react-player'
          width='0%'
          height='0%'
          url={audioInfo.url}
          // url='http://www.sample-videos.com/audio/mp3/crowd-cheering.mp3'
          playing={playing}
          />
      </div>
    )
  }
}
