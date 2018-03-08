import React from 'react'
import Recorder from './Recorder'
import classnames from 'classnames'
import Modal from 'antd/lib/modal'
import Button from 'antd/lib/button'
import Select from 'antd/lib/select'

const RECORD_TIME = 5000
const VOLUME_MAX = 100000
const Option = Select.Option

class RecorderDetector extends Recorder {
  static propsTypes = {
    isOpen: React.PropTypes.bool,
    handleCloseRecorderMoadl: React.PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      status: 'init',
      modalVisiable: false,
      playProgress: 0,
      recorderProgress: 0,
      volumeSize: 0
    }
    this.handleStart = this.handleStart.bind(this)
    this.handlePause = this.handlePause.bind(this)
    this.handlePlay = this.handlePlay.bind(this)
    this.handlePlayDone = this.handlePlayDone.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)
    this.handleYes = this.handleYes.bind(this)
    this.handleNo = this.handleNo.bind(this)
    this.setPlayProgress = this.setPlayProgress.bind(this)
    this.setRecordProgress = this.setRecordProgress.bind(this)
    this.changeRecorderStatu = this.changeRecorderStatu.bind(this)
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.isOpen) {
      this.handleClose()
      this.setState({
        mediaInit: false
      })
    } else {
      this.handleInit()
    }
  }
  componentDidMount() {
    this.handleInit()
  }
  getVoiceSize(analyser) {
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)
    const data = dataArray.slice(100, 1000)
    const sum = data.reduce((a, b) => a + b)
    return sum
  }
  changeRecorderStatu(status) {
    this.setState({
      status: status
    })
  }
  setPlayProgress() {
    let count = 1000
    const progressTimer = setInterval(() => {
      if (count >= RECORD_TIME) {
        clearInterval(progressTimer)
      }
      const progress = `${count / RECORD_TIME * 100}%`
      this.setState({
        playProgress: progress
      })
      count += 1000
    }, 1000)
  }
  setRecordProgress(currDurction) {
    const progress = `${currDurction * 1000 / RECORD_TIME * 100}%`
    this.setState({
      recorderProgress: progress
    })
  }
  handleInit() {
    let analyser
    this.initRecorder()
    .then(ret => {
      if (!this.recorderInstance) {
        return
      }
      this.recorderInstance.addAudioProcessListener(({sourceNode, audioContext}) => {
        if (!analyser) {
          analyser = audioContext.createAnalyser()
          sourceNode.connect(analyser)
          analyser.fftSize = 2048
        }
        this.setRecordProgress(this.getDuration())
        let volumeSize = this.getVoiceSize(analyser) / VOLUME_MAX
        if (volumeSize > 1) volumeSize = '100%'
        this.setState({
          volumeSize: `${volumeSize * 100}%`
        })
        if (audioContext.state !== this.state.status) {
          this.changeRecorderStatu(audioContext.state)
        }
      })
    })
  }
  handleStart() {
    if (this.state.status !== 'init' && this.state.status !== 'playDone') return
    if (this.getDuration()) {
      this.rerecording()
    } else {
      this.start()
    }
    this.setState({
      playProgress: 0
    })
    this.changeRecorderStatu('start')
    setTimeout(() => {
      this.handlePause()
    }, RECORD_TIME)
  }
  handlePlay() {
    if (this.state.status !== 'pause' && this.state.status !== 'playDone') return
    this.play()
    this.changeRecorderStatu('play')
    const durction = this.getDuration()
    this.setPlayProgress()
    this.handlePlayDone(durction)
  }
  handlePlayDone(durction) {
    setTimeout(() => {
      this.changeRecorderStatu('playDone')
    }, durction * 1000 + 100)
  }
  handlePause() {
    this.pause()
    this.changeRecorderStatu('pause')
  }
  handleClose() {
    this.close()
    this.changeRecorderStatu('init')
    this.setState({
      playProgress: 0,
      recorderProgress: 0
    })
  }
  handleYes() {
    this.setState({
      modalVisiable: true
    })
  }
  handleNo() {
    confirm('1.请检测您的麦克风功能是否正常\n2.请检测输入音量的大小')
  }
  handleCloseModal() {
    this.setState({
      modalVisiable: false
    })
    this.props.handleCloseRecorderMoadl()
  }
  render() {
    const {
      status,
      modalVisiable,
      playProgress,
      recorderProgress,
      volumeSize
    } = this.state
    return (
      <div className='ac-ui-pop__box'>
        <div className='ac-ui-pop__body'>
          <div className='layout-mod mod-detection'>
            <div className='layout-body'>
              <div className='layout-wrapper'>
                <div className='ac-ui-detection detection__record'>
                  <div className='detection__item'>
                    <p className='detection__item_step'>第
                      <em className='num'>1</em>步
                    </p>
                    <p className='detection__item__text'>选择麦克风后，点击“录音”，然后对着麦克风说“1，2，3，4，5.”。调节你的录音音量大小，保证最大音量能达到绿色区域。</p>
                    <div className='detection__item__pocess detection__item__record'>
                      <span className='pocess--on' style={{width: recorderProgress}} />
                    </div>
                    <div className='detection__item__operate'>
                      <a className={classnames(
                        'ac-ui-button',
                        'ac-ui-button--main',
                        'ac-ui-button--mid',
                        {
                          'ac-ui-button--disabled': status !== 'init' && status !== 'playDone'
                        }
                      )} onClick={this.handleStart}>录 音</a>
                    </div>
                    <div className='detection__item_seletwrap'>
                      <div className='ac-ui-pop-select'>
                        <p className='select__text'>麦克风：</p>
                        <Select
                          defaultValue='defalue'
                        >
                          <Option key='1' value='defalue'>默认设备</Option>
                        </Select>
                      </div>
                      <div className='ui-board'>
                        <div className='board__standard' />
                        <div
                          className='board__set board__set--small'
                          >
                          <span
                            className='board__btn'
                            style={{ left: volumeSize }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='detection__item'>
                    <p className='detection__item_step'>第
                      <em className='num'>2</em>步
                    </p>
                    <p className='detection__item__text text__style'>点击“播放”听你的录音。</p>

                    <div className='detection__item__pocess detection__item__play'>
                      <span className='pocess--on' style={{width: playProgress}} />
                    </div>
                    <div className='detection__item__operate'>
                      <a className={classnames(
                        'ac-ui-button',
                        'ac-ui-button--main',
                        'ac-ui-button--mid',
                        {
                          'ac-ui-button--disabled': status !== 'pause' && status !== 'playDone'
                        }
                      )} onClick={this.handlePlay}>播 放</a>
                    </div>
                  </div>
                  <div className='detection__item'>
                    <p className='detection__item_step'>第
                      <em className='num'>3</em>步
                    </p>
                    <p className='detection__item__text text__style'>你能听清楚这段音频吗？</p>
                    <div className='detection__item__operate'>
                      <a
                        className={classnames(
                          'ac-ui-button',
                          'ac-ui-button--main',
                          'ac-ui-button--mid',
                          {
                            'ac-ui-button--disabled': status !== 'playDone'
                          }
                        )}
                        onClick={this.handleNo}
                      >否</a>
                      <a
                        className={classnames(
                          'ac-ui-button',
                          'ac-ui-button--main',
                          'ac-ui-button--mid',
                          {
                            'ac-ui-button--disabled': status !== 'playDone'
                          }
                        )}
                        onClick={this.handleYes}
                      >是</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal
          visible={modalVisiable}
          closable={false}
          wrapClassName='ac-fish-pop ac-pop-tip'
          width='598px'
          header={null}
          footer={
            <Button size='large' type='primary' onClick={this.handleCloseModal}>关闭页面</Button>
          }
        >
          <i className='anticon anticon-check-circle' />
          <span className='ant-confirm-title'>这是一条通知信息</span>
          <div className='ac-ui-pop__body'>
            <i className='ac-ui-icon ac-ui-icon-sound' />
            <p className='ac-ui-pop__body-txt'>音频设备检测结束，你的音频设备可正常使用。</p>
          </div>
        </Modal>
      </div>
    )
  }
}

export default RecorderDetector
