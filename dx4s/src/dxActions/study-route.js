import api from 'utils/api';

import { createActions } from 'redux-actions';

// fetch study route list type
export const FETCH_STUDY_ROUTE_LIST_REQUEST = 'FETCH_STUDY_ROUTE_LIST_REQUEST';
export const FETCH_STUDY_ROUTE_LIST_FAILURE = 'FETCH_STUDY_ROUTE_LIST_FAILURE';
export const FETCH_STUDY_ROUTE_LIST_SUCCESS = 'FETCH_STUDY_ROUTE_LIST_SUCCESS';

// fetch study route list type
export const FETCH_STUDY_ROUTE_DETAIL_REQUEST = 'FETCH_STUDY_ROUTE_DETAIL_REQUEST';
export const FETCH_STUDY_ROUTE_DETAIL_FAILURE = 'FETCH_STUDY_ROUTE_DETAIL_FAILURE';
export const FETCH_STUDY_ROUTE_DETAIL_SUCCESS = 'FETCH_STUDY_ROUTE_DETAIL_SUCCESS';

// fetch study route list type
export const FETCH_STUDY_ROUTE_POINTS_REQUEST = 'FETCH_STUDY_ROUTE_POINTS_REQUEST';
export const FETCH_STUDY_ROUTE_POINTS_FAILURE = 'FETCH_STUDY_ROUTE_POINTS_FAILURE';
export const FETCH_STUDY_ROUTE_POINTS_SUCCESS = 'FETCH_STUDY_ROUTE_POINTS_SUCCESS';


export const {
  fetchStudyRouteListRequest,
  fetchStudyRouteListSuccess,
  fetchStudyRouteDetailRequest,
  fetchStudyRouteDetailSuccess,
  fetchStudyRoutePointsRequest,
  fetchStudyRoutePointsSuccess,
} = createActions(
  FETCH_STUDY_ROUTE_LIST_REQUEST,
  FETCH_STUDY_ROUTE_LIST_SUCCESS,
  FETCH_STUDY_ROUTE_DETAIL_REQUEST,
  FETCH_STUDY_ROUTE_DETAIL_SUCCESS,
  FETCH_STUDY_ROUTE_POINTS_REQUEST,
  FETCH_STUDY_ROUTE_POINTS_SUCCESS,
);


function fetchStudyRouteList() {
  const url = '/training/study-route/h5/list';
  return (dispatch) => {
    dispatch(fetchStudyRouteListRequest());
    return api({
      method: 'GET',
      url,
    }).then((res) => {
      dispatch(fetchStudyRouteListSuccess(res.data));
    });
  };
}

function fetchStudyRouteDetail(params) {
  const { routeId } = params;
  const url = `/training/study-route/h5/detail/${routeId}`;
  return (dispatch) => {
    dispatch(fetchStudyRouteDetailRequest());
    return api({
      method: 'GET',
      url,
    }).then((res) => {
      dispatch(fetchStudyRouteDetailSuccess(res.data));
    });
  };
}

function fetchStudyRoutePoints(params) {
  const { phaseId } = params;
  const url = `/training/study-route/h5/phase/detail/${phaseId}`;
  return (dispatch) => {
    dispatch(fetchStudyRoutePointsRequest());
    return api({
      method: 'GET',
      url,
    }).then((res) => {
      dispatch(fetchStudyRoutePointsSuccess(res.data));
    });
  };
}

export default {
  fetchStudyRouteList,
  fetchStudyRouteDetail,
  fetchStudyRoutePoints,
};
