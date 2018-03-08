import {
  FETCH_ACCOUNT_USER_REQUEST,
  FETCH_ACCOUNT_USER_FAILURE,
  FETCH_ACCOUNT_USER_SUCCESS,
  INIT_ACCOUNT_USER,
  SET_ACCOUNT_USER_PHONE,
} from '../../dxConstants/action-types/account';

const initialState = {
  isFetching: false,
  didInvalidate: true,
  lastUpdated: null,
  err: null,
  id: {},
  is: {
    admin: false,
  },
  name: '',
  avatar: '',
  modules: null,
  tenantCode: '',
};
function user(state = initialState, action) {
  switch (action.type) {
    case INIT_ACCOUNT_USER:
      return initialState;
    case FETCH_ACCOUNT_USER_REQUEST:
      return { ...state, isFetching: true };
    case FETCH_ACCOUNT_USER_FAILURE:
      return { ...state, isFetching: false, err: action.err };
    case FETCH_ACCOUNT_USER_SUCCESS:
      return { ...state, isFetching: false, lastUpdated: new Date(), ...action.info };
    case SET_ACCOUNT_USER_PHONE:
      return Object.assign({}, state, { telephone: action.telephone });
    default:
      return state;
  }
}

export default user;
