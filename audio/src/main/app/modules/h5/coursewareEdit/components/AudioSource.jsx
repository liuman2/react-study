import React, { Component } from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import { push } from 'react-router-redux/lib/actions'
import { h5BottomTypeSet } from 'modules/courseware-audio-editer/actions/courseware-action-creator'
import UploadCourseware from 'modules/h5/share/uploadCourseware/UploadCourseware'

const CATEGORYS = [
  {
    name: 'audio'
  }
]

@connect(state => ({
  pages: state.coursewareAudioEditer.courseware.pages,
  userId: state.coursewareAudioEditer.userInfo.user_id
}), {
  h5BottomTypeSet,
  push
})
export default class AudioSource extends Component {
  static propTypes = {
    h5BottomTypeSet: React.PropTypes.func,
    pages: React.PropTypes.array,
    push: React.PropTypes.func,
    userId: React.PropTypes.number
  }
  constructor(props) {
    super(props)
    this.state = {
      isDisabled: false,
      uploadVisible: false
    }
  }
  componentDidMount() {
    this.setState({
      isDisabled: this.props.pages.length === 0
    })
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.pages.length !== this.props.pages.length) {
      this.setState({
        isDisabled: nextProps.pages.length === 0
      })
    }
  }
  handleChangeType = (type) => {
    if (this.state.isDisabled) return
    this.props.h5BottomTypeSet(type)
  }
  handleOpenRepository = () => {
    this.props.push({
      pathname: '/resource-repository',
      query: {
        backUrl: '/',
        userid: this.props.userId,
        option: JSON.stringify({
          multiple: false,
          crosscategory: false,
          categorys: CATEGORYS
        })
      }
    })
  }
  handleOpenUpload = () => {
    if (this.state.isDisabled) return
    this.setState(preState => {
      return {
        uploadVisible: !preState.uploadVisible
      }
    })
  }
  handleUploadAudioSuccess = () => {
    this.handleOpenUpload()
    this.handleChangeType(3)
  }
  render() {
    const {
      isDisabled,
      uploadVisible
    } = this.state
    return (
      <div className='upload--audio'>
        <ul className='upload--btn__list'>
          <li className='upload--btn__cell' onClick={() => { this.handleChangeType(1) }}>
            <a className={classnames(
              'ui-btn ui-btn__round',
              'type-record',
              {
                'disabled': isDisabled
              }
            )} />
            <p className='upload--btn__name'>开始录音</p>
          </li>
          <li className='upload--btn__cell' onClick={this.handleOpenUpload}>
            <a className={classnames(
              'ui-btn ui-btn__round',
              'type-audio',
              {
                'disabled': isDisabled
              }
            )} />
            <p className='upload--btn__name'>上传音频</p>
          </li>
        </ul>
        <p className='upload--audio__desc'>你可以对每一页进行录音或者上传音频</p>
        <UploadCourseware
          visible={uploadVisible}
          onClose={this.handleOpenUpload}
          onSuccess={this.handleUploadAudioSuccess}
          categorys={CATEGORYS}
          type='audio'
          backUrl='/'
        />
      </div>
    )
  }
}
