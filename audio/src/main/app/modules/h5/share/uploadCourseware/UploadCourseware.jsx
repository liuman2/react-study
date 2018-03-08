import React, { Component } from 'react'
import ResourceUploader from 'modules/courseware-audio-editer/components/resource-uploader/ResourceUploader'
import AudioUploader from 'modules/courseware-audio-editer/components/resource-uploader/AudioUploader'
import { push } from 'react-router-redux/lib/actions'
import { connect } from 'react-redux'
import uuid from 'uuid/v1'

function hasParent(element, target) {
  if (target === element) return true
  if (element === null) return false
  return hasParent(element.parentNode, target)
}
@connect(
  state => ({
    userId: state.coursewareAudioEditer.userInfo.user_id
  }),
  {
    push
  }
)
export default class UploadCourseware extends Component {
  static propTypes = {
    categorys: React.PropTypes.array, // 要导入的资源类型(image/document/audio), 可多个
    visible: React.PropTypes.bool,
    onClose: React.PropTypes.func,
    push: React.PropTypes.func,
    type: React.PropTypes.string,
    onSuccess: React.PropTypes.func,
    backUrl: React.PropTypes.string,
    userId: React.PropTypes.number
  }
  static defaultProps = {
    visible: false,
    onClose: () => {}
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      document.body.addEventListener('touchend', this.handleClickWrapper)
    } else {
      document.body.removeEventListener('touchend', this.handleClickWrapper)
    }
  }
  handleClickWrapper = e => {
    if (this.props.visible && !hasParent(e.target, this.refs.uploadPop)) {
      this.props.onClose()
    }
  }
  handleUploadSuccess = () => {
    this.props.push('/images-exchange')
    this.props.onClose()
  }

  handleClickResourceRepository = () => {
    const { push, categorys, onClose, backUrl } = this.props
    push({
      pathname: '/resource-repository',
      query: {
        backUrl: backUrl,
        userId: this.props.userId,
        option: JSON.stringify({
          multiple: false,
          crosscategory: false,
          categorys
          // categorys: [
          //   {
          //     name: 'document'
          //   },
          //   {
          //     name: 'image',
          //     multiple: true
          //   },
          //   {
          //     name: 'audio'
          //   }
          // ]
        })
      }
    })
    onClose()
  }

  render() {
    const { visible, type, onSuccess } = this.props
    const UPLOAD_ID = uuid()
    const uploadType = () => {
      if (type === 'image') {
        return (
          <ResourceUploader
            onSuccess={this.handleUploadSuccess}
            triggerLocalUploadDomId={UPLOAD_ID}
          />
        )
      } else if (type === 'audio') {
        return (
          <AudioUploader
            triggerLocalUploadDomId={UPLOAD_ID}
            onCompleteUpload={onSuccess}
          />
        )
      }
    }
    return (
      <div
        hidden={!visible}
        className='upload--choose'
        ref='uploadPop'
        style={{ zIndex: 100 }}
      >
        <ul className='choose--btn__list'>
          <li
            className='choose--btn__cell'
            onClick={this.handleClickResourceRepository}
          >
            <a className='ui-btn ui-btn__round type-resource' />
            <span className='choose--btn__name'>从资源库选择</span>
          </li>
          <li className='choose--btn__cell' id={UPLOAD_ID}>
            <a className='ui-btn ui-btn__round type-local' />
            <span className='choose--btn__name'>从本地上传</span>
          </li>
        </ul>
        {uploadType()}
      </div>
    )
  }
}
