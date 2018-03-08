import React from 'react'
import TagBarEditer from './TagBarEditer'
import ReactPlayer from 'react-player'
import { connect } from 'react-redux'
import { globalAddTimestmap, globalDeleteTimestmap, movePage, globalSetCurrentTimeTag } from '../../../actions/courseware-action-creator'
import forEach from 'lodash/forEach'
import classnames from 'classnames'
import Modal from 'antd/lib/modal'

const MAX_PLAYBACK_RATE = 3
const MIN_PLAYBACK_RATE = 0.5
@connect(state => ({
  currentPage: state.coursewareAudioEditer.courseware.currentPage,
  currentTimeTag: state.coursewareAudioEditer.courseware.currentTimeTag,
  timepoints: state.coursewareAudioEditer.courseware.timepoints,
  identifier: state.coursewareAudioEditer.courseware.identifier
}), {
  globalAddTimestmap,
  globalDeleteTimestmap,
  movePage,
  globalSetCurrentTimeTag
})
class GlobalMultipleAudioEditer extends React.Component {
  static propTypes = {
    currentTimeTag: React.PropTypes.object,
    currentPage: React.PropTypes.number,
    globalAddTimestmap: React.PropTypes.func,
    globalDeleteTimestmap: React.PropTypes.func,
    removeAudio: React.PropTypes.func,
    audioInfo: React.PropTypes.object,
    timepoints: React.PropTypes.array,
    movePage: React.PropTypes.func,
    globalSetCurrentTimeTag: React.PropTypes.func,
    identifier: React.PropTypes.string
  }
  constructor(props) {
    super(props)
    this.state = {
      playing: false,
      duration: 0,
      currentTime: 0,
      playbackRate: parseFloat(1),
      volumeBaseWidth: 0,
      volumeBaseLeft: 0,
      volumeBarLeft: '80%',
      volume: 0.8,
      volumeIsMouseDown: false,
      confirmModalVisible: false
    }
    this.handlePlaying = this.handlePlaying.bind(this)
    this.playerOnReady = this.playerOnReady.bind(this)
    this.playerOnProgress = this.playerOnProgress.bind(this)
    this.playerOnPlay = this.playerOnPlay.bind(this)
    this.handleAddTimeTag = this.handleAddTimeTag.bind(this)
    this.handleDeleteTimeTag = this.handleDeleteTimeTag.bind(this)
    this.handleRemoveAudio = this.handleRemoveAudio.bind(this)
    this.handleUpPlaybackRate = this.handleUpPlaybackRate.bind(this)
    this.handleDownPlaybackRate = this.handleDownPlaybackRate.bind(this)
    this.handleSeekNext = this.handleSeekNext.bind(this)
    this.handleSeekPre = this.handleSeekPre.bind(this)
    this.handleChangeVolume = this.handleChangeVolume.bind(this)
    this.setVolumeIsMouseDown = this.setVolumeIsMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleToggleRemoveCofirm = this.handleToggleRemoveCofirm.bind(this)
  }

  canOperation = () => {
    const { currentPage } = this.props
    if (currentPage === 0) {
      return false
    }
    return true
  }

