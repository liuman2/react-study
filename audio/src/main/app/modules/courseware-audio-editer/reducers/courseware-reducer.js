import { handleActions } from 'redux-actions'
import * as actionTypes from '../actions/courseware-action-types'
import * as imageReorderActionTypes from '../actions/imagereorder-action-types'
import map from 'lodash/map'
import find from 'lodash/find'
import cloneDeep from 'lodash/cloneDeep'
import isUndefined from 'lodash/isUndefined'
import forEach from 'lodash/forEach'
import orderBy from 'lodash/orderBy'
import filter from 'lodash/filter'
import Toast from 'components/toast'
import { DEFAULT_DEADTIME, TITLE_MAX_LENGTH } from '../constants/common-constant'

const initialState = {
  // id
  identifier: '',
  // 课件名称
  title: '',
  // 课件简介
  description: '',
  // 资源标签
  tags: [],
  // 技术信息
  tech_info: {
    href: {
      location: ''
    }
  },
  saveTo: '',
  category: '',
  // 课件item列表
  pages: [],
  timepoints: undefined, // 全局编辑-时间点数组
  currentPage: -1, // 当前编辑页索引
  editMode: {
    isSingle: true, // single or global
    switchLock: true, // 进入模式编辑后，不可切换(除非重置编辑数据)
    editable: false, // 是否可编辑，有page数据后才可编辑
    recorder: { // 单页编辑-录音
      open: false, // 是否显示录音页面
      haveRecord: false, // 是否有录音数据
      isRecording: false // 是否正在录音
    },
    globalAudio: undefined // 全局模式一个音频文件
    // {
    //   identifier: '',
    //   url: '',
    //   location: '',
    //   duration: 0, //毫秒
    //   from: '' //upload or record
    // }
  },
  currentTimeTag: {}, // 全局编辑时当前选中的时间标签
  h5BottomType: 0, // 0:为选择 1：录制 2：录音结束 3：音频处理
  playing: false
}

/**
 * 切换页面通用处理
 * @param {Object} state
 */
const newStateForSwitchPage = (state, targetPageIndex) => {
  const newState = cloneDeep(state)
  const { editMode: { isSingle, recorder } } = newState
  const { open, haveRecord } = recorder
  if (isSingle && open) {
    if (haveRecord) {
      Toast('当前页面录音未结束!')
      return newState
    } else {
      // 切换页面，重置
      recorder.open = false
    }
  }
  newState.currentPage = targetPageIndex
  newState.playing = false
  return newState
}

const saveActionHandle = {
  [actionTypes.CHANGE_TITLE](state, { payload: title }) {
    const newState = cloneDeep(state)
    // 长度限制
    if (title && title.length > TITLE_MAX_LENGTH) {
      title = title.substring(0, TITLE_MAX_LENGTH)
    }
    return {
      ...newState,
      title: title
    }
  },
  [actionTypes.CHANGE_CATEGORY](state, { payload: category }) {
    const newState = cloneDeep(state)
    return {
      ...newState,
      category: category
    }
  },
  [actionTypes.CHANGE_SAVE_TO](state, { payload: saveTo }) {
    const newState = cloneDeep(state)
    return {
      ...newState,
      saveTo: saveTo
    }
  },
  [actionTypes.CHANGE_DESC](state, { payload: desc }) {
    const newState = cloneDeep(state)
    return {
      ...newState,
      description: desc
    }
  },
  [actionTypes.CHANGE_TAGS](state, { payload: tags }) {
    const newState = cloneDeep(state)
    return {
      ...newState,
      tags: tags
    }
  },
  [actionTypes.CREATE_COURSEWARE]: {
    next(state, action) {
      // handle success
      Toast('已保存到我的资源-课件')
      // return cloneDeep(initialState)
      return state
    },
    throw(state, action) {
      // handle error
      Toast('保存失败!')
      return cloneDeep(state)
    }
  },
  [actionTypes.SET_IDENTIFIER](state, { payload: identifier }) {
    const newState = cloneDeep(state)
    newState.identifier = identifier
    return newState
  }
}

