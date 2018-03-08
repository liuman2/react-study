import { combineReducers } from 'redux'
import { reducer as coursewareReducer } from './courseware-reducer'
import { reducer as imagereorderReducer } from './imagereorder-reducer'
import { reducer as audioConfigReducer } from './audio-config-reducer'
import { reducer as userinfoReducer } from './userinfo-reducer'
import { reducer as editerEnvReducer } from './editer-env-reducer'
import { reducer as resourceRepositoryReducer } from './resource-repository-reducer'

const finalReducers = {
  courseware: coursewareReducer,
  imagereorder: imagereorderReducer,
  audioConfig: audioConfigReducer,
  userInfo: userinfoReducer,
  editerEnv: editerEnvReducer,
  resourceRepository: resourceRepositoryReducer
}

export const reducer = combineReducers(finalReducers)
