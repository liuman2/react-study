import { handleActions } from 'redux-actions'
import * as userinfoActionTypes from '../actions/userinfo-action-types'

const initialState = {
  nick_name: '',
  nick_name_full: '',
  nick_name_short: '',
  user_id: -1,
  user_name: '',
  org_exinfo: {
    node_id: -1,
    node_name: '',
    org_full_name: '',
    org_id: -1,
    org_name: '',
    org_user_code: '',
    real_name: '',
    real_name_full: '',
    real_name_short: ''
  }
}

export const reducer = handleActions({
  [userinfoActionTypes.STORE_USERINFO]: {
    next(state, { payload: userInfo }) {
      return {
        ...userInfo
      }
    }
  }
}, initialState)
