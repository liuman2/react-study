import { createAction } from 'redux-actions'
import actionTypes from './userinfo-action-types'

// 加载当前用户信息
export const storeUserInfo = createAction(actionTypes.STORE_USERINFO, userInfo => userInfo)
