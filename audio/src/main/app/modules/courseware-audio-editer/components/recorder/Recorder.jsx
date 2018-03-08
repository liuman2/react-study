import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as coursewareActionCreators from '../../actions/courseware-action-creator'
import * as userinfoActionCreators from '../../actions/userinfo-action-creator'

const PropTypes = React.PropTypes

class Recorder extends React.Component {
  static propTypes = {
    changeTitle: PropTypes.func,
    loadUserInfo: PropTypes.func,
    title: PropTypes.string
  }

  _changeCoursewareTitle = () => this.props.changeTitle()

  _loadUserInfo = () => this.props.loadUserInfo()

  render() {
    const { title } = this.props
    return <span>
      录音器 + {title}
      <button onClick={this._changeCoursewareTitle}>（同步）改变标题</button>
      <button onClick={this._loadUserInfo}>（异步）加载用户数据</button>
    </span>
  }
}

export default connect((state) => {
  const coursewareEditerApp = state.coursewareAudioEditer
  return {
    title: coursewareEditerApp.courseware.title
  }
}, dispatch => {
  return {
    ...bindActionCreators(coursewareActionCreators, dispatch),
    ...bindActionCreators(userinfoActionCreators, dispatch)
  }
})(Recorder)
