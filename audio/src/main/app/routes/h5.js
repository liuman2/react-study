import React from 'react'
import {Router, Route, IndexRoute} from 'react-router'
import Intl from 'i18n/intl'
import CoursewarePreview from 'modules/h5/coursewarePreview/CoursewarePreview'
import CoursewareSave from 'modules/h5/coursewareSave/CoursewareSave'
import ResourceRepository from 'modules/h5/resourceRepository/ResourceRepository'
const ImagesExchange = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('modules/h5/imagesExchange/ImagesExchange'))
  }, 'ImagesExchange')
}

const CoursewareEdit = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('modules/h5/coursewareEdit/CoursewareEdit'))
  }, 'CoursewareEdit')
}

// const coursewarePreview = (location, callback) => {
//   require.ensure([], require => {
//     callback(null, require('modules/h5/coursewarePreview/CoursewarePreview'))
//   }, 'CoursewarePreview')
// }

// const coursewareSave = (location, callback) => {
//   require.ensure([], require => {
//     callback(null, require('modules/h5/coursewareSave/CoursewareSave'))
//   }, 'CoursewareSave')
// }
// onEnter={(nextState, replace, done) => requireAuth(nextState, replace, done, store)}
export default (history, store) => (
  <Router history={history}>
    <Route path='/' component={Intl}>
      <IndexRoute getComponent={CoursewareEdit} />
    </Route>
    <Route path='/edit' getComponent={CoursewareEdit} />
    <Route path='/save' component={CoursewareSave} />
    <Route path='/preview' component={CoursewarePreview} />
    <Route path='/images-exchange' getComponent={ImagesExchange} />
    <Route path='/resource-repository' component={ResourceRepository} />
  </Router>
)
