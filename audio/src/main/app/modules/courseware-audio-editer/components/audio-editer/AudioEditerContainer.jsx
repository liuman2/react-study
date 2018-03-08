import React, { PropTypes } from 'react'
import AudioEditer from './AudioEditer'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { switchMode } from '../../actions/courseware-action-creator'
// TODO: 手动调用 this.initRecorder() 进行录音初始化

@connect(state => {
  const { isSingle, switchLock } = state.coursewareAudioEditer.courseware.editMode
  return {
    isSingleMode: isSingle, // 是否单页编辑
    switchLock // 是否能切换编辑类型
  }
}, {
  switchMode
})
class AudioEditerContainer extends React.Component {
  static propTypes = {
    isSingleMode: PropTypes.bool,
    switchLock: PropTypes.bool,
    switchMode: PropTypes.func.isRequired
  }

  switchEditMode = isSingle => {
    const { switchLock, switchMode } = this.props
    if (!switchLock) {
      return
    }
    switchMode(isSingle)
  }

  render() {
    const { isSingleMode, switchLock } = this.props
    return <div className='ac-ui-tab-wrap'>
      <ul className='ac-ui-tab-tit'>
        <li className={classnames(
          'ac-ui-tab-tit_item',
          {
            'aut__item--active': isSingleMode,
            'aut__item--disabled': !isSingleMode && !switchLock
          }
        )} onClick={() => this.switchEditMode(true)}>
          <span className='ac-ui-tab-tit_txt'>单页编辑</span>
        </li>
        {/* aut__item--disabled */}
        <li className={classnames(
          'ac-ui-tab-tit_item',
          {
            'aut__item--active': !isSingleMode,
            'aut__item--disabled': isSingleMode && !switchLock
          }
        )} onClick={() => this.switchEditMode(false)}>
          <span className='ac-ui-tab-tit_txt'>全局编辑</span>
        </li>
      </ul>
      {/* 音频编辑 */}
      <AudioEditer isSingleMode={isSingleMode} />
    </div>
  }
}

export default AudioEditerContainer
