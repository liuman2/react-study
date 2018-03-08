import { encodeToWav } from './wav-encoder-service'

export class AudioRecorder {
  constructor(sourceNode, scriptNode, audioContext) {
    this.audioContext = audioContext
    this.scriptNode = scriptNode
    this.sourceNode = sourceNode
    this.isRecording = false
    this.buffers = []
    this._auditioning = false
    this._hasInitProcess = false
    this.onAudioDurationChange = undefined
  }
    /**
     * 添加录音监听
     * @param {Function(this, duration)} onaudiodurationchange 监听
     */
  addAudioProcessListener(onaudiodurationchange) {
    this.onAudioDurationChange = onaudiodurationchange
  }

  /**
   * 从缓冲区中读出所有音频数据
   * @return {Array<Number>} 音频数据
   */
  _getAudioData() {
    const buffers = this.buffers
    let audioData = new Float32Array(4096 * buffers.length)
    let offset = 0
    buffers.forEach(arr => {
      const arrLength = arr.length
      for (let i = 0; i < arrLength; i++) {
        audioData[offset] = arr[i]
        offset = offset + 1
      }
    })

    return audioData
  }

  /**
   * 开始录音
   * @return {Object} 实例自身
   */
  start() {
    const { sourceNode, scriptNode } = this
    this.isRecording = true
    sourceNode.connect(this.scriptNode)
    scriptNode.connect(this.audioContext.destination)

    if (!this._hasInitProcess) {
      // 录音监听
      scriptNode.onaudioprocess = event => {
        if (!this.isRecording) return
        // 用解构赋值生成新的数组，再push
        this.buffers.push([...event.inputBuffer.getChannelData(0)])
        if (this.onAudioDurationChange) {
          this.onAudioDurationChange(this, this.duration())
        }
      }

      this._hasInitProcess = true
    }

    return this
  }

  /**
   * 继续录音
   * @return {Object} 实例自身
   */
  continue() {
    return this.start()
  }

  /**
   * 暂停录音
   * @return {Object} 实例自身
   */
  pause() {
    // this.scriptNode.disconnect(this.audioContext.destination)
    this.isRecording = false
    return this
  }

  /**
   * 试听
   * @return {Object} 自身
   */
  audition() {
    this.pause()
    const self = this
    const { audioContext } = this
    const audioData = this._getAudioData()

    // 试听录音
    const audioBuffer = audioContext.createBuffer(1, audioData.length, audioContext.sampleRate)

    const bufferSource = audioContext.createBufferSource()

    audioBuffer.getChannelData(0).set(audioData)

    bufferSource.buffer = audioBuffer
    bufferSource.connect(audioContext.destination)
    bufferSource.start()
    // 正在试听
    this._auditioning = true
    bufferSource.onended = function () {
      self._auditioning = false
    }

    return this
  }

  /**
   * 重录
   * @return {Object} 实例自身
   */
  rerecording() {
    this.buffers.length = 0
    return this.start()
  }

  /**
   * 结束录音， 并将音频文件上传到 CS
   * @return {Promise} 上传Promise
   */
  done() {
    this.pause()
    const audioData = this._getAudioData()
    const audioBlob = encodeToWav(audioData, {
      sampleRate: this.audioContext.sampleRate,
      sampleBits: 16
    })
    this.buffers.length = 0
    return audioBlob
  }

  /**
   * 关闭录音
   */
  close() {
    this.buffers.length = 0
    if (this.audioContext.state !== 'closed') {
      return this.audioContext.close()
    }
  }

  duration() {
    const { audioContext } = this
    return (4096 * this.buffers.length) / audioContext.sampleRate
  }
}
