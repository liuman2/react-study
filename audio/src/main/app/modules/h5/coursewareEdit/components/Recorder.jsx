import React from 'react'
import RecorderComponent from 'modules/courseware-audio-editer/components/audio-editer/single/Recorder'
import { formatHHMMSS } from 'app/utils/format-time'
import {connect} from 'react-redux'
import classnames from 'classnames'
import { h5BottomTypeSet, completeRecord } from 'modules/courseware-audio-editer/actions/courseware-action-creator'
import { SUCCESS, createAssets } from 'modules/courseware-audio-editer/biz/AssetsCreator'
import axios from 'axios'
import { getLcUploadUrl } from 'app/services/lifecycle-commmon'
import { getAudioInfo } from 'modules/courseware-audio-editer/biz/AudioTool'
import Loading from 'app/components/loading'
import Toast from 'components/toast'
import RecordingPop from './RecordingPop'

const RECORD_START = 'start'
const RECORD_PAUSE = 'pause'
const RECORD_END = 'end'
const RECORD_RERECORD = 'rerecord'

@connect(state => {
  const userInfo = state.coursewareAudioEditer.userInfo
  return {
    uid: userInfo.user_id
  }
}, {
  h5BottomTypeSet,
  completeRecord
})
export default class Recorder extends RecorderComponent {
  static propTypes = {
    uid: React.PropTypes.string,
    h5BottomTypeSet: React.PropTypes.func,
    completeRecord: React.PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      recorderState: RECORD_END, // 开始：start 暂停：pause 结束：end
      recorderDurction: 0
    }
  }
  componentWillMount() {
    this.initRecorder().then(() => {
      this.handleSwitchRecordState(RECORD_START)
    }).catch(() => {
      this.handleChangeType(0)
    })
  }
  handleRecordStart = () => {
    this.start()
  }
  handleRecordPause = () => {
    this.pause()
  }
  handleRecordEnd = () => {
    if (this.state.duration < 0.1) {
      this.handleChangeType(0)
    }
    const _this = this
    const { uid, completeRecord } = this.props
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
          _this.handleChangeType(2)
        } else {
          fail(result)
        }
        Loading.close()
      })
    }).catch(fail)
  }
  handleRecordRerecord = () => {
    this.rerecording()
    this.handleRecordStart()
  }
  handleSwitchRecordState = (type) => {
    if (!this.state.mediaInit) {
      this.props.h5BottomTypeSet(0)
      return
    }
    switch (type) {
      case RECORD_START:
        this.handleRecordStart()
        break
      case RECORD_PAUSE:
        this.handleRecordPause()
        break
      case RECORD_RERECORD:
        this.handleRecordRerecord()
        break
      case RECORD_END:
        this.handleRecordEnd()
        break
      default:
        break
    }
    if (type === RECORD_RERECORD) {
      type = RECORD_START
    }
    this.setState({
      recorderState: type
    })
  }
  handleChangeType = (type) => {
    this.props.h5BottomTypeSet(type)
  }
  render() {
    const {
      recorderState,
      duration,
      mediaInit
    } = this.state
    const recorderText = {
      [RECORD_START]: '暂停录音',
      [RECORD_PAUSE]: '继续录音',
      [RECORD_END]: '开始录音'
    }
    return (
      <react-none>
        <div className='upload--recording'>
          <div className='upload--recording__info'>已录制
            <span className='upload--recording__time'>{formatHHMMSS(duration || 0)}</span>
          </div>
          <ul className='upload--btn__list'>
            <li className='upload--btn__cell'>
              <a
                className={classnames(
                  'ui-btn ui-btn__circle',
                  {
                    'type-play': recorderState !== RECORD_START,
                    'type-pause': recorderState === RECORD_START,
                    'disabled': !mediaInit
                  }
                )}
                onClick={() => {
                  const type = recorderState === RECORD_START ? RECORD_PAUSE : RECORD_START
                  this.handleSwitchRecordState(type)
                }}
              />
              <p className='upload--btn__name'>{recorderText[recorderState]}</p>
            </li>
            <li className='upload--btn__cell' onClick={() => { this.handleSwitchRecordState(RECORD_END) }}>
              <a
                className={classnames(
                  'ui-btn ui-btn__circle type-stop',
                  {
                    'disabled': !mediaInit
                  }
                )} />
              <p className='upload--btn__name'>结束录音</p>
            </li>
            <li className='upload--btn__cell'>
              <a
                className={classnames(
                  'ui-btn ui-btn__circle type-reset',
                  {
                    'disabled': !mediaInit
                  }
                )}
                onClick={() => { this.handleSwitchRecordState(RECORD_RERECORD) }}
              />
              <p className='upload--btn__name'>重新录音</p>
            </li>
          </ul>
        </div>
        <RecordingPop visible={recorderState !== RECORD_END} status={recorderState} durction={formatHHMMSS(duration || 0)} />
      </react-none>
    )
  }
}
