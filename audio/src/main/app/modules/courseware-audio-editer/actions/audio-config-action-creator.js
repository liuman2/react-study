import { createAction } from 'redux-actions'
import map from 'lodash/map'
import assign from 'lodash/assign'

import actionTypes from './audio-config-action-types'
import { EDIT_MODE } from '../constants/editer-app-status'

// 重置课程数据
export const resetAudioConfig = createAction(actionTypes.RESET)
// 切换到单页编辑
export const toSingleEditMode = createAction(actionTypes.TO_SINGLE_EDIT_MODE)
// 切换到多页编辑
export const toGlobalEditMode = createAction(actionTypes.TO_GLOBAL_EDIT_MODE)

function simpleAudioInfo(outer = {}) {
  return assign({}, {
    // id
    identifier: '',
    // 音频地址
    audioHref: '',
    // 音频名称
    audioName: '',
    // 播放速率
    playRate: 1,
    // 图片信息
    imageInfos: []
  }, outer)
}

// 赋值 audioInfos
export const assignAudioInfos = createAction(actionTypes.ASSIGN_AUDIO_INFOS, function (editMode, images) {
  switch (editMode) {
    case EDIT_MODE.SINGLE:
      return map(images, image => simpleAudioInfo({ imageInfos: [image] }))
    case EDIT_MODE.GLOBAL:
      return [simpleAudioInfo({ imageInfos: images })]
    default:
      return []
  }
})
