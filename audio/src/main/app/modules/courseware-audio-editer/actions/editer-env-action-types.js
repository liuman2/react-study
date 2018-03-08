import { wrapModuleName } from 'utils/action-utils'

export default wrapModuleName('EDITER_ENV', {
  // 开始编辑
  TO_EDITING: 'TO_EDITING',
  // 切换成保存课件
  TO_SAVE_COURSEWARE: 'TO_SAVE_COURSEWARE',
  // 重置
  RESET: 'RESET'
})
