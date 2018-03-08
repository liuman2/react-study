import { createAction } from 'redux-actions'
import * as actionTypes from './editer-env-action-types'

// 音频编辑态
export const toEditing = createAction(actionTypes.TO_EDITING)

// 课件元数据保存
export const toSaveCourseware = createAction(actionTypes.TO_SAVE_COURSEWARE)

// 重置状态
export const resetEnv = createAction(actionTypes.RESET)
