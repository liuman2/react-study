import { combineReducers } from 'redux';
import {
  INFO_COLLEECTION_LIST_SELECT_TAB,
  FETCH_INFO_COLLEECTION_LIST_REQUEST,
  FETCH_INFO_COLLEECTION_LIST_FAILURE,
  FETCH_INFO_COLLEECTION_LIST_SUCCESS,
  // FETCH_INFO_COLLEECTION_HISTORY_REQUEST,
  // FETCH_INFO_COLLEECTION_HISTORY_FAILURE,
  // FETCH_INFO_COLLEECTION_HISTORY_SUCCESS,
  // FETCH_INFO_COLLEECTION_GET_REQUEST,
  // FETCH_INFO_COLLEECTION_GET_FAILURE,
  // FETCH_INFO_COLLEECTION_GET_SUCCESS,
  // FETCH_INFO_COLLEECTION_SAVE_REQUEST,
  // FETCH_INFO_COLLEECTION_SAVE_FAILURE,
  // FETCH_INFO_COLLEECTION_SAVE_SUCCESS,
} from '../dxActions/info-collection';

function selected(state = 0, action) {
  switch (action.type) {
    case INFO_COLLEECTION_LIST_SELECT_TAB:
      return action.tabId;
    default:
      return state;
  }
}

// lastItemId: -1: 没有数据了; 0：首页

function tab(state = {
  isFetching: false,
  lastItemId: 0,
  pageSize: 20,
  items: [],
}, action) {
  switch (action.type) {
    case FETCH_INFO_COLLEECTION_LIST_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case FETCH_INFO_COLLEECTION_LIST_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.error,
      };
    case FETCH_INFO_COLLEECTION_LIST_SUCCESS: {
      const {
        items,
        lastItemId,
        pageSize,
      } = action;
      const newItems = lastItemId === 0 ? items : state.items.concat(items);
      let newLastItemId = items.length < pageSize ? -1 : items[items.length - 1].id;
      if (newItems.length === 0) {
        newLastItemId = 0;
      }
      return {
        ...state,
        isFetching: false,
        items: newItems,
        lastItemId: newLastItemId,
        pageSize,
      };
    }
    default:
      return state;
  }
}

function tabs(state = {}, action) {
  switch (action.type) {
    case FETCH_INFO_COLLEECTION_LIST_REQUEST:
    case FETCH_INFO_COLLEECTION_LIST_SUCCESS:
    case FETCH_INFO_COLLEECTION_LIST_FAILURE: {
      const { tabId } = action;
      return {
        ...state,
        [tabId]: tab(state[tabId], action),
      };
    }
    default:
      return state;
  }
}

const reducer = combineReducers({
  selected, // number
  tabs, // object
});

export default reducer;
