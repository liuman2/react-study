import React, { PropTypes } from 'react'
import {connect} from 'react-redux'
import ReactPlayer from 'react-player'
import Modal from 'antd/lib/modal'
import RemoveAudio from './RemoveAudio'
import { formatHHMMSS } from 'app/utils/format-time'
import { playAudio } from '../../../actions/courseware-action-creator'

/**
 * 结束录音:完成音频录制
 */
@connect(state => {
  const {playing: isPlaying, currentPage, identifier} = state.coursewareAudioEditer.courseware
  return {
    isPlaying,
    currentPage
  }
}, {
  playAudio
})
class RecordedAudioDeal extends RemoveAudio {
  static propTypes = {
    audioInfo: PropTypes.object,
    openRecord: PropTypes.func,
    currentPage: PropTypes.number,
    isPlaying: React.PropTypes.bool,
    playAudio: React.PropTypes.func,
    identifier: React.PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      playing: undefined, // disabled or play or pause
      playended: false, // play ended
      duration: 0 // 时长
    }
  }

  controlPlay = () => {
    const { playing } = this.state
    const { isPlaying, currentPage } = this.props
    if (isPlaying === undefined) { // unready
      return
    }

    this.props.playAudio(!isPlaying)
    this.setState({
      playing: !playing,
      playended: false
    })
  }

  onDuration = duration => {
    console.log('onDuration')
    this.setState({
      duration: duration
    })
  }

  onPlayEnded = () => {
    console.log('onPlayEnded')
    this.setState({
      playing: false,
      playended: true
    })
    this.props.playAudio(false)
  }

  onReady = () => {
    console.log('onReady')
    const { playing } = this.state
    if (playing === undefined) {
      this.setState({
        playing: false
      })
    }
  }

  clickRerecord = () => {
    const { removeAudio, openRecord } = this.props
    removeAudio()
    openRecord()
  }

  render() {
    const { audioInfo, isPlaying, identifier } = this.props
    const { duration, confirmModalVisible } = this.state
    return <div className='ac-ui-tab__item-box'>
      <Modal ref='modal'
        visible={confirmModalVisible}
        wrapClassName='ac-fish-pop ac-pop-save3'
        width='600px'
        title='删除音频'
        onCancel={this.handleModalCancel}
        onOk={this.confirmRemove}>
        <div className='ac-ui-pop__body'>
          <p className='ac-ui-pop__body-txt'>
            确定删除已录制的音频吗？
            </p>
        </div>
      </Modal>
      {identifier ? null : <a className='ac-ui-button ac-ui-button--delete' onClick={this.clickRemoveAudio}>删除音频</a>}
      {/* <!-- ac-ui-button不可点击加类名ac-ui-button--disabled --> */}
      <div className='aut__audio-wrap'>
        <div className='ac-ui-tab__message-con'>
          <span className='ac-ui-tab__dialog-box' onClick={this.controlPlay}>
            <i className={`ac-ui-icon ac-ui-icon-wifi ${isPlaying ? 'ac-ui-icon-wifi--playing' : ''}`} />
            <span className='aut__dialog-time'>
              {formatHHMMSS(duration)}
            </span>
            <ReactPlayer
              className='react-player'
              width='0%'
              height='0%'
              url={audioInfo.url}
              // url='http://www.sample-videos.com/audio/mp3/crowd-cheering.mp3'
              playing={isPlaying}
              // loop={loop}
              // playbackRate={playbackRate}
              // volume={volume}
              // muted={muted}
              // soundcloudConfig={soundcloudConfig}
              // vimeoConfig={vimeoConfig}
              // youtubeConfig={youtubeConfig}
              // fileConfig={fileConfig}
              onReady={this.onReady}
              onEnded={this.onPlayEnded}
              onDuration={this.onDuration}
              onStart={() => { console.log('onStart') }}
              onPlay={this.onPlay}
              onPause={this.onPause}
              onBuffer={() => { console.log('onBuffer') }}
              onSeek={e => { console.log('onSeek', e) }}
              onError={e => { console.log('onError', e) }}
              onProgress={this.onProgress}
            />
          </span>
        </div>
      </div>
      {identifier ? null : <div className='aut__audio-btn-wrap'>
        <a className='ac-ui-button-left-right aublr-restart' onClick={this.clickRerecord} >
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>重新录音</span>
        </a>
        {/* <!-- ac-ui-button-left-right加类aublr--active表示选中,加类aublr--disabled表示按钮不可用 --> */}
      </div>}
    </div>
  }
}

export default RecordedAudioDeal
