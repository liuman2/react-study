import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'
import Recorder from './Recorder'
import { formatHHMMSS } from 'app/utils/format-time'
import { SUCCESS, createAssets } from '../../../biz/AssetsCreator'
import axios from 'axios'
import { getLcUploadUrl } from 'app/services/lifecycle-commmon'
import { getAudioInfo } from '../../../biz/AudioTool'
import { startRecord, closeRecord, pauseRecord, reRecord, completeRecord } from '../../../actions/courseware-action-creator'
import Loading from 'app/components/loading'
import Toast from 'components/toast'
import Modal from 'antd/lib/modal'

// 录音至少要3秒
const RECORD_ATLEAST_SECONDS = 1

/**
 * 录制音频过程
 */
@connect(state => {
  const userInfo = state.coursewareAudioEditer.userInfo
  const identifier = state.coursewareAudioEditer.courseware.identifier
  return {
    uid: userInfo.user_id,
    identifier: identifier
  }
}, {
  startRecord,
  completeRecord,
  closeRecord,
  pauseRecord,
  reRecord
})
class RecordingAudio extends Recorder {
  static propTypes = {
    uid: PropTypes.string,
    startRecord: PropTypes.func,
    completeRecord: PropTypes.func,
    closeRecord: PropTypes.func,
    pauseRecord: PropTypes.func,
    reRecord: PropTypes.func,
    identifier: PropTypes.string
  }
  constructor(props) {
    super(props)
    this.initRecorder()
    this.state.confirmModalVisible = false
    this.clickRemoveAudio = this.clickRemoveAudio.bind(this)
  }

  controlPlay = isPlay => {
    const { mediaInit, duration } = this.state
    if (!mediaInit) {
      return
    }
    const { startRecord, pauseRecord } = this.props
    if (isPlay) {
      if (duration > 0) {
        this.continue()
      } else {
        this.start()
      }
      startRecord()
    } else {
      this.pause()
      pauseRecord()
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.mediaInit && !this.state.mediaInit) {
      this.start()
      this.props.startRecord()
    }
  }

  clickDone = () => {
    const { uid, completeRecord } = this.props
    const isRecordStandard = this.isRecordStandard()
    if (!isRecordStandard) {
      return
    }
    const audioBlob = this.done()

    Loading.open()
    let assetsId, sessionId
    const fail = error => {
      console.log(error)
      Toast('上传失败，可以点击“结束录音”按钮再次上传')
      Loading.close()
    }
    getLcUploadUrl('assets', uid, true).then(function (data) {
      const { uuid, access_url: accessUrl, dist_path: distPath } = data
      const formData = new FormData()
      const fileName = `${Date.now()}.wav`
      formData.append('file', new File([audioBlob], fileName))
      formData.append('name', fileName)
      formData.append('path', distPath)
      formData.append('scope', 1)

      assetsId = uuid
      sessionId = data.session_id

      return axios.post(`${accessUrl}?session=${sessionId}`, formData, {
        headers: {
          'content-type': 'multipart/form-data'
        },
        disableLoading: true
      })
    }).catch(fail)
    .then(function ({ data: csModel }) {
      // 创建素材
      createAssets(uid, assetsId, csModel, sessionId, (status, result) => {
        if (status === SUCCESS) {
          const audioInfo = getAudioInfo(result, 'record')
          completeRecord(audioInfo)
        } else {
          fail(result)
        }
        Loading.close()
      })
    }).catch(fail)
  }

  clickRerecord = () => {
    const { reRecord } = this.props
    const isRecordStandard = this.isRecordStandard()
    if (!isRecordStandard) {
      return
    }
    this.rerecording()
    reRecord()
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const state = this.state
    return state.mediaInit !== nextState.mediaInit || state.recordering !== nextState.recordering ||
      this.getFormatDuration(state.duration) !== this.getFormatDuration(nextState.duration) ||
      state.confirmModalVisible !== nextState.confirmModalVisible
  }

  getFormatDuration = (duration) => {
    return Math.floor(duration)
  }

  /**
   * 录音是否达标
   */
  isRecordStandard = () => {
    const { duration } = this.state
    return duration >= RECORD_ATLEAST_SECONDS
  }

  clickRemoveAudio() {
    this.setState({
      confirmModalVisible: true
    })
  }

  handleModalCancel = () => {
    this.setState({
      confirmModalVisible: false
    })
  }

  confirmRemove = () => {
    const { closeRecord } = this.props
    closeRecord()
  }

  render() {
    const { mediaInit, recordering, duration, confirmModalVisible } = this.state
    const { identifier } = this.props
    const isRecordStandard = this.isRecordStandard()
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
      {identifier ? null : <a className={classnames(
        'ac-ui-button ac-ui-button--delete',
        {
          'hide': recordering
        }
      )} onClick={this.clickRemoveAudio} >删除音频</a>}
      <div className='aut__audio-wrap'>
        <div className='ac-ui-tab__item-con'>
          <span className='aut__audio'>
            <img className='aut__audio-img' src={require((recordering ? 'app/theme/pics/audio-frequency.gif' : 'app/theme/pics/audio-frequency-stop.png'))} alt='' />
          </span>
          <span className='aut__audio-txt-wrap'>
            <div className={classnames({
              'hide': !recordering
            })}>
              <span className='aut__audio-txt aut__audio-txt--red'>
                正在录音
              </span>
              <span className='aut__audio-txt'>
                {formatHHMMSS(duration)}
              </span>
            </div>
            <span className={classnames(
              'aut__audio-txt',
              {
                'hide': recordering || duration === 0
              }
            )}>
              已录制 {formatHHMMSS(duration)}
            </span>
          </span>
        </div>
      </div>
      <div className='aut__audio-btn-wrap'>
        <a className={classnames(
          'ac-ui-button-left-right aublr-start',
          {
            'aublr-start': !recordering,
            'aublr-pause': recordering,
            'aublr--disabled': !mediaInit
          }
        )} onClick={() => this.controlPlay(!recordering)}>
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>{recordering ? '暂停录音' : '继续录音'}</span>
        </a>
        {/* <!-- ac-ui-button-left-right加类aublr--active表示选中,加类aublr--disabled表示按钮不可用 --> */}
        <a className={classnames(
          'ac-ui-button-left-right aublr-over',
          {
            'aublr--disabled': !isRecordStandard
          }
        )} onClick={this.clickDone}>
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>结束录音</span>
        </a>
        {/* <!-- ac-ui-button-left-right加类aublr--active表示选中,加类aublr--disabled表示按钮不可用 --> */}
        <a className={classnames(
          'ac-ui-button-left-right aublr-restart',
          {
            'aublr--disabled': !isRecordStandard
          }
        )} onClick={this.clickRerecord}>
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>重新录音</span>
        </a>
        {/* test */}
        {/* <a className={classnames(
          'ac-ui-button-left-right aublr-start'
        )} onClick={() => this.play()}>
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>试听</span>
        </a> */}
        {/* <!-- ac-ui-button-left-right加类aublr--active表示选中,加类aublr--disabled表示按钮不可用 --> */}
      </div>
    </div>
  }
}

export default RecordingAudio
