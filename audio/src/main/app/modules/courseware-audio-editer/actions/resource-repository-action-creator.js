import { createAction } from 'redux-actions'
import actionTypes from './resource-repository-action-types'
import axios from 'axios'
import config from 'config'

// 初始化(根据页面参数初始化state)
export const init = createAction(actionTypes.INIT,
  query => query
)
// 切换库
export const switchRepository = createAction(actionTypes.SWITCH_REPOSITORY,
  repository => repository
)

// 修改搜索关键字
export const changeSearchKey = createAction(actionTypes.CHANGE_SEARCH_KEY,
  repository => repository
)

// 切换素材类别
export const switchAssetsCategory = createAction(actionTypes.SWITCH_ASSETS_CATEGORY,
  category => category
)

// 获取文件列表（这里的res_type固定是assets，指素材）
export const getAssetsList = createAction(actionTypes.GET_ASSETS_LIST,
  ({coverage, words, category, starIndex, pageSize, disableLoading}) => {
    // nd公共库，或某个人的私有库
    const orderby = encodeURIComponent('last_update desc')
    let coursewareCategory = ''
    if (category === '$RA0108') {
      coursewareCategory = `&category=${encodeURIComponent('$RT0100')}`
    }
    const limit = encodeURIComponent(`(${starIndex},${pageSize})`)
    return axios.get(`${config.lifecycle_server}/v0.6/assets/actions/query?category=${encodeURIComponent(category)}${coursewareCategory}&coverage=${encodeURIComponent(coverage)}&include=${encodeURIComponent('TI,CG,LC')}&limit=${limit}&words=${words}&orderby=${orderby}`, {disableLoading: disableLoading, disabledAuth: true}).then(resp => {
      return {
        category,
        data: resp.data
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
    })
  }
)

// 添加选择的文件
export const addSelectItem = createAction(actionTypes.ADD_SELECT_ITEM,
  item => item
)

// 移除选择的文件
export const removeSelectItem = createAction(actionTypes.REMOVE_SELECT_ITEM,
  item => item
)

// 上一页
export const prevPage = createAction(actionTypes.PREV_PAGE)

// 下一页
export const nextPage = createAction(actionTypes.NEXT_PAGE)

// 完成选择
export const COMPLETE_SELECT = createAction(actionTypes.COMPLETE_SELECT)
