import React, { PropTypes } from 'react'
import CoursewareHeaderUploader from './CoursewareHeaderUploader'
import SaveCourseware from '../courseware-save/SaveCourseware'
import classnames from 'classnames'
import Toast from 'components/toast'

class CoursewareEditerHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    pages: PropTypes.array,
    timepoints: PropTypes.array,
    isSingle: PropTypes.bool,
    identifier: PropTypes.string,
    preivew: PropTypes.fun
  }
  constructor(props) {
    super(props)
    this.afterSaveOperate = undefined // func：保存成功后的操作
    this.state = {
      saveVisible: false,
      isPreview: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.afterSaveOperate && nextProps.pages.length === 0 && this.props.pages.length > 0) {
      // 执行保存成功后的操作
      this.afterSaveOperate()
      this.afterSaveOperate = undefined
    }
  }

  toSave = afterOperate => {
    const { pages, timepoints, isSingle } = this.props
    if (pages.length === 0) {
      return
    }
    if (!isSingle) {
      const hasStartTimePoints = timepoints.filter(function (t, i) {
        return t.startTime !== undefined && t.startTime !== ''
      })
      let startTimeArr = []
      if (hasStartTimePoints.length) {
        for (let i = 0; i < hasStartTimePoints.length; i++) {
          const { startTime } = hasStartTimePoints[i]
          const t = Math.floor(startTime / 1000)
          if (startTimeArr.indexOf(t) < 0) {
            startTimeArr.push(t)
          }
        }
      }
      if (startTimeArr.length !== hasStartTimePoints.length) {
        alert('存在重复的时间标签，请重现设置')
        return
      }
    }

    this.afterSaveOperate = afterOperate
    this.setState({
      saveVisible: true,
      isPreview: false
    })
  }

  onSaveCancel = () => {
    this.setState({
      saveVisible: false
    })
  }

  preview = afterOperate => {
    // if (this.props.pages.length === 0) return
    // Toast('敬请期待!')
    const { pages, identifier, preivew } = this.props
    if (pages.length === 0) {
      return
    }
    if (identifier === '' || identifier === undefined) {
      return
    }
    preivew()
  }

  render() {
    const { title, pages, identifier } = this.props
    const { saveVisible, isPreview } = this.state
    return <div className='ac-ui-layout__header ac-ui-layout__header--fix'>
      <SaveCourseware visible={saveVisible} onCancel={this.onSaveCancel} />
      <div className='ac-ui-header'>
        <i className='ac-ui-icon ac-ui-icon-logo' />
        <div className='ac-ui-header__title'>
          <p className='ac-ui-header__title-main'>有声课件编辑器</p>
          <p className='ac-ui-header__title-sub'>AUDIO COURSEWARE EDITOR</p>
        </div>
        <div className='ac-ui-header__center'>
          <span className='ac-ui-header__center-txt'>{title}</span>
        </div>
        <div className='ac-ui-header__btn-wrap'>
          <CoursewareHeaderUploader saveCourseware={this.toSave} disabled={!!identifier} />
          <div className={classnames(
            'ac-ui-dropdown ac-ui-dropdown--no-drop',
            {
              'ac-ui-dropdown--disabled': pages.length === 0 || identifier !== ''
            }
          )} onClick={() => this.toSave()}>
            {/* <!-- ac-ui-dropdown 加类 ac-ui-dropdown--open表示选中 --> */}
            <span className='ac-ui-dropdown-top'>
              <i className='ac-dropdown-icon icon-save' />
              <span className='ac-ui-dropdown__txt'>
                保存
            </span>
            </span>
          </div>
          <div style={{ width: '132px' }}
            className={classnames(
              'ac-ui-dropdown ac-ui-dropdown--no-drop',
              {
                'ac-ui-dropdown--disabled': (pages.length === 0 || (identifier === '' || identifier === undefined))
              }
            )} onClick={() => this.preview()}>
            {/* <!-- ac-ui-dropdown 加类 ac-ui-dropdown--open展开下拉菜单 --> */}
            <span className='ac-ui-dropdown-top'>
              <i className='ac-dropdown-icon icon-preview' />
              <span className='ac-ui-dropdown__txt'>
                播放
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  }
}

export default CoursewareEditerHeader
