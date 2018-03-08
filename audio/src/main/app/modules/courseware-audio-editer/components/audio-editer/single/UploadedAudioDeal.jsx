import React, { PropTypes } from 'react'
import {connect} from 'react-redux'
import ReactPlayer from 'react-player'
import classnames from 'classnames'
import { formatHHMMSS } from 'app/utils/format-time'
import Modal from 'antd/lib/modal'
import RemoveAudio from './RemoveAudio'
import { playAudio } from '../../../actions/courseware-action-creator'

/**
 * 音频处理 (上传的音频)
 */
@connect(state => {
  const {playing: isPlaying, currentPage} = state.coursewareAudioEditer.courseware
  return {
    isPlaying,
    currentPage
  }
}, {
  playAudio
})
class UploadedAudioDeal extends RemoveAudio {
  static propTypes = {
    audioInfo: PropTypes.object,
    currentPage: PropTypes.number, // 当前编辑页
    isPlaying: React.PropTypes.bool,
    playAudio: React.PropTypes.func,
    identifier: React.string
  }

  constructor(props) {
    super(props)
    this.state = {
      playing: undefined, // disabled or play or pause
      // playended: false, // play ended
      playended: {},
      duration: 0 // 时长
    }
  }

  controlPlay = () => {
    const { playended } = this.state
    const { isPlaying, currentPage } = this.props
    if (isPlaying === undefined) { // unready
      return
    }

    playended[currentPage] = false

    this.props.playAudio(!isPlaying)
    this.setState({
      playing: !isPlaying,
      playended: playended
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
    const { playended } = this.state
    const { currentPage } = this.props
    playended[currentPage] = true
    this.setState({
      playing: false,
      playended: playended
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

  render() {
    const { audioInfo, currentPage, isPlaying, identifier } = this.props
    const { playended, duration, confirmModalVisible } = this.state
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
            确定删除已上传的音频吗？
            </p>
        </div>
      </Modal>
      {identifier ? null : <a className='ac-ui-button ac-ui-button--delete' onClick={this.clickRemoveAudio} >{identifier}删除音频</a>}
      {/* <!-- ac-ui-button不可点击加类名ac-ui-button--disabled --> */}
      <div className='aut__audio-wrap'>
        <div className='ac-ui-tab__message-con'>
          <i className='ac-ui-icon ac-ui-icon-mp3' />
          <span className='ac-ui-tab__message-txt'>
            {audioInfo.name}
          </span>
          <span className='ac-ui-tab__message-txt'>
            {formatHHMMSS(duration)}
          </span>
        </div>
      </div>
      <div className='aut__audio-btn-wrap'>
        <a className={classnames(
          'ac-ui-button-left-right',
          {
            'aublr--disabled': isPlaying === undefined,
            'aublr-start': !playended[currentPage] && !isPlaying,
            'aublr-pause': !playended[currentPage] && isPlaying,
            'aublr-restart': playended[currentPage]
          }
        )} onClick={this.controlPlay} >
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>{isPlaying ? '暂停' : '试听'}</span>
          <ReactPlayer
            ref={this.ref}
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
            onStart={() => console.log('onStart')}
            onPlay={this.onPlay}
            onPause={this.onPause}
            onBuffer={() => console.log('onBuffer')}
            onSeek={e => console.log('onSeek', e)}
            onError={e => console.log('onError', e)}
            onProgress={this.onProgress}
          />
        </a>
        {/* <!-- ac-ui-button-left-right加类aublr--active表示选中,加类aublr--disabled表示按钮不可用 --> */}
      </div>
    </div>
  }
}

export default UploadedAudioDeal
