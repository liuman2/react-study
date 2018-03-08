/*
 * 波形参考： https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L128-L205
 * 音频文件格式生成参考：http://blog.csdn.net/bzhou0125/article/details/46444201
 */
import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import { AudioRecorder } from './audio-recorder'

// 缓冲区大小
const BUFFER_SIZE = 4096
// 输入频道数
const INPUT_CHANNELS_NUM = 1
// 输入频道数
const OUPUT_CHANNELS_NUM = 1

const promisifiedOldGUM = function (constraints) {
  // First get ahold of getUserMedia, if present
  const getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia)

  // Some browsers just don't implement it - return a rejected promise with an error
  // to keep a consistent interface
  if (!getUserMedia) {
    return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
  }

  // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
  return new Promise(function (resolve, reject) {
    getUserMedia.call(navigator, constraints, resolve, reject)
  })
}

// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {}
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = promisifiedOldGUM
}

// Prefer camera resolution nearest to 1280x720.

const getUserMediaSupport = navigator.mediaDevices.getUserMedia
const audioContextSupport = window.AudioContext || window.webkitAudioContext
export class AudioRecorderFactory {
  constructor(audioElement) {
    if (!getUserMediaSupport || !audioContextSupport || !!window.navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      this.noSupport = true
    } else {
      // 初始化音频上下文、记录器
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()
      this.audioElement = audioElement || window.document.createElement('audio')
    }
  }

  /**
  * 组装录音实例
  * @return {Promise} 返回一个Promise, onFulfill 参数为一个 AudioRecorder 实例
  */
  assemble() {
    const self = this
    const constraints = {
      audio: true
    }
    if (!this.noSupport) {
      return navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
        const audioContext = self.audioContext
        const sourceNode = audioContext.createMediaStreamSource(mediaStream)
        const scriptNode = audioContext.createScriptProcessor(BUFFER_SIZE, INPUT_CHANNELS_NUM, OUPUT_CHANNELS_NUM)
        return new AudioRecorder(sourceNode, scriptNode, audioContext)
      }, function (error) {
        const { name } = error
        let errorMessage
        switch (name) {
          // 用户拒绝
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            errorMessage = '用户已禁止网页调用录音设备'
            break
          // 没接入录音设备
          case 'NotFoundError':
          case 'DevicesNotFoundError':
            errorMessage = '录音设备未找到'
            break
          // 其它错误
          case 'NotSupportedError':
            errorMessage = '不支持录音功能'
            break
          case 'NotReadableError':
          case 'TrackStartError':
            errorMessage = '当前麦克风进程受限'
            break
          case 'OverconstrainedError':
          case 'ConstraintNotSatisfiedErrror':
            errorMessage = '约束无法满足'
            break
          case 'TypeError':
            errorMessage = '约束对象为空'
            break
          default:
            errorMessage = '录音调用错误'
            window.console.log(error)
        }
        return errorMessage
      })
    } else {
      // 不支持提示
      return Promise.reject(new Error('浏览器不支持录音'))
    }
  }
}
