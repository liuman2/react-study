import api from 'utils/api';
import Cookie from 'tiny-cookie';
import defaultAvatar from 'img/avatar.png';
import {
  FETCH_ACCOUNT_USER_REQUEST,
  FETCH_ACCOUNT_USER_FAILURE,
  FETCH_ACCOUNT_USER_SUCCESS,
  FETCH_ACCOUNT_BIZ_REQUEST,
  FETCH_ACCOUNT_BIZ_FAILURE,
  FETCH_ACCOUNT_BIZ_SUCCESS,
  INIT_ACCOUNT_USER,
  SET_ACCOUNT_USER_PHONE,
} from '../dxConstants/action-types/account';

function fetchUserFailure(err) {
  return {
    type: FETCH_ACCOUNT_USER_FAILURE,
    err,
  };
}

function fetchUserSuccess(info) {
  return {
    type: FETCH_ACCOUNT_USER_SUCCESS,
    info,
  };
}

export function initUser() {
  return dispatch => dispatch({ type: INIT_ACCOUNT_USER });
}

export function fetchUser() {
  return (dispatch) => {
    dispatch({
      type: FETCH_ACCOUNT_USER_REQUEST,
    });
    return api({
      method: 'GET',
      url: '/account/account/getLoginInfo',
    })
    .then((res) => {
      // 云图统计
      if (res.data.user_id && CloudAtlas) {
        CloudAtlas.onProfileSignIn(String(res.data.user_id));
      }
      const data = res.data || {};
      if (res.data.modules && res.data.modules.mall) {
        Cookie.set('mallIcon', res.data.modules.mall);
      } else {
        Cookie.set('mallIcon', true);
      }
      dispatch(fetchUserSuccess({
        id: {
          staff: data.staff_id,
          user: data.user_id,
        },
        is: {
          admin: data.is_sys_admin,
        },
        name: data.person_name,
        avatar: (data.header_url && data.header_url.length > 0 ? data.header_url : defaultAvatar),
        telephone: data.binded_mobile_phone,
        department: data.dept_name,
        modules: data.modules || null,
        tenantCode: data.tenant_code || '',
        logoUrl: data.logo_url || '',
        hasManagementCenter: data.is_have_admin_center || false,
        bindMobilePhoneSwitch: data.is_bind_mobile_phone_switch || false,
      }));
    })
    .catch((err) => {
      dispatch(fetchUserFailure(err.response.data));
      throw new Error(JSON.stringify(err.response.data));
    });
  };
}

function fetchBizFailure(err) {
  return {
    type: FETCH_ACCOUNT_BIZ_FAILURE,
    err,
  };
}

function fetchBizSuccess(info) {
  return {
    type: FETCH_ACCOUNT_BIZ_SUCCESS,
    info,
  };
}

export function fetchBiz() {
  return (dispatch) => {
    dispatch({
      type: FETCH_ACCOUNT_BIZ_REQUEST,
    });
    return api({
      method: 'GET',
      url: '/mall/accounts',
    })
    .then((res) => {
      const data = res.data || {};
      dispatch(fetchBizSuccess({
        id: data.accountId,
        name: data.tenant_name,
        balance: data.balance,
      }));
    })
    .catch((err) => {
      dispatch(fetchBizFailure(err.response.data));
      throw new Error(JSON.stringify(err.response.data));
    });
  };
}

export function setUserPhone(telephone) {
  return {
    type: SET_ACCOUNT_USER_PHONE,
    telephone,
  };
}
