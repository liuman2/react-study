import thunk from 'redux-thunk';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { routerReducer } from 'react-router-redux';

import * as reducers from './reducers';
import languageReducer from '../../i18n/LanguageProvider/reducer';

const middleware = [thunk];

const enhancers = [];
if (__DEV__) {
  const devToolsExtension = window.devToolsExtension;
  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const rootReducer = combineReducers({
  ...reducers,
  routing: routerReducer,
  language: languageReducer,
});

export function configureStore(initialState = {}) {
  const store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(...middleware),
      ...enhancers,
    ),
  );

  if (module.hot) {
    module.hot.accept(() => {
      const nextReducer = require('./reducers').default; //eslint-disable-line
      const nextRootReducer = combineReducers({
        ...nextReducer,
        routing: routerReducer,
        language: languageReducer,
      });
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}



export default configureStore;
