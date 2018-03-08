import React from 'react'
import { Router, Route, IndexRoute, Redirect } from 'react-router'
import Intl from 'i18n/intl'

const CoursewareEditerApp = (location, callback) => {
  require.ensure([], require => {
    callback(null, require('modules/courseware-audio-editer/index'))
  })
}

export default (history, store) => (
  <Router history={history}>
    <Route path='/' component={Intl}>
      <IndexRoute getComponent={CoursewareEditerApp} />
    </Route>
    <Redirect from='/*' to='/' />
  </Router>
)
