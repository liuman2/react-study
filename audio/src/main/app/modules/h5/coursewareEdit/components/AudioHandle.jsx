import React, { Component } from 'react'
import {connect} from 'react-redux'
import ReactPlayer from 'react-player'
import classnames from 'classnames'
import DeleteBtn from './DeleteBtn'
import { playAudio } from 'modules/courseware-audio-editer/actions/courseware-action-creator'

let playTimer
@connect(state => ({
  pages: state.coursewareAudioEditer.courseware.pages,
  currentPage: state.coursewareAudioEditer.courseware.currentPage,
  playing: state.coursewareAudioEditer.courseware.playing
}), {
  playAudio
})
export default class AudioHandle extends Component {
  static propTypes = {
    pages: React.PropTypes.array,
    currentPage: React.PropTypes.number,
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
  handlePlayAudio = () => {
    const { pages, currentPage, playing } = this.props
    const currAudio = pages[currentPage].audio
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
    }, currAudio.duration)
  }
  render() {
    const { pages, currentPage, playing } = this.props
    const audioInfo = pages[currentPage].audio

    // const {
    //   playing
    //   audioInfo
    // } = this.state
    return (
      <div className='upload--recording'>
        <div className='upload--recording__info'>
          <a className='upload--file__audio'>
            <span className='upload--file__name'>{audioInfo.name}</span>
            <span className='upload--file__time'>{this.secToMin(audioInfo.duration / 1000)}</span>
          </a>
        </div>
        <ul className='upload--btn__list'>
          <li className='upload--btn__cell'>
            <a
              className={classnames(
                'ui-btn ui-btn__circle',
                {
                  'type-play': !playing,
                  'type-pause': playing
                }
              )}
              onClick={this.handlePlayAudio} />
            <p className='upload--btn__name'>试听</p>
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
