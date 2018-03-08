import React from 'react'
import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'
import noop from 'lodash/noop'
import Toast from 'components/toast'

import { AudioRecorderFactory } from 'app/modules/courseware-audio-editer/services/audio-recorder/audio-recorder-factory'
import { AudioRecorder } from 'app/modules/courseware-audio-editer/services/audio-recorder/audio-recorder'

class Recorder extends React.Component {
  recorderInstance = null
  constructor(props) {
    super(props)
    this.state = {
      mediaInit: false,
      recordering: false,
      duration: 0
    }
  }

  componentWillUnmount() {
    this.close()
  }

  initRecorder() {
    if (this.state.mediaInit) return Promise.resolve()
    const audioRecorderFactory = new AudioRecorderFactory()
    if (audioRecorderFactory.noSupport) {
      Toast('不支持录音功能')
      return Promise.reject(new Error('不支持录音功能'))
    }
    return audioRecorderFactory.assemble().then((ret) => {
      if (isString(ret)) {
        // TODO: 提示错误
        Toast(ret)
        return Promise.reject(new Error(ret))
      } else if (ret instanceof AudioRecorder) {
        // 初始化完成， 开始录音
        this.recorderInstance = ret
        this.recorderInstance.addAudioProcessListener(this.onAudioDurationChange)
        this.setState({
          mediaInit: true
        })
      }
      return Promise.resolve()
    })
  }
  _recorderInstanceInvoker(methodName, after = noop, ...args) {
    const recorderInstance = this.recorderInstance
    if (recorderInstance && isFunction(recorderInstance.pause)) {
      const returnValue = recorderInstance[methodName].apply(recorderInstance, args)
      after()
      return returnValue
    }
  }
  /**
   * 录音监听
   */
  onAudioDurationChange = (recorderInstance, duration) => {
    console.log('duration=' + duration)
    this.setState({
      duration: duration
    })

    if (duration > 120) {
      this.setState({
        recorderState: 'end'
      })
      this.handleRecordEnd()
    }
  }

  /**
   * 开始录音
   * @return {undefined} 无
   */
  start = () => this._recorderInstanceInvoker('start', () => {
    this.setState({ recordering: true })
  })

  /**
   * 暂停
   * @return {undefined} 无
   */
  pause = () => this._recorderInstanceInvoker('pause', () => this.setState({ recordering: false }))

  /**
   * 结束录音
   * @return {undefined} 无
   */
  done = () => this._recorderInstanceInvoker('done', () => this.setState({ recordering: false }))

  /**
   * 播放录音（即试听）
   * @return {undefined} 无
   */
  play = () => this._recorderInstanceInvoker('audition')

  /**
   * 重新录音
   * @return {undefined} 无
   */
  rerecording = () => this._recorderInstanceInvoker('rerecording', () => this.setState({ recordering: true }))

  /**
   * 继续录音
   * @return {undefined} 无
   */
  continue = () => this._recorderInstanceInvoker('continue', () => this.setState({ recordering: true }))

  /**
   * 关闭音频环境
   * @return {undefined} 无
   */
  close = () => this._recorderInstanceInvoker('close')

  getDuration = () => this.recorderInstance.duration()
}

export default Recorder
