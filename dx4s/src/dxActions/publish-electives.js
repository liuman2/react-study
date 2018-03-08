import api from 'utils/api';
import * as apis from '../pages/mobile/apis';

import {
  FETCH_PUBLISHED_ELECTIVES_LIST_FAILURE,
  FETCH_PUBLISHED_ELECTIVES_LIST_SUCCESS,
  FETCH_PUBLISHED_ELECTIVES_LIST_REQUEST,
  UPDATE_PUBLISHED_ELECTIVES_LIST_FAILURE,
  UPDATE_PUBLISHED_ELECTIVES_LIST_SUCCESS,
  UPDATE_PUBLISHED_ELECTIVES_LIST_REQUEST,
  FETCH_ELECTIVES_LIST_FAILURE,
  FETCH_ELECTIVES_LIST_SUCCESS,
  FETCH_ELECTIVES_LIST_REQUEST,
  RESET_PUBLISH_ELECTIVES_REDUX,
  UPDATE_SELECTED_ELECTIVES,
  RESET_SELECTED_ELECTIVES,
  FETCH_ELECTIVE_USER_SUCCESS,
  PAGINATE_ELECTIVE_USER_SUCCESS,
  SELECT_ELECTIVE_USER,
  UNSELECT_ELECTIVE_USER,
  SELECT_ELECTIVE_DISTRIBUTION_DEPARTMENT,
  SELECT_ELECTIVE_DISTRIBUTION_CHILD_DEPARTMENT,
  SELECT_ELECTIVE_USERS,
  UNSELECT_ELECTIVE_USERS,
  INIT_ELECTIVE_DISTRIBUTION,
} from '../dxConstants/action-types';

const size = 10;
let publishedElectivesIndex = 1;
let electivesIndex = 1;

// fetch published-electives list
export function fetchPublishedElectivesListFailure(err) {
  return {
    type: FETCH_PUBLISHED_ELECTIVES_LIST_FAILURE,
    err,
  };
}

export function fetchPublishedElectivesListSuccess(items, lastPublishedElectives, firstPublishedElectives) {
  return {
    type: FETCH_PUBLISHED_ELECTIVES_LIST_SUCCESS,
    items,
    lastPublishedElectives,
    firstPublishedElectives,
  };
}

export function fetchPublishedElectivesList(name = '', reset = false) {
  publishedElectivesIndex = reset ? 1 : publishedElectivesIndex;
  return (dispatch) => {
    dispatch({
      type: FETCH_PUBLISHED_ELECTIVES_LIST_REQUEST,
    });
    return api({
      method: 'GET',
      url: '/training/elective/list/published',
      params: { index: publishedElectivesIndex, size, name },
    })
      .then((res) => {
        publishedElectivesIndex += 1;
        const lastPublishedElectives = !res.data.length || res.data.length < size;
        dispatch(fetchPublishedElectivesListSuccess(res.data, lastPublishedElectives, reset));
      })
      .catch((err) => {
        dispatch(fetchPublishedElectivesListFailure(err.response.data.message));
      });
  };
}

export function reFetchPublishedElectivesList(name = '') {
  return fetchPublishedElectivesList(name, true);
}

// fetch electives list
export function fetchElectivesListFailure(err) {
  return {
    type: FETCH_ELECTIVES_LIST_FAILURE,
    err,
  };
}

export function fetchElectivesListSuccess(data, lastElectives, firstElectives) {
  return {
    type: FETCH_ELECTIVES_LIST_SUCCESS,
    items: data.items,
    lastElectives,
    firstElectives,
  };
}

export function fetchElectivesList(name = '', resource = '', reset = false) {
  electivesIndex = reset ? 1 : electivesIndex;
  return (dispatch) => {
    dispatch({
      type: FETCH_ELECTIVES_LIST_REQUEST,
    });
    return api({
      method: 'GET',
      url: '/training/elective/list/course/reference',
      params: { index: electivesIndex, size, name, resource },
    })
      .then((res) => {
        electivesIndex += 1;
        const lastElectives = !res.data.items.length || res.data.items.length < size;
        dispatch(fetchElectivesListSuccess(res.data, lastElectives, reset));
      })
      .catch((err) => {
        dispatch(fetchElectivesListFailure(err.response.data.message));
      });
  };
}

export function updateSelectElectives(ids, items) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_SELECTED_ELECTIVES,
      selectedIds: ids,
      selectedItems: items,
    });
  };
}

export function reFetchElectivesList(name = '', resource = '') {
  let searchName = name;
  if (typeof name === 'object') {
    searchName = '';
  }
  return fetchElectivesList(searchName, resource, true);
}

