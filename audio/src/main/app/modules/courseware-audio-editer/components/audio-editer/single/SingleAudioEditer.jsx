import React, { PropTypes } from 'react'
import SelectAudioSource from './SelectAudioSource'
import RecordedAudioDeal from './RecordedAudioDeal'
import RecordingAudio from './RecordingAudio'
import UploadedAudioDeal from './UploadedAudioDeal'
import { connect } from 'react-redux'
import { removeAudio, openRecord } from '../../../actions/courseware-action-creator'

/**
 * 获取编辑页音状态: recorded 已完成音频录制, uploaded 已上传音频, open_record 录音页面, undefined
 */
const getPageStatus = (editMode, currentPageInfo) => {
  if (!currentPageInfo) {
    return
  }
  const audio = currentPageInfo.audio
  if (editMode.isSingle) { // 单页
    const { open } = editMode.recorder
    if (audio) {
      return audio.from === 'upload' ? 'uploaded' : 'recorded'
    } else if (open) {
      return 'open_record'
    }
  } else { // 全局
    if (editMode.globalAudio) {
      return 'uploaded'
    }
  }
}

@connect(state => {
  const { editMode, pages, currentPage, identifier } = state.coursewareAudioEditer.courseware
  const currentPageInfo = pages[currentPage]
  return {
    pageStatus: getPageStatus(editMode, currentPageInfo),
    editMode,
    currentPageInfo,
    identifier
  }
}, {
  removeAudio,
  openRecord
})
class SingleAudioEditer extends React.Component {
  static propTypes = {
    pageStatus: PropTypes.string,
    editMode: PropTypes.object,
    currentPageInfo: PropTypes.object,
    removeAudio: PropTypes.func,
    openRecord: PropTypes.func,
    identifier: PropTypes.string
  }

  render() {
    const { pageStatus, editMode, currentPageInfo, removeAudio, openRecord, identifier } = this.props
    let structure
    switch (pageStatus) {
      case 'recorded':// 结束录音
        structure = <RecordedAudioDeal audioInfo={currentPageInfo.audio} removeAudio={removeAudio} openRecord={openRecord} />
        break
      case 'uploaded':// 音频处理
        structure = <UploadedAudioDeal audioInfo={currentPageInfo.audio} removeAudio={removeAudio} identifier={identifier} />
        break
      case 'open_record':// 录音页面
        structure = <RecordingAudio />
        break
      default:
        structure = <SelectAudioSource editable={editMode.editable} openRecord={openRecord} />
        break
    }

    return <li className='ac-ui-tab__item ac-ui-tab__item--active'>
      {/* <!-- ac-ui-tab__item加类ac-ui-tab__item--active表示显示当前选线卡 --> */}
      {/* 选择音频源 */}
      {structure}
    </li>
  }
}

export default SingleAudioEditer
