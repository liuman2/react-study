import { createAction } from 'redux-actions'
import actionTypes from './imagereorder-action-types'

// 打开图片调序
export const openImageReorder = createAction(actionTypes.OPEN,
  (from, images) => ({from, images})
)

// 删除图片项
export const removeItem = createAction(actionTypes.REMOVE_ITEM,
  index => index
)

// 改变位置
export const changePosition = createAction(actionTypes.CHANGE_POSITION,
  (originPosition, targetPosition) => ({originPosition, targetPosition})
)

// 完成图片调序
export const completeReorder = createAction(actionTypes.COMPLETE_REORDER)
