import {wrapModuleName} from 'utils/action-utils'

export default wrapModuleName('RESOURCE_REPOSITORY_ACTION', {
  // 初始化
  INIT: 'INIT',
  // 切换库
  SWITCH_REPOSITORY: 'SWITCH_REPOSITORY',
  // 修改搜索关键字
  CHANGE_SEARCH_KEY: 'CHANGE_SEARCH_KEY',
  // 切换素材类别
  SWITCH_ASSETS_CATEGORY: 'SWITCH_ASSETS_CATEGORY',
  // 获取素材列表
  GET_ASSETS_LIST: 'GET_ASSETS_LIST',
  // 添加选择的文件
  ADD_SELECT_ITEM: 'ADD_SELECT_ITEM',
  // 移除选择的文件
  REMOVE_SELECT_ITEM: 'REMOVE_SELECT_ITEM',
  // 下一页
  NEXT_PAGE: 'NEXT_PAGE',
  // 上一页
  PREV_PAGE: 'PREV_PAGE',
  // 完成选择
  COMPLETE_SELECT: 'COMPLETE_SELECT'
})
