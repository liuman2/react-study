import React, { PropTypes } from 'react'
import AudioUploaderModal from './AudioUploaderModal'
import classnames from 'classnames'
import { audioTypes } from '../../resource-uploader/TypeUtils'
import join from 'lodash/join'
import map from 'lodash/map'
import toUpper from 'lodash/toUpper'
import Modal from 'antd/lib/modal'
import RecorderTest from './RecorderTest'
import Recorder from './Recorder'

const SUPPORT_FORMAT = join(map(audioTypes, type => {
  return toUpper(type)
}), '/')
/**
 * 单页编辑-选择音频来源
 */
class SelectAudioSource extends Recorder {
  static propTypes = {
    editable: PropTypes.bool,
    openRecord: PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      recorderVisible: false
    }
  }

  onUploaderModalClose = () => {
    this.setState({
      modalVisible: false
    })
  }

  openUploaderModal = () => {
    if (!this.props.editable) {
      return
    }
    this.setState({
      modalVisible: true
    })
  }

  detectRecorderDevice = () => {
    // 录音设备检测
    this.setState(preState => {
      const _recorderVisible = preState.recorderVisible
      return {
        recorderVisible: !_recorderVisible
      }
    })
  }

  onCompleteUpload = () => {
    this.setState({
      modalVisible: false
    })
  }

  clickOpenRecorder = () => {
    const { openRecord } = this.props
    this.initRecorder().then(() => {
      openRecord()
    }, errObj => {})
  }

  render = () => {
    const { modalVisible, recorderVisible } = this.state
    const { editable } = this.props
    return <div className='ac-ui-tab__item-box'>
      {/* 录音检测 */}
      {/* <RecorderDetector /> */}
      {!modalVisible ? null : <AudioUploaderModal modalVisible={modalVisible} onModalClose={this.onUploaderModalClose} />}
      <div className='aut__btn-wrap'>
        <a className={classnames(
          'ac-ui-button-up-down aubud-recording',
          {'aubud--disabled': !editable}
        )} onClick={this.clickOpenRecorder} >
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>录制音频</span>
        </a>
        {/* <!-- ac-ui-button-up-down加类aubud--active表示选中,加类aubud--disabled表示按钮不可用 --> */}
        <a className={classnames(
          'ac-ui-button-up-down aubud-upload',
          {'aubud--disabled': !editable}
        )} onClick={this.openUploaderModal} >
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>上传音频</span>
        </a>
        {/* <!-- ac-ui-button-up-down加类aubud--active表示选中,加类aubud--disabled表示按钮不可用 --> */}
      </div>
      <div className={classnames(
        'aut__txt-wrap',
        {
          'aut__txt-wrap--disabled': !editable
        }
      )}>
        <p className='aut__txt-main'>
          你可以对每一页进行录音或者上传音频
        </p>
        <p className='aut__txt-sub'>
          支持{SUPPORT_FORMAT}格式的音频文件，大小控制在60M以内
        </p>
      </div>
      <a className={classnames(
        'ac-ui-button ac-ui-button--check',
        {}
      )} onClick={this.detectRecorderDevice} >录音设备检测</a>
      <Modal
        visible={recorderVisible}
        onCancel={this.detectRecorderDevice}
        title='录音设备检测'
        onOk={this.detectRecorderDevice}
        footer={null}
        wrapClassName='ac-fish-pop ac-pop-testing'
        width='1202px'
      >
        <RecorderTest handleCloseRecorderMoadl={this.detectRecorderDevice} isOpen={recorderVisible} />
      </Modal>
    </div>
  }
}

export default SelectAudioSource
