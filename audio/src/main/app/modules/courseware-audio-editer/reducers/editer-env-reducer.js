import { handleActions } from 'redux-actions'
import * as actionTypes from '../actions/editer-env-action-types'

const initialState = {
  // 初始化无编辑文档
  editerStep: 'no-pages'
}

export const reducer = handleActions({
  /**
   * 切换到 音频编辑 状态
   * @type {Function}
   */
  [actionTypes.TO_EDITING](state) {
    return {
      ...state,
      editerStep: 'editing'
    }
  },
  /**
   * 切换到 课件保存 状态
   * @type {Function}
   */
  [actionTypes.TO_SAVE_COURSEWARE](state) {
    return {
      ...state,
      editerStep: 'save-meta'
    }
  }
}, initialState)