export const reducer = handleActions({
  ...saveActionHandle,
  [actionTypes.H5_IMPORT_TYPE_AUDIO](state, payload) {
    const newState = cloneDeep(state)
    return newState
  },
  [actionTypes.H5_BOTTOM_TYPE_SET](state, { payload }) {
    const newState = cloneDeep(state)
    newState.h5BottomType = payload
    return {
      ...newState
    }
  },
  [imageReorderActionTypes.OPEN](state) {
    return cloneDeep(initialState)
  },
  [actionTypes.TO_MAKE_COURSEWARE](state, { payload: { title, coursewareImages } }) {
    const newState = saveActionHandle[actionTypes.CHANGE_TITLE](initialState, { payload: title })
    // const newState = cloneDeep(initialState)
    const coursewarePages = map(coursewareImages, imageUrl => ({
      imageUrl,
      deadTime: DEFAULT_DEADTIME // 页面播放完停顿时间 单位：秒
    }))
    if (coursewarePages.length > 0) {
      newState.editMode.editable = true
      newState.currentPage = 0
    }
    return {
      ...newState,
      pages: coursewarePages
    }
  },
  [actionTypes.GLOBAL_ADD_TIMESTMAP](state, { payload }) {
    const newState = cloneDeep(state)
    const { pageNum, timeObj } = payload
    let nullObj = []
    let preTime = {
      startTime: 0
    }
    // 声音调整时，图片位置也需要跟着调整
    if (newState.timepoints.length) {
      forEach(newState.timepoints, (point, i) => {
        point.imageUrl = newState.pages[i].imageUrl
      })
    }
    newState.timepoints[pageNum] = timeObj
    forEach(newState.timepoints, (t, i) => {
      if (i < pageNum) {
        if (isUndefined(t.startTime)) {
          nullObj.push(i)
          newState.timepoints[i] = cloneDeep(preTime)
        } else {
          preTime = cloneDeep(t)
        }
      }
    })
    newState.timepoints = orderBy(newState.timepoints, ['startTime'])
    if (nullObj.length) {
      forEach(nullObj, t => {
        newState.timepoints[t] = {}
      })
    }
    forEach(newState.timepoints, (t, i) => {
      if (!(newState.timepoints[i + 1])) {
        newState.timepoints[i].endTime = ''
      } else {
        newState.timepoints[i].endTime = newState.timepoints[i + 1].startTime
      }
      if (i === 0 && newState.timepoints[i].startTime === undefined) {
        newState.timepoints[i].startTime = 0
      }
    })

    const startPoints = filter(newState.timepoints, item => {
      return item.startTime !== undefined
    })
    const restPoints = filter(newState.timepoints, item => {
      return item.startTime === undefined
    })
    startPoints.sort((cur, nex) => {
      return cur.startTime - nex.startTime
    })
    newState.timepoints = startPoints.concat(restPoints)
    forEach(newState.timepoints, (t, i) => {
      state.pages[i].imageUrl = t.imageUrl
    })
    return {
      ...newState
    }
  },
  [actionTypes.GLOBAL_DELETE_TIMESTMAP](state, { payload }) {
    const newState = cloneDeep(state)
    const initTimeObj = {
      startTime: undefined,
      endTime: undefined
    }
    newState.timepoints[payload] = Object.assign({}, newState.timepoints[payload], initTimeObj)
    // 声音调整时，图片位置也需要跟着调整
    if (newState.timepoints.length) {
      forEach(newState.timepoints, (point, i) => {
        point.imageUrl = newState.pages[i].imageUrl
      })
      const startPoints = filter(newState.timepoints, item => {
        return item.startTime !== undefined
      })
      const restPoints = filter(newState.timepoints, item => {
        return item.startTime === undefined
      })
      startPoints.sort((cur, nex) => {
        return cur.startTime - nex.startTime
      })
      newState.timepoints = startPoints.concat(restPoints)
      forEach(newState.timepoints, (t, i) => {
        newState.pages[i].imageUrl = t.imageUrl
      })
    }
    return {
      ...newState
    }
  },
  [actionTypes.GLOBAL_SET_CURRENT_TIMETAG](state, { payload }) {
    if (payload && payload.sec !== undefined && payload.position === undefined) {
      state.timepoints[state.currentPage].startTime = payload.sec * 1000
      const clonePoints = cloneDeep(state.timepoints)
      // 声音调整时，图片位置也需要跟着调整
      forEach(clonePoints, (point, i) => {
        point.imageUrl = state.pages[i].imageUrl
      })
      const startPoints = filter(clonePoints, item => {
        return item.startTime !== undefined
      })
      const restPoints = filter(clonePoints, item => {
        return item.startTime === undefined
      })
      const newPoints = startPoints.sort((cur, nex) => {
        return cur.startTime - nex.startTime
      })
      let currentPage = state.currentPage
      for (let i = 0; i < newPoints.length; i++) {
        if (newPoints[i].startTime === payload.sec * 1000) {
          currentPage = i
        }
        if (i < newPoints.length - 1) {
          newPoints[i].endTime = newPoints[i + 1].startTime
        }
        if (i === state.timepoints.length - 1) {
          newPoints[i].endTime = state.editMode.globalAudio.duration
        }
      }

      state.timepoints = newPoints.concat(restPoints)
      state.currentPage = currentPage

      console.log(clonePoints)
      forEach(state.timepoints, (t, i) => {
        state.pages[i].imageUrl = t.imageUrl
        delete t.imageUrl
      })
    }

    state.currentTimeTag = Object.assign({}, state.currentTimeTag, payload)
    return {
      ...state
    }
  },
  [actionTypes.PLAY_AUDIO](state, { payload: isplay }) {
    const newState = cloneDeep(state)
    newState.playing = isplay
    return newState
  },

  [actionTypes.GO_PAGE](state, { payload: targetPageIndex }) {
    const newState = newStateForSwitchPage(state, targetPageIndex)
    return newState
  },
  [actionTypes.PREV_PAGE](state) {
    const newState = newStateForSwitchPage(state, state.currentPage - 1)
    return newState
  },
  [actionTypes.NEXT_PAGE](state) {
    const newState = newStateForSwitchPage(state, state.currentPage + 1)
    return newState
  },
  [actionTypes.MOVE_PAGE](state, { payload: { originPosition, targetPosition } }) {
    const newState = cloneDeep(state)
    let newPages = newState.pages
    const movePage = newPages.splice(originPosition, 1)[0]
    newPages.splice(targetPosition, 0, movePage)
    return {
      ...newState,
      currentPage: targetPosition
    }
  },
  [actionTypes.EXCHANGE_PAGE](state, { payload: { originPosition, targetPosition } }) {
    const newState = cloneDeep(state)
    let newPages = newState.pages
    const originPage = newPages[originPosition]
    const targetPage = newPages[targetPosition]
    newPages[originPosition] = targetPage
    newPages[targetPosition] = originPage
    return {
      ...newState,
      currentPage: targetPosition
    }
  },
  [actionTypes.CHANGE_DEAD_TIME](state, { payload: deadTimeSec }) {
    const newState = cloneDeep(state)
    const { pages, currentPage } = newState
    pages[currentPage].deadTime = deadTimeSec
    return newState
  },
  [actionTypes.UPLOAD_AUDIO](state, { payload: audioInfo }) {
    const newState = cloneDeep(state)
    const { editMode, pages, currentPage } = newState
    if (editMode.isSingle) { // 单页
      const currentPageInfo = pages[currentPage]
      currentPageInfo.audio = audioInfo
    } else { // 全局
      editMode.globalAudio = audioInfo
      newState.currentPage = 0
    }
    // 上传音频后就正式进入编辑，不可切换编辑模式
    editMode.switchLock = false
    return newState
  },
  [actionTypes.REMOVE_AUDIO](state) {
    const newState = cloneDeep(state)
    const { editMode, pages, timepoints, currentPage } = newState
    let editedAfterRemove
    if (editMode.isSingle) { // 单页
      const currentPageInfo = pages[currentPage]
      currentPageInfo.audio = undefined
      editedAfterRemove = hasBeenEdited(newState)
    } else { // 全局
      editMode.globalAudio = undefined
      editedAfterRemove = false
      map(timepoints, timepoint => {
        timepoint.startTime = undefined
        timepoint.endTime = undefined
      })
      newState.currentTimeTag = {}
      newState.currentPage = 0
    }
    editMode.switchLock = !editedAfterRemove
    return newState
  },
  [actionTypes.OPEN_RECORD](state) {
    const newState = cloneDeep(state)
    const { editMode: { recorder } } = newState
    recorder.open = true
    recorder.isRecording = false
    return newState
  },
  [actionTypes.CLOSE_RECORD](state) {
    const newState = cloneDeep(state)
    const { editMode: { recorder } } = newState
    recorder.open = false
    recorder.haveRecord = false
    recorder.isRecording = false
    return newState
  },
  [actionTypes.START_RECORD](state) {
    const newState = cloneDeep(state)
    const { editMode: { recorder } } = newState
    recorder.isRecording = true
    recorder.haveRecord = true
    return newState
  },
  [actionTypes.PAUSE_RECORD](state) {
    const newState = cloneDeep(state)
    const { editMode: { recorder } } = newState
    recorder.isRecording = false
    return newState
  },
  [actionTypes.RE_RECORD](state) {
    const newState = cloneDeep(state)
    const { editMode: { recorder } } = newState
    recorder.isRecording = true
    return newState
  },
  [actionTypes.COMPLETE_RECORD](state, { payload: audioInfo }) {
    const newState = cloneDeep(state)
    const { editMode, pages, currentPage } = newState
    const { recorder } = editMode
    const currentPageInfo = pages[currentPage]
    currentPageInfo.audio = audioInfo
    recorder.open = false
    recorder.isRecording = false
    recorder.haveRecord = false
    editMode.switchLock = false
    return newState
  },
  [actionTypes.SWITCH_MODE](state, { payload: isSingle }) {
    const newState = cloneDeep(state)
    const { pages, editMode } = newState
    editMode.isSingle = isSingle
    if (isSingle) {
      newState.timepoints = undefined
    } else {
      newState.timepoints = map(pages, () => {
        return {}
      })
    }
    return newState
  },
  [actionTypes.REMOVE_NOAUDIO_PAGE](state) {
    const newState = cloneDeep(state)
    const { pages, timepoints, editMode: { isSingle } } = newState

    for (let i = pages.length - 1; i >= 0; i--) {
      let havaAudio
      if (isSingle) {
        havaAudio = pages[i].audio
      } else {
        if (i === 0) {
          timepoints[0].startTime = 0
        }
        if (i === 0 && pages.length === 1) {
          timepoints[i].endTime = newState.editMode.globalAudio.duration
        }
        if (i === pages.length - 1 && timepoints[i].startTime && !timepoints[i].endTime) {
          timepoints[i].endTime = newState.editMode.globalAudio.duration
        }
        if (i === 0 && !timepoints[i].endTime && timepoints.length > 1) {
          timepoints[i].endTime = timepoints[1].startTime
        }
        // havaAudio = timepoints[i].endTime && timepoints[i].startTime !== undefined
        havaAudio = timepoints[i].startTime !== undefined
      }

      if (!havaAudio) {
        pages.splice(i, 1)
        !isSingle && timepoints.splice(i, 1)
        newState.currentPage >= i && newState.currentPage--
      }
    }
    if (pages.length === 0) {
      return cloneDeep(initialState)
    }

    if (!isSingle && timepoints.length && timepoints.length > 1) {
      for (let i = 0; i < timepoints.length; i++) {
        if (timepoints[i].endTime === undefined && i < timepoints.length - 1) {
          timepoints[i].endTime = timepoints[i + 1].startTime
        }
        if (timepoints[i].endTime === undefined && i === timepoints.length - 1) {
          timepoints[i].endTime = newState.editMode.globalAudio.duration
        }
      }
    }
    return newState
  }
}, initialState)

const hasBeenEdited = state => {
  const { editMode, pages } = state
  if (editMode.isSingle) { // 单页
    const haveAudioPage = find(pages, page => {
      return page.audio
    })
    return haveAudioPage !== undefined
  } else { // 全局
    return editMode.globalAudio !== undefined
  }
}
