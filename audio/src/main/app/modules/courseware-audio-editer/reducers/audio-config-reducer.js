import { handleActions } from 'redux-actions'
import cloneDeep from 'lodash/cloneDeep'
import * as actionTypes from '../actions/audio-config-action-types'

const initialState = {
  // 课件id
  coursewareIdentifier: '',
  // 页码音频配置对象
  audioInfos: [],
  // 播放停顿时间
  standstill: 0,
  // 编辑模式
  editMode: 'disabled',
  // 全局编辑下的额外信息
  globalExtra: {
    audioHref: '',
    audioName: ''
  }
}

export const reducer = handleActions({
  [actionTypes.RESET]() {
    return cloneDeep(initialState)
  }
}, initialState)
