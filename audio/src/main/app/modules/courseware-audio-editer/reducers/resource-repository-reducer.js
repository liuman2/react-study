import isEqual from 'lodash/isEqual'
import { handleActions } from 'redux-actions'
import cloneDeep from 'lodash/cloneDeep'
import assign from 'lodash/assign'
import find from 'lodash/find'
import some from 'lodash/some'
import filter from 'lodash/filter'
import forEach from 'lodash/forEach'
import actionTypes from '../actions/resource-repository-action-types'
import { convertSizeToKB } from 'utils/format-unit'
import { TypeEnum, getTypeFromMimeType } from '../components/resource-uploader/TypeUtils'

const CATEGORY = {
  IMAGE: '$RA0101',
  AUDIO: '$RA0102',
  DOCUMENT: '$RA0108'
}
const CATEGORY_LABEL = {
  IMAGE: '图片',
  AUDIO: '音频',
  DOCUMENT: '文档'
}
const REPOSITORY_TYPE = [
  { code: 'USER', name: '个人库' },
  { code: 'PUBLIC', name: '公共库' }
]

export const PUBLIC_COVERAGE = 'Org/nd/OWNER' // 个人库查询把nd改成userId

const isPersonal = repositoryType => {
  return repositoryType.code === REPOSITORY_TYPE[0].code
}

const getPersonalCoverage = userId => {
  return `User/${userId}/OWNER`
}

const getCoverage = (repositoryType, userId) => {
  return isPersonal(repositoryType)
    ? getPersonalCoverage(userId)
    : PUBLIC_COVERAGE
}

const computeSelectedFileSize = selectedFile => {
  let size = selectedFile.reduce(function (size, item) {
    return size + item.tech_info.source.size
  }, 0)
  return convertSizeToKB(size)
}

const foldAll = cata => { }

const initialState = {
  filter: {
    pageSize: 9,
    starIndex: 0,
    coverage: '', // 个人库查询把nd改成userId
    words: '',
    category: ''
  },
  list: [],
  selected: [],
  selectedFileSize: 0,
  repositoryTypes: REPOSITORY_TYPE,
  currentRepositoryType: REPOSITORY_TYPE[0], // 默认数组中的第一个库
  categorys: [],
  currentCategory: {},
  userId: -1,
  currentPage: 0,
  total: 0,
  totalPage: 0
}

