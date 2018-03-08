import update from 'immutability-helper';
import { findPropEq, findIndexPropEq, findIndexEq, diffPropEq, pluck } from 'utils/fn';
import {
  FETCH_PUBLISHED_ELECTIVES_LIST_REQUEST,
  FETCH_PUBLISHED_ELECTIVES_LIST_SUCCESS,
  FETCH_PUBLISHED_ELECTIVES_LIST_FAILURE,
  FETCH_ELECTIVES_LIST_REQUEST,
  FETCH_ELECTIVES_LIST_SUCCESS,
  FETCH_ELECTIVES_LIST_FAILURE,
  RESET_PUBLISH_ELECTIVES_REDUX,
  UPDATE_PUBLISHED_ELECTIVES_LIST_REQUEST,
  UPDATE_PUBLISHED_ELECTIVES_LIST_SUCCESS,
  UPDATE_PUBLISHED_ELECTIVES_LIST_FAILURE,
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

const initialState = {
  isFetching: false,
  lastPublishedElectives: false,
  firstPublishedElectives: true,
  publishedElectives: [],
  lastElectives: false,
  firstElectives: true,
  electives: [],
  errMsg: '',
  updatedSuccess: false,
  selectedIds: [],
  selectedItems: [],
  count: 0,

  users: [],
  totalUsers: 0,
  departments: [],
  childDepartments: [],
  selectedCourses: [],
  selectedUsers: [],
  selectedDepartments: [],
};

let allPublishedElectives = [];
let allElectives = [];

function insertBySpell(user, users) {
  const index = users.findIndex(selectedUser => selectedUser.spell > user.spell);
  return index === -1
    ? [...users, user]
    : [...users.slice(0, index),
      user,
      ...users.slice(index),
    ];
}

function publishElectives(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case INIT_ELECTIVE_DISTRIBUTION:
      return initialState;
    case FETCH_PUBLISHED_ELECTIVES_LIST_REQUEST:
      return { ...state, isFetching: true };
    case FETCH_PUBLISHED_ELECTIVES_LIST_SUCCESS: {
      if (action.firstPublishedElectives) {
        allPublishedElectives = action.items;
        return {
          ...state,
          isFetching: false,
          lastPublishedElectives: action.lastPublishedElectives,
          publishedElectives: allPublishedElectives,
        };
      }
      allPublishedElectives = allPublishedElectives.concat(action.items);
      return {
        ...state,
        isFetching: false,
        lastPublishedElectives: action.lastPublishedElectives,
        publishedElectives: allPublishedElectives,
      };
    }
    case FETCH_PUBLISHED_ELECTIVES_LIST_FAILURE:
      return { ...state, isFetching: false, errMsg: action.err };
    case FETCH_ELECTIVES_LIST_REQUEST:
      return { ...state, isFetching: true };
    case FETCH_ELECTIVES_LIST_SUCCESS:
      if (action.firstElectives) {
        allElectives = action.items;
        return {
          ...state,
          isFetching: false,
          lastElectives: action.lastElectives,
          electives: allElectives,
        };
      }
      allElectives = allElectives.concat(action.items);
      return {
        ...state,
        isFetching: false,
        lastElectives: action.lastElectives,
        electives: allElectives,
      };
    case FETCH_ELECTIVES_LIST_FAILURE:
      return { ...state, isFetching: false, errMsg: action.err };
    case UPDATE_SELECTED_ELECTIVES:
      return {
        ...state,
        selectedIds: action.selectedIds,
        selectedItems: action.selectedItems,
        count: action.selectedIds.length,
      };
    case RESET_PUBLISH_ELECTIVES_REDUX:
      return {
        ...state,
        isFetching: false,
        lastPublishedElectives: false,
        lastElectives: false,
        updatedSuccess: false,
      };
    case RESET_SELECTED_ELECTIVES:
      return {
        ...state,
        selectedIds: [],
        selectedItems: [],
        count: 0,
      };
    case UPDATE_PUBLISHED_ELECTIVES_LIST_REQUEST:
      return { ...state, isFetching: true };
    case UPDATE_PUBLISHED_ELECTIVES_LIST_SUCCESS:
      return { ...state, isFetching: false, updatedSuccess: action.updatedSuccess };
    case UPDATE_PUBLISHED_ELECTIVES_LIST_FAILURE:
      return { ...state, isFetching: false, errMsg: action.err };
    case FETCH_ELECTIVE_USER_SUCCESS:
      return { ...state, users: payload };
    case PAGINATE_ELECTIVE_USER_SUCCESS:
      return update(state, { users: { $push: payload } });
    case SELECT_ELECTIVE_USER: {
      const userId = payload;
      const user = findPropEq('id', userId, state.users);
      const selectedUsers = insertBySpell(user, state.selectedUsers);
      return { ...state, selectedUsers };
    }
    case UNSELECT_ELECTIVE_USER: {
      const userId = payload;
      const index = findIndexPropEq('id', userId, state.selectedUsers);
      if (index === -1) return state;
      return update(state, { selectedUsers: { $splice: [[index, 1]] } });
    }
    case SELECT_ELECTIVE_USERS: {
      const { users, dept_id: deptId } = payload;
      const userLength = state.selectedUsers.length;
      if (userLength > 100) return state;
      const diffUsers = diffPropEq('id', users, state.selectedUsers);
      if (diffUsers.length + userLength > 100) return state;
      const sortedUsers = diffUsers.reduce((selectedUsers, user) =>
        insertBySpell(user, selectedUsers), state.selectedUsers);
      return update(state, {
        selectedUsers: { $set: sortedUsers },
        selectedDepartments: { $push: [deptId] },
      });
    }
    case UNSELECT_ELECTIVE_USERS: {
      const { users, dept_id } = payload;
      const ids = pluck('id', users);
      const selectedUsers = state.selectedUsers.filter(user => ids.indexOf(user.id) === -1);
      const index = findIndexEq(dept_id, state.selectedDepartments);
      return update(state, {
        selectedUsers: { $set: selectedUsers },
        selectedDepartments: { $splice: [[index, 1]] },
      });
    }
    case SELECT_ELECTIVE_DISTRIBUTION_DEPARTMENT: {
      const { department, users, childDepartments, totalUsers } = payload;
      let departments;
      if (state.departments.length === 0) departments = [department]; // 第一次从面包屑选择部门
      else {
        const index = findIndexPropEq('id', department.id, state.departments);
        departments = state.departments.slice(0, index + 1);
      }

      return {
        ...state,
        users,
        childDepartments,
        totalUsers,
        departments,
      };
    }
    case SELECT_ELECTIVE_DISTRIBUTION_CHILD_DEPARTMENT: {
      const { department, users, childDepartments, totalUsers } = payload;
      return {
        ...state,
        users,
        childDepartments,
        totalUsers,
        departments: state.departments.concat(department),
      };
    }
    default:
      return state;
  }
}

export default publishElectives;
