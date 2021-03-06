import { wrapModuleName } from 'utils/action-utils'

export default wrapModuleName('COURSEWARE_ACTION', {
  // 课件名称
  CHANGE_TITLE: 'CHANGE_TITLE',
  // 修改课件类型
  CHANGE_CATEGORY: 'CHANGE_CATEGORY',
  // 课件保存至...
  CHANGE_SAVE_TO: 'CHANGE_SAVE_TO',
  // 课件简介
  CHANGE_DESC: 'CHANGE_DESC',
  // 课件标签
  CHANGE_TAGS: 'CHANGE_TAGS',
  // 创建有声课件
  CREATE_COURSEWARE: 'CREATE_COURSEWARE',
  // 预览有声课件
  PREVIEW_COURSEWARE: 'PREVIEW_COURSEWARE',
  // 创建素材
  CREATE_ASSETS: 'CREATE_ASSETS',
  // 获取素材信息，亦可用于获取转码结果
  GET_ASSETS_INFO: 'GET_ASSETS_INFO',
  // 获取cs文件列表
  GET_CS_FILELIST: 'GET_CS_FILELIST',
  // 获取cs文件信息
  GET_CS_FILEINFO: 'GET_CS_FILEINFO',
  // 开始课件制作
  TO_MAKE_COURSEWARE: 'TO_MAKE_COURSEWARE',
  // 试听
  PLAY_AUDIO: 'PLAY_AUDIO',
  // 切换页面
  GO_PAGE: 'GO_PAGE',
  // 上一页
  PREV_PAGE: 'PREV_PAGE',
  // 下一页
  NEXT_PAGE: 'NEXT_PAGE',
  // 移动页
  MOVE_PAGE: 'MOVE_PAGE',
  // 页交换位置
  EXCHANGE_PAGE: 'EXCHANGE_PAGE',
  // 修改停顿时间
  CHANGE_DEAD_TIME: 'CHANGE_DEAD_TIME',
  // 上传音频(资源库或本地)
  UPLOAD_AUDIO: 'UPLOAD_AUDIO',
  // 删除音频
  REMOVE_AUDIO: 'REMOVE_AUDIO',
  // 关闭录音
  CLOSE_RECORD: 'CLOSE_RECORD',
  // 打开录音
  OPEN_RECORD: 'OPEN_RECORD',
  // 开始录音
  START_RECORD: 'START_RECORD',
  // 暂停录音
  PAUSE_RECORD: 'PAUSE_RECORD',
  // 重新录音
  RE_RECORD: 'RE_RECORD',
  // 删除录音
  REMOVE_RECORD: 'REMOVE_RECORD',
  // 完成录音
  COMPLETE_RECORD: 'COMPLETE_RECORD',
  // 切换编辑模式
  SWITCH_MODE: 'SWITCH_MODE',
  // 全局编辑-添加时间标签
  GLOBAL_ADD_TIMESTMAP: 'GLOBAL_ADD_TIMESTMAP',
  // 全局编辑-删除时间标签
  GLOBAL_DELETE_TIMESTMAP: 'GLOBAL_DELETE_TIMESTMAP',
  // 全局编辑-设置时间标签
  GLOBAL_SET_CURRENT_TIMETAG: 'GLOBAL_SET_CURRENT_TIMETAG',
  // 删除无音频数据页
  REMOVE_NOAUDIO_PAGE: 'REMOVE_NOAUDIO_PAGE',
  // H5 修改底部状态
  H5_BOTTOM_TYPE_SET: 'H5_BOTTOM_TYPE_SET',
  // 从资源库导入 音频
  H5_IMPORT_TYPE_AUDIO: 'H5_IMPORT_TYPE_AUDIO',

  SET_IDENTIFIER: 'SET_IDENTIFIER'
})