const reducer = handleActions(
  {
    /**
     * 初始化(根据页面参数初始化state)
     */
    [actionTypes.INIT](state, { payload: { option, userId } }) {
      option = JSON.parse(option)
      const newState = cloneDeep(assign({}, state, initialState))
      newState.userId = userId
      newState.option = option
      newState.categorys = option.categorys.map(category => {
        let name = category.name.toUpperCase()
        return {
          name,
          code: CATEGORY[name],
          label: CATEGORY_LABEL[name],
          multiple: category.multiple || option.multiple,
          isOpen: false
        }
      })
      newState.filter.category = newState.categorys[0].code
      newState.currentCategory = find(newState.categorys,
        item => item.code === newState.filter.category
      )
      newState.currentCategory.isOpen = true // 默认展开当前类型的列表
      newState.filter.coverage = getCoverage(
        newState.currentRepositoryType,
        newState.userId
      )
      return newState
    },
    /**
     * 切换库
     */
    [actionTypes.SWITCH_REPOSITORY](state, { payload: repositoryType }) {
      const newState = cloneDeep(state)
      newState.currentRepositoryType = repositoryType
      newState.filter.coverage = getCoverage(repositoryType, newState.userId)
      newState.filter.starIndex = 0
      newState.currentPage = 0
      newState.currentCategory.isOpen = true
      return newState
    },
    /**
     * 修改搜索关键字
     */
    [actionTypes.CHANGE_SEARCH_KEY](state, { payload: words }) {
      if (isEqual(words, state.filter.words)) {
        return state
      }
      const newState = cloneDeep(state)
      newState.filter.words = words
      return newState
    },
    /**
     * 切换素材类别
     */
    [actionTypes.SWITCH_ASSETS_CATEGORY](state, { payload: categoryCode }) {
      const newState = cloneDeep(state)
      if (isEqual(categoryCode, newState.filter.category)) {
        newState.currentCategory.isOpen = !newState.currentCategory.isOpen
        return newState
      }

      newState.filter.category = categoryCode
      newState.categorys.forEach(item => {
        item.isOpen = false
      })
      newState.currentCategory = find(newState.categorys,
        item => item.code === categoryCode
      )
      newState.currentCategory.isOpen = true
      if (!newState.option.crosscategory) {
        newState.selected = []
        newState.list = []
      }
      newState.selectedFileSize = computeSelectedFileSize(newState.selected)
      newState.filter.starIndex = 0
      newState.currentPage = 0
      return newState
    },
    /**
     * 获取列表
     */
    [actionTypes.GET_ASSETS_LIST](state, { payload: resp }) {
      const newState = cloneDeep(state)
      let items = resp.data.items || []
      if (items.length > 0) { // 过滤
        let type
        switch (resp.category) {
          case CATEGORY.AUDIO:
            type = TypeEnum.audio
            break
          case CATEGORY.DOCUMENT:
            type = TypeEnum.document
            break
          case CATEGORY.IMAGE:
            type = TypeEnum.image
            break
        }
        if (type) {
          // items = filter(items, item => {
          //   return getTypeFromMimeType(item.tech_info.href.format) === type
          // })

          forEach(items, (item, i) => {
            const selectable = getTypeFromMimeType(item.tech_info.href.format) === type
            item.selectable = selectable
          })
        }
      }

      newState.total = resp.data.total
      let totalPage = resp.data.total / newState.filter.pageSize
      if (resp.data.total % newState.filter.pageSize !== 0) {
        totalPage = totalPage + 1
      }
      newState.totalPage = Math.floor(totalPage)

      newState.list = items.map(item => {
        item._selected = some(state.selected,
          d => d.identifier === item.identifier
        )
        return item
      })
      return newState
    },
    /**
     * 上一页
     *
     */
    [actionTypes.PREV_PAGE](state) {
      const newState = cloneDeep(state)
      if (newState.currentPage === 0) {
        newState.filter.starIndex = 0
        return newState
      }
      newState.currentPage -= 1
      newState.filter.starIndex = newState.currentPage * newState.filter.pageSize + 1
      return newState
    },
    /**
     * 下一页
     *
     */
    [actionTypes.NEXT_PAGE](state) {
      const newState = cloneDeep(state)
      newState.currentPage += 1
      newState.filter.starIndex = newState.currentPage * newState.filter.pageSize + 1
      return newState
    },
    /**
     * 添加选中项
     * @type {Function}
     */
    [actionTypes.ADD_SELECT_ITEM](state, { payload: selectItem }) {
      if (some(state.selected, d => d.identifier === selectItem.identifier)) {
        return state
      }
      const newState = cloneDeep(state)
      // 不允许多选
      if (!state.currentCategory.multiple) {
        newState.selected = []
      }
      newState.list = newState.list.map(listItem => {
        // 不允许多选，选择状态要还原
        if (!state.currentCategory.multiple) {
          listItem._selected = false
        }
        if (listItem.identifier === selectItem.identifier) {
          listItem._selected = true
          selectItem = cloneDeep(selectItem)
          newState.selected.push(selectItem)
        }
        return listItem
      })

      newState.selectedFileSize = computeSelectedFileSize(newState.selected)

      return newState
    },
    /**
     * 移除选中项
     */
    [actionTypes.REMOVE_SELECT_ITEM](state, { payload: item }) {
      let position = 0
      state.selected.forEach((d, i) => {
        if (d.identifier === item.identifier) {
          position = i
        }
      })
      if (position === -1) {
        return state
      }

      const newState = cloneDeep(state)
      newState.selected.splice(position, 1)
      newState.list = newState.list.map(l => {
        if (l.identifier === item.identifier) {
          l._selected = false
        }
        return l
      })

      newState.selectedFileSize = computeSelectedFileSize(newState.selected)

      return newState
    }
  },
  initialState
)

export { CATEGORY, reducer }
