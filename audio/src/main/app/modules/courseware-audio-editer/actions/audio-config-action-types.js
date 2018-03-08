import { wrapModuleName } from 'utils/action-utils'

export default wrapModuleName('AUDIO_CONFIG', {
  //  重置
  RESET: 'RESET',
  // 切换到单页编辑
  TO_SINGLE_EDIT_MODE: 'TO_SINGLE_EDIT_MODE',
  // 切换到全局编辑
  TO_GLOBAL_EDIT_MODE: 'TO_GLOBAL_EDIT_MODE',
  // 初始化
  ASSIGN_AUDIO_INFOS: 'ASSIGN_AUDIO_INFOS'
})
