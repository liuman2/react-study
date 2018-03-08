import { handleActions } from 'redux-actions'
import * as actionTypes from '../actions/imagereorder-action-types'
import cloneDeep from 'lodash/cloneDeep'

const initialState = {
  // 来源 local/ndr
  from: '',
  // 图片调序
  reorder_images: [
    // {name: 'sssss', url: 'http://sdpcs.beta.web.sdp.101.com/v0.1/static/prepub_content_edu_product/esp/assets/b542b298-8073-48a4-9964-d27181a6abdb.pkg/transcode/b7d2639cbe279e08eb416a40d664de31.jpg'},
    // {name: 'aaaa', url: 'http://sdpcs.beta.web.sdp.101.com/v0.1/static/prepub_content_edu_product/esp/assets/278a8f79-c60f-46b5-a071-1cb1a69b5577.pkg/transcode/ffb3387143604d98d83eb6c3ace39b99.jpg'}
  ]
}

export const reducer = handleActions({
  [actionTypes.OPEN](state, {payload: {from, images}}) {
    const newState = cloneDeep(state)
    return {
      ...newState,
      from,
      reorder_images: [...newState.reorder_images, ...images]
    }
  },
  [actionTypes.REMOVE_ITEM](state, {payload: index}) {
    const newState = cloneDeep(state)
    newState.reorder_images.splice(index, 1)
    return newState
  },
  [actionTypes.CHANGE_POSITION](state, {payload: {originPosition, targetPosition}}) {
    const newState = cloneDeep(state)
    let newImages = newState.reorder_images
    const moveItem = newImages.splice(originPosition, 1)[0]
    newImages.splice(targetPosition, 0, moveItem)
    return newState
  },
  [actionTypes.COMPLETE_REORDER](state) {
    const newState = cloneDeep(state)
    return {
      ...newState,
      from: '',
      reorder_images: []
    }
  },
  [actionTypes.H5_IMPORT_TYPE_IMAGES](state) {
    const newState = cloneDeep(state)
    return newState
  }
}, initialState)
