import api from 'utils/api';
import { createActions } from 'redux-actions';

// tab切换
export const INFO_COLLEECTION_LIST_SELECT_TAB = 'INFO_COLLEECTION_LIST_SELECT_TAB';
// 信息收集列表(收集中)
export const FETCH_INFO_COLLEECTION_LIST_INVALIDATE = 'FETCH_INFO_COLLEECTION_LIST_INVALIDATE';
export const FETCH_INFO_COLLEECTION_LIST_REQUEST = 'FETCH_INFO_COLLEECTION_LIST_REQUEST';
export const FETCH_INFO_COLLEECTION_LIST_FAILURE = 'FETCH_INFO_COLLEECTION_LIST_FAILURE';
export const FETCH_INFO_COLLEECTION_LIST_SUCCESS = 'FETCH_INFO_COLLEECTION_LIST_SUCCESS';
// // 信息收集列表（历史）
// export const FETCH_INFO_COLLEECTION_HISTORY_REQUEST = 'FETCH_INFO_COLLEECTION_HISTORY_REQUEST';
// export const FETCH_INFO_COLLEECTION_HISTORY_FAILURE = 'FETCH_INFO_COLLEECTION_HISTORY_FAILURE';
// export const FETCH_INFO_COLLEECTION_HISTORY_SUCCESS = 'FETCH_INFO_COLLEECTION_HISTORY_SUCCESS';
// 信息收集获取
export const FETCH_INFO_COLLEECTION_GET_REQUEST = 'FETCH_INFO_COLLECTION_GET_REQUEST';
export const FETCH_INFO_COLLEECTION_GET_FAILURE = 'FETCH_INFO_COLLECTION_GET_FAILURE';
export const FETCH_INFO_COLLEECTION_GET_SUCCESS = 'FETCH_INFO_COLLECTION_GET_SUCCESS';
// 信息收集保存
export const FETCH_INFO_COLLEECTION_SAVE_REQUEST = 'FETCH_INFO_COLLECTION_SAVE_REQUEST';
export const FETCH_INFO_COLLEECTION_SAVE_FAILURE = 'FETCH_INFO_COLLECTION_SAVE_FAILURE';
export const FETCH_INFO_COLLEECTION_SAVE_SUCCESS = 'FETCH_INFO_COLLECTION_SAVE_SUCCESS';

const {
  // fectchInfoCollectionListRequest,
  // fectchInfoCollectionListFailure,
  // fectchInfoCollectionListSuccess,
  // fectchInfoCollectionHistoryRequest,
  // fectchInfoCollectionHistoryFailure,
  // fectchInfoCollectionHistorySuccess,
  fectchInfoCollectionGetRequest,
  fectchInfoCollectionGetFailure,
  fectchInfoCollectionGetSuccess,
  fectchInfoCollectionSaveRequest,
  fectchInfoCollectionSaveFailure,
  fectchInfoCollectionSaveSuccess,
} = createActions(
  FETCH_INFO_COLLEECTION_LIST_REQUEST,
  FETCH_INFO_COLLEECTION_LIST_FAILURE,
  FETCH_INFO_COLLEECTION_LIST_SUCCESS,
  // FETCH_INFO_COLLEECTION_HISTORY_REQUEST,
  // FETCH_INFO_COLLEECTION_HISTORY_FAILURE,
  // FETCH_INFO_COLLEECTION_HISTORY_SUCCESS,
  FETCH_INFO_COLLEECTION_GET_REQUEST,
  FETCH_INFO_COLLEECTION_GET_FAILURE,
  FETCH_INFO_COLLEECTION_GET_SUCCESS,
  FETCH_INFO_COLLEECTION_SAVE_REQUEST,
  FETCH_INFO_COLLEECTION_SAVE_FAILURE,
  FETCH_INFO_COLLEECTION_SAVE_SUCCESS,
);

// tabId: 0: 收集中; 1: 我的历史

function requestFetchData(tabId) {
  return {
    type: FETCH_INFO_COLLEECTION_LIST_REQUEST,
    tabId,
  };
}

function successFetchData({
  tabId,
  items,
  lastItemId, // -1: 没有数据了; 0：首页
  pageSize,
}) {
  return {
    type: FETCH_INFO_COLLEECTION_LIST_SUCCESS,
    tabId,
    items,
    lastItemId,
    pageSize,
  };
}

function failureFetchData({
  tabId,
  error,
}) {
  return {
    type: FETCH_INFO_COLLEECTION_LIST_FAILURE,
    tabId,
    error,
  };
}

function shouldFetchData(state, tabId) {
  const tab = state.infoCollection.tabs[tabId];
  if (!tab) {
    return true;
  }
  if (tab.isFetching) {
    return false;
  }
  return true;
}

function fetchData({ tabId, lastItemId, pageSize }) {
  const url = '/account/infos/forms/';
  return (dispatch, getState) => {
    if (shouldFetchData(getState(), tabId)) {
      dispatch(requestFetchData(tabId));
      return api({
        method: 'GET',
        url,
        params: {
          status: tabId,
          last_item_id: lastItemId,
          page_size: pageSize,
          r: Math.random(),
        },
      }).then((res) => {
        dispatch(successFetchData({
          tabId,
          items: res.data,
          lastItemId,
          pageSize,
        }));
      }).catch((res) => {
        dispatch(failureFetchData({
          tabId,
          error: res.response.data.message,
        }));
      });
    }
    return null;
  };
}

function selectTab(tabId) {
  return {
    type: INFO_COLLEECTION_LIST_SELECT_TAB,
    tabId,
  };
}


// 获取信息收集列表（收集中）


// // 获取信息收集列表（历史）
// export function fectchInfoCollectionHistory(params) {
//   const url = 'infos/forms/';
//   return (dispatch) => {
//     dispatch(fectchInfoCollectionHistoryRequest());
//     api({
//       method: 'GET',
//       url,
//       params: {
//         status: params.status,
//         // last_item_id: 0,
//         page_size: 100,
//         r: Math.random(),
//       },
//     }).then((res) => {
//       dispatch(fectchInfoCollectionHistorySuccess(res.data));
//     }).catch((err) => {
//       dispatch(fectchInfoCollectionHistoryFailure(err.response.data));
//     });
//   };
// }

// 获取信息收集详情
function fectchInfoCollectionGet(params) {
  const url = `/account/infos/forms/${params.id}`;
  return (dispatch) => {
    dispatch(fectchInfoCollectionGetRequest());
    api({
      method: 'GET',
      url,
      r: Math.random(),
    }).then((res) => {
      dispatch(fectchInfoCollectionGetSuccess(res.data));
    }).catch((err) => {
      dispatch(fectchInfoCollectionGetFailure(err.response.data));
    });
  };
}

// 提交信息收集详情
function fectchInfoCollectionSave(data) {
  const url = '/account/infos/forms/content';
  return (dispatch) => {
    dispatch(fectchInfoCollectionSaveRequest());
    api({
      method: 'POST',
      url,
      data,
    }).then((res) => {
      dispatch(fectchInfoCollectionSaveSuccess(res.data));
    }).catch((err) => {
      dispatch(fectchInfoCollectionSaveFailure(err.response.data));
    });
  };
}

export default {
  selectTab,
  fetchData,
  fectchInfoCollectionGet,
  fectchInfoCollectionSave,
};
