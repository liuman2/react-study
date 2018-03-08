import React, { PropTypes } from 'react'
import UploadAudioSource from './UploadAudioSource'
import GlobalMultipleAudioEditer from './GlobalMultipleAudioEditer'
import { connect } from 'react-redux'
import { removeAudio } from '../../../actions/courseware-action-creator'

@connect(state => {
  const { editMode, pages, currentPage } = state.coursewareAudioEditer.courseware
  const currentPageInfo = pages[currentPage]
  return {
    editMode,
    currentPage,
    currentPageInfo
  }
}, {
  removeAudio
})
class GlobalAudioEditer extends React.Component {
  static propTypes = {
    editMode: PropTypes.object,
    currentPage: PropTypes.number,
    removeAudio: PropTypes.func
  }

  render() {
    const { editMode: { globalAudio, editable }, currentPage, removeAudio } = this.props
    let structure
    if (globalAudio) {
      structure = <GlobalMultipleAudioEditer currentPage={currentPage} audioInfo={globalAudio} removeAudio={removeAudio} />
    } else {
      structure = <UploadAudioSource editable={editable} />
    }

    return <li className='ac-ui-tab__item ac-ui-tab__item--active'>
      {/* <!-- ac-ui-tab__item加类ac-ui-tab__item--active表示显示当前选线卡 --> */}
      {/* 选择音频源 */}
      {structure}
    </li>
  }
}

export default GlobalAudioEditer