// update published-electives list
export function updatePublishedElectivesListFailure(err) {
  return {
    type: UPDATE_PUBLISHED_ELECTIVES_LIST_FAILURE,
    err,
  };
}

export function updatePublishedElectivesListSuccess(data, updatedSuccess) {
  return {
    type: UPDATE_PUBLISHED_ELECTIVES_LIST_SUCCESS,
    updatedSuccess,
  };
}

export function updatePublishedElectivesList(ids) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_PUBLISHED_ELECTIVES_LIST_REQUEST,
    });
    return api({
      method: 'PUT',
      url: '/training/elective/publish',
      data: { ids },
    })
      .then((res) => {
        dispatch(updatePublishedElectivesListSuccess(res.data, true));
      })
      .catch((err) => {
        dispatch(updatePublishedElectivesListFailure(err.response.data.message));
      });
  };
}

export function resetPublishElectivesRedux() {
  return (dispatch) => {
    dispatch({
      type: RESET_PUBLISH_ELECTIVES_REDUX,
    });
  };
}

export function resetSelectedElectives() {
  return (dispatch) => {
    dispatch({
      type: RESET_SELECTED_ELECTIVES,
    });
  };
}

// users & departments

async function fetchUsersThenDispatch(params, type, dispatch) {
  const { users: payload } = await apis.getUsers(params);
  dispatch({ type, payload });
  return payload;
}

export function fetchUsers(params) {
  return async function _fetch(dispatch) {
    return await fetchUsersThenDispatch(params, FETCH_ELECTIVE_USER_SUCCESS, dispatch);
  };
}

export function paginateUser(params) {
  return async function _fetch(dispatch) {
    return await fetchUsersThenDispatch(params, PAGINATE_ELECTIVE_USER_SUCCESS, dispatch);
  };
}

export function selectUser(userId) {
  return dispatch => dispatch({ type: SELECT_ELECTIVE_USER, payload: userId });
}

export function unselectUser(userId) {
  return dispatch => dispatch({ type: UNSELECT_ELECTIVE_USER, payload: userId });
}

async function fetchDeptAndUserThenDispatch(departmentId, type, dispatch) {
  const [deptData, userData] = await Promise.all([
    apis.getDepartments({ dept_id: departmentId }),
    apis.getUsers({ dept_id: departmentId, recursion: false }),
  ]);
  const { users, total_num: totalUsers } = userData;
  const { child_depts: childDepartments } = deptData;
  dispatch({
    type,
    payload: { department: deptData, users, childDepartments, totalUsers },
  });
  return { department: deptData, users };
}

export function selectDepartment(deptId) {
  return async function _fetchDepartmentAndUsers(dispatch) {
    return await fetchDeptAndUserThenDispatch(
      deptId,
      SELECT_ELECTIVE_DISTRIBUTION_DEPARTMENT,
      dispatch
    );
  };
}

export function selectChildDepartment(deptId) {
  return async function _selectChildDepartment(dispatch) {
    return await fetchDeptAndUserThenDispatch(
      deptId,
      SELECT_ELECTIVE_DISTRIBUTION_CHILD_DEPARTMENT,
      dispatch
    );
  };
}

async function fetchUserAndDispatch(param, type, dispatch) {
  const params = Object.assign({ recursion: true }, param);
  if (!params.recursion) Object.assign(params, { size: 9999 });
  const { users } = await apis.getUsers(params);
  dispatch({
    type,
    payload: { users, dept_id: params.dept_id },
  });
  return users;
}

// eslint-disable-next-line camelcase
async function fetchUserByDeptAndDispatch(params, type, dispatch) {
  return await fetchUserAndDispatch(params, type, dispatch);
}

export function selectUsersByDepartment(deptId, recursion = true) {
  return async function _fetchUserAndSelect(dispatch) {
    // TODO BUG 9999 is not releay recursion
    // TODO rename SELECT_COURSE_USERS
    const size = recursion ? 9999 : 100;
    return await fetchUserByDeptAndDispatch(
      { dept_id: deptId, recursion, size }, SELECT_ELECTIVE_USERS, dispatch
    );
  };
}

export function unselectUsersByDepartment(deptId, recursion = true) {
  return async function _fetchUserAndUnselect(dispatch) {
    return await fetchUserByDeptAndDispatch(
      { dept_id: deptId, recursion }, UNSELECT_ELECTIVE_USERS, dispatch
    );
  };
}

export function publishElectives(data) {
  return async function _publishElectives() {
    return await apis.publishElectives(data);
  };
}

export function initElectiveDistribution() {
  return dispatch => dispatch({ type: INIT_ELECTIVE_DISTRIBUTION });
}

