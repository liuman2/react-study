import {
  FETCH_STUDY_ROUTE_LIST_REQUEST,
  FETCH_STUDY_ROUTE_LIST_SUCCESS,
  FETCH_STUDY_ROUTE_DETAIL_REQUEST,
  FETCH_STUDY_ROUTE_DETAIL_SUCCESS,
  FETCH_STUDY_ROUTE_POINTS_REQUEST,
  FETCH_STUDY_ROUTE_POINTS_SUCCESS,
} from '../dxActions/study-route';

const initialState = {
  isFetching: false,
  routes: [],
  userInfo: {},
  route: {},
  phases: [],
  points: [],
  phaseInfo: {},
};

const studyRoute = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case FETCH_STUDY_ROUTE_LIST_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case FETCH_STUDY_ROUTE_LIST_SUCCESS:
      {
        const routes = payload.page_items;
        const userInfo = {
          department: payload.department_name,
          avatar: payload.img_url,
          passTotalNum: payload.pass_total_num,
          positionCreateTime: payload.position_create_time,
          studyProcessList: payload.study_process_list,
          name: payload.user_name,
        };

        return Object.assign({}, state, {
          isFetching: false,
          routes,
          userInfo,
        });
      }
    case FETCH_STUDY_ROUTE_DETAIL_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case FETCH_STUDY_ROUTE_DETAIL_SUCCESS:
      {
        const phases = payload.items;
        const route = {
          description: payload.route_description,
          name: payload.route_name,
          revoked: payload.revoked,
        };

        return Object.assign({}, state, {
          isFetching: false,
          phases,
          route,
        });
      }
    case FETCH_STUDY_ROUTE_POINTS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case FETCH_STUDY_ROUTE_POINTS_SUCCESS:
      {
        const points = payload.items;
        const phaseInfo = {
          name: payload.name,
          passedNum: payload.passed_num,
          totalNum: payload.total_num,
          revoked: payload.revoked,
        };

        return Object.assign({}, state, {
          isFetching: false,
          points,
          phaseInfo,
        });
      }
    default:
      return state;
  }
};

export default studyRoute;
