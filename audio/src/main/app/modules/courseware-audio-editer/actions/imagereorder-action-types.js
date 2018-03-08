import { wrapModuleName } from 'utils/action-utils'

export default wrapModuleName('IMAGEREORDER_ACTION', {
  // 打开图片调序
  OPEN: 'OPEN',
  // 删除item
  REMOVE_ITEM: 'REMOVE_ITEM',
  // 改变位置
  CHANGE_POSITION: 'CHANGE_POSITION',
  // 完成调序
  COMPLETE_REORDER: 'COMPLETE_REORDER',
  // 从资源库导入 文档、图片
  H5_IMPORT_TYPE_IMAGES: 'H5_IMPORT_TYPE_IMAGES'
})
