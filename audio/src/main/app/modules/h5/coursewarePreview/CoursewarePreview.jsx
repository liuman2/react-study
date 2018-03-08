import React, { Component } from 'react'
import {connect} from 'react-redux'
import { push } from 'react-router-redux/lib/actions'
import Header from 'modules/h5/share/header'

@connect(state => ({}), {
  push
})
export default class CoursewarePreview extends Component {
  static propTypes = {
    push: React.PropTypes.func
  }
  render() {
    return (
      <div className='layout-wrapper'>
        <Header
          title='试听播放'
          rightBtnText='保存'
          rightBtnAction={() => { this.props.push('/save') }}
        />
        关联其它案子
      </div>
    )
  }
}
