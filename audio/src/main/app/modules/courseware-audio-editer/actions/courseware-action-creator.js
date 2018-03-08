import { createAction } from 'redux-actions'
import actionTypes from './courseware-action-types'
import axios from 'axios'
import config from 'config'
import { removeSuffix } from 'app/utils/string-util'
import sortBy from 'lodash/sortBy'

// 修改课件名称
export const changeTitle = createAction(actionTypes.CHANGE_TITLE, title => title)

// 修改课件类型
export const changeCategory = createAction(actionTypes.CHANGE_CATEGORY, category => category)

// 修改课件保存至
export const changeSaveTo = createAction(actionTypes.CHANGE_SAVE_TO, saveTo => saveTo)

// 修改课件简介
export const changeDesc = createAction(actionTypes.CHANGE_DESC, desc => desc)

// 修改课件标签
export const changeTags = createAction(actionTypes.CHANGE_TAGS, tags => tags)

// 创建有声课件
export const createCourseware = createAction(actionTypes.CREATE_COURSEWARE,
  (data) => axios.post('/v1/resources', data)
)

export const setIdentifier = createAction(actionTypes.SET_IDENTIFIER)

// 预览有声课件
export const previewCourseware = createAction(actionTypes.PREVIEW_COURSEWARE,
  (identifier) => axios.get(`/v1/resources/${identifier}/location`)
)

// 创建素材
export const createAssets = createAction(actionTypes.CREATE_ASSETS,
  (data, disableLoading) => axios.post('/v1/assets', data, {disableLoading: disableLoading})
)

// 获取素材信息，亦可用于获取转码结果（这里的res_type固定是assets，指素材）
export const getAssetsInfo = createAction(actionTypes.GET_ASSETS_INFO,
  (assetsId, include, disableLoading) => axios.get(`${config.lifecycle_server}/v0.6/assets/${assetsId}?include=${include}`, {disableLoading: disableLoading})
)

// 获取cs文件列表
export const getCsFileList = createAction(actionTypes.GET_CS_FILELIST,
  (path, session, disableLoading) => {
    return axios.get(`${config.cs_host}/v0.1/dentries?path=${encodeURI(path)}&session=${session}&$offset=0&$limit=1000`, {disableLoading: disableLoading})
      .then(response => {
        return sortBy(response.data.items, item => {
          const name = removeSuffix(item.name)
          if (isNaN(name)) {
            return name
          }
          // name应是number，代表页码
          return Number(name)
        })
      })
  }
)

// 获取cs文件目录项信息 非公开文件session必传
export const getCsFileInfo = createAction(actionTypes.GET_CS_FILEINFO,
  (path, session, disableLoading) => axios.get(`${config.cs_host}/v0.1/dentries/actions/get?path=${encodeURI(path)}&session=${session}`, {disableLoading: disableLoading})
)

// 开始课件制作
export const toMakeCourseware = createAction(actionTypes.TO_MAKE_COURSEWARE,
  (name, coursewareImages) => ({ title: removeSuffix(name), coursewareImages })
)

// 播放音乐
export const playAudio = createAction(actionTypes.PLAY_AUDIO,
  isPlaying => isPlaying
)

// 切换编辑页
export const goPage = createAction(actionTypes.GO_PAGE,
  targetPageIndex => targetPageIndex
)

// 上一页
export const prevPage = createAction(actionTypes.PREV_PAGE)

// 下一页
export const nextPage = createAction(actionTypes.NEXT_PAGE)

// 移动位置
export const movePage = createAction(actionTypes.MOVE_PAGE,
  (originPosition, targetPosition) => ({originPosition, targetPosition})
)

// 交换位置
export const exchangePage = createAction(actionTypes.EXCHANGE_PAGE,
  (originPosition, targetPosition) => ({originPosition, targetPosition})
)

// 改变停顿时间
export const changeDeadTime = createAction(actionTypes.CHANGE_DEAD_TIME,
  deadTimeSec => deadTimeSec
)

// 上传音频
export const uploadAudio = createAction(actionTypes.UPLOAD_AUDIO,
  audioInfo => audioInfo
)

// 删除音频
export const removeAudio = createAction(actionTypes.REMOVE_AUDIO)

// 打开录音
export const openRecord = createAction(actionTypes.OPEN_RECORD)

// 关闭录音
export const closeRecord = createAction(actionTypes.CLOSE_RECORD)

// 开始录音
export const startRecord = createAction(actionTypes.START_RECORD)

// 暂停录音
export const pauseRecord = createAction(actionTypes.PAUSE_RECORD)

// 重新录音
export const reRecord = createAction(actionTypes.RE_RECORD)

// 删除录音(录音未结束过程)
export const removeRecord = createAction(actionTypes.REMOVE_RECORD,
  deadTimeSec => deadTimeSec
)

// 完成录音
export const completeRecord = createAction(actionTypes.COMPLETE_RECORD,
  audioInfo => audioInfo
)

// 切换编辑模式
export const switchMode = createAction(actionTypes.SWITCH_MODE,
  isSingle => isSingle
)

// 全局编辑-添加时间标签
export const globalAddTimestmap = createAction(actionTypes.GLOBAL_ADD_TIMESTMAP,
  (pageNum, timeObj) => ({pageNum, timeObj})
)

// 全局编辑-删除时间标签
export const globalDeleteTimestmap = createAction(actionTypes.GLOBAL_DELETE_TIMESTMAP,
  pageNum => pageNum
)

export const globalSetCurrentTimeTag = createAction(actionTypes.GLOBAL_SET_CURRENT_TIMETAG,
  tagObj => tagObj
)

// 删除无音频页面
export const removeNoAudioPage = createAction(actionTypes.REMOVE_NOAUDIO_PAGE)

export const h5BottomTypeSet = createAction(actionTypes.H5_BOTTOM_TYPE_SET,
  type => type
)
