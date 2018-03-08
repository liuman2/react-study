import React, { PropTypes } from 'react'
import AudioUploader from '../../resource-uploader/AudioUploader'
import uuid from 'uuid/v1'
import Modal from 'antd/lib/modal'
import Button from 'antd/lib/button'

/**
 * 上传音频选择:资源库或本地
 */
class AudioUploaderModal extends React.Component {
  static propTypes = {
    modalVisible: PropTypes.bool,
    onModalClose: PropTypes.func,
    onCompleteUpload: PropTypes.func
  }
  constructor(props) {
    super(props)

    this.state = {
      localUploadDomId: uuid(),
      ndrVisible: false
    }
  }

  openNDRResource = () => {
    this.setState({
      ndrVisible: true
    })
  }

  onNdrClose = () => {
    this.setState({
      ndrVisible: false
    })
  }

  handleCancel = () => {
    const { onModalClose } = this.props
    if (onModalClose) {
      onModalClose()
    }
  }

  onStartUpload = () => {
    // close this dialog
    this.handleCancel()
  }

  render = () => {
    const { ndrVisible, localUploadDomId } = this.state
    const { modalVisible, onCompleteUpload } = this.props
    return <div>
      {!modalVisible ? null : <AudioUploader ndrVisible={ndrVisible} onNdrClose={this.onNdrClose} triggerLocalUploadDomId={localUploadDomId} onStartUpload={this.onStartUpload} onCompleteUpload={onCompleteUpload} />}
      <Modal ref='modal'
        visible={modalVisible}
        onCancel={this.handleCancel}
        wrapClassName='ac-fish-pop ac-pop-save3'
        title='上传音频'
        footer={[
          <Button type='primary' size='large' onClick={this.openNDRResource}>资源库</Button>,
          <Button type='primary' size='large' id={localUploadDomId}>
            本地
          </Button>
        ]}>
        <div className='ac-ui-pop__body'>
          <p className='ac-ui-pop__body-txt'>
            您希望从哪里获取音频文件？
            </p>
        </div>
      </Modal>
    </div>
  }
}

export default AudioUploaderModal