  componentDidMount() {
    this.setState({
      volumeBaseWidth: this.refs.volumeBase.offsetWidth,
      volumeBaseLeft: this.getBarOffset(this.refs.volumeBase)
    })
    this.props.globalAddTimestmap(this.props.currentPage, {
      startTime: 0
    })
    const newTag = {
      index: 0,
      context: 0,
      position: 0,
      left: 0,
      value: '00:00',
      sec: 0
    }
    this.props.globalSetCurrentTimeTag(newTag)
    document.addEventListener('mouseup', this.handleMouseUp)
  }
  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleMouseUp)
  }
  handleMouseUp() {
    this.setVolumeIsMouseDown(false)
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
  getPlayerRef = (ref) => {
    this.playerRef = ref
  }
  playerOnReady(e) {
    this.setState({
      duration: this.playerRef.getDuration()
    })
  }
  playerOnProgress(e) {
    const { playedSeconds, played } = e
    this.setState({
      currentTime: playedSeconds
    })
    if (played === 1) {
      this.setState({
        playing: false
      })
    }
  }
  playerOnPlay(e) {
    console.log(e)
  }
  handlePlaying() {
    this.setState(preState => {
      return {
        playing: !preState.playing
      }
    })
  }
  handleAddTimeTag() {
    if (!this.canOperation()) return
    const currSec = this.props.currentTimeTag.sec * 1000
    this.props.globalAddTimestmap(this.props.currentPage, {
      startTime: this.props.currentTimeTag.sec * 1000
    })

    setTimeout(() => {
      forEach(this.props.timepoints, (t, i) => {
        if (currSec === t.startTime && this.props.currentPage !== i) {
          this.props.movePage(this.props.currentPage, i)
        }
      })
    })
  }
  handleDeleteTimeTag() {
    if (!this.canOperation()) return
    this.props.globalDeleteTimestmap(this.props.currentPage)
  }
  handleToggleRemoveCofirm() {
    this.setState({
      confirmModalVisible: !this.state.confirmModalVisible
    })
  }
  handleRemoveAudio() {
    this.props.removeAudio()
  }
  handleUpPlaybackRate() {
    this.setState(preState => {
      let playbackRate = preState.playbackRate + 0.5
      if (playbackRate > MAX_PLAYBACK_RATE) {
        return {
          ...preState
        }
      } else {
        return {
          playbackRate: parseFloat(playbackRate)
        }
      }
    })
  }
  handleDownPlaybackRate() {
    this.setState(preState => {
      let playbackRate = preState.playbackRate - 0.5
      if (playbackRate < MIN_PLAYBACK_RATE) {
        return {
          ...preState
        }
      } else {
        return {
          playbackRate: parseFloat(playbackRate)
        }
      }
    })
  }
  handleSeekNext() {
    const duration = this.state.duration
    const currentTime = this.playerRef.getCurrentTime()
    let nextTime = currentTime + 1.0
    if (nextTime > duration) {
      nextTime = duration
    }
    this.setState({
      currentTime: nextTime
    })
    this.playerRef.seekTo(nextTime)
  }
  handleSeekPre() {
    const currentTime = this.playerRef.getCurrentTime()
    let preTime = currentTime - 1.0
    if (preTime < 0) {
      preTime = 0
    }
    this.setState({
      currentTime: preTime
    })
    this.playerRef.seekTo(preTime)
  }
  setVolumeIsMouseDown(val) {
    if (val) {
      document.addEventListener('mousemove', this.handleChangeVolume)
    } else {
      document.removeEventListener('mousemove', this.handleChangeVolume)
    }
    this.setState({
      volumeIsMouseDown: val
    })
  }
  handleChangeVolume(e) {
    if (!this.state.volumeIsMouseDown && e.type !== 'click') return false
    const posX = e.clientX - this.state.volumeBaseLeft
    const sum = this.state.volumeBaseWidth
    const position = parseFloat(posX / sum, 10).toFixed(2)
    const left = `${position * 100}%`
    if (position < 0 || position > 1) return false
    this.setState({
      volumeBarLeft: left,
      volume: position
    })
  }
  render() {
    const { audioInfo, identifier } = this.props
    const {
      playing,
      playbackRate,
      volumeBarLeft,
      volume,
      confirmModalVisible
    } = this.state
    return (
      <div className='ac-ui-tab__item-box'>
        {identifier ? null : <a className='ac-ui-button ac-ui-button--delete' onClick={this.handleToggleRemoveCofirm}>删除音频</a>}
        <div className='aut__audio-wrap'>
          <div className='aut__audio-top'>
            <span className='aut__audio-title'>{`${identifier ? '' : '编辑音频：'}`}{audioInfo.name}</span>
            <TagBarEditer addTimestmp={this.handleAddTimeTag} {...this.props} {...this.state} player={this.playerRef} canOperation={this.canOperation} />
          </div>
        </div>
        <div className='aut__audio-btn-wrap'>
          {!identifier ? <span className='aut__audio-btn-left'>
            <a className='ac-ui-button-add-delete aubad--add' onClick={this.handleAddTimeTag}>
              <i className='ac-ui-icon' />
              <span className='aubad-txt'>添加时间标签</span>
            </a>
            <a className='ac-ui-button-add-delete aubad--delete' onClick={this.handleDeleteTimeTag}>
              <i className='ac-ui-icon' />
              <span className='aubad-txt'>删除时间标签</span>
            </a>
            <span className='ac-ui-input-wrap'>
              <span className='ac-ui-input-txt '>速度调节：</span>
              <span className='ac-ui-input '>
                <input type='text' value={playbackRate} />
                <i className='aui-top-btn' onClick={this.handleUpPlaybackRate} />
                <i className='aui-bottom-btn' onClick={this.handleDownPlaybackRate} />
              </span>
            </span>
          </span> : null}
          <span className='ac-ui-audio-button-wrap'>
            <a className='ac-ui-audio-button ac-ui-audio-button--before' onClick={this.handleSeekPre} />
            <a className={classnames(
              'ac-ui-audio-button ac-ui-audio-button--center',
              {
                'ac-ui-audio-button--suspend': playing
              }
            )} onClick={this.handlePlaying} />
            <a className='ac-ui-audio-button ac-ui-audio-button--after' onClick={this.handleSeekNext} />
          </span>
          <span className='ac-ui-volume'>
            <a className='ac-ui-button-icon aubi-volume' />
            <span ref='volumeBase' className='ac-ui-volume__base' onClick={this.handleChangeVolume}>
              <span ref='volumeBar' className='ac-ui-volume__bar' style={{ width: volumeBarLeft }} />
              <i ref='volumeBtn' className='ac-ui-volume__btn' onMouseUp={() => { this.setVolumeIsMouseDown(false) }} onMouseDown={() => this.setVolumeIsMouseDown(true)} style={{ left: volumeBarLeft }} />
            </span>
          </span>
        </div>
        <ReactPlayer
          ref={this.getPlayerRef}
          className='react-player'
          width='0%'
          height='0%'
          // url={audioInfo.url}
          url={audioInfo.url}
          playing={playing}
          // loop={loop}
          playbackRate={playbackRate}
          volume={volume}
          // muted={muted}
          // soundcloudConfig={soundcloudConfig}
          // vimeoConfig={vimeoConfig}
          // youtubeConfig={youtubeConfig}
          // fileConfig={fileConfig}
          onReady={this.playerOnReady}
          // onEnded={this.onPlayEnded}
          // onDuration={this.onDuration}
          // onStart={() => console.log('onStart')}
          onPlay={this.playerOnPlay}
          // onPause={this.onPause}
          // onBuffer={() => console.log('onBuffer')}
          // onSeek={e => console.log('onSeek', e)}
          // onError={e => console.log('onError', e)}
          onProgress={this.playerOnProgress}
        />
        <Modal ref='modal'
          visible={confirmModalVisible}
          wrapClassName='ac-fish-pop ac-pop-save3'
          width='600px'
          title='删除音频'
          onCancel={this.handleToggleRemoveCofirm}
          onOk={this.handleRemoveAudio}>
          <div className='ac-ui-pop__body'>
            <p className='ac-ui-pop__body-txt'>
              确定删除已上传的音频吗？
              </p>
          </div>
        </Modal>
      </div>
    )
  }
}

export default GlobalMultipleAudioEditer
