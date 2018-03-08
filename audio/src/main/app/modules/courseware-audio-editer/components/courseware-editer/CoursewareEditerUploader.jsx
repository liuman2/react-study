import React from 'react'
import uuid from 'uuid/v1'
import ResourceUploader from '../resource-uploader/ResourceUploader'

class CoursewareEditerUploader extends React.Component {
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

  render() {
    const { localUploadDomId, ndrVisible } = this.state
    return <div className='ac-ui-layout__main ac-ui-layout__main--bg'>
      <div className='ac-upload-documents-main'>
        <ResourceUploader ndrVisible={ndrVisible} onNdrClose={this.onNdrClose} triggerLocalUploadDomId={localUploadDomId} />
        <label className='aud_label'>
          <i className='ac-ui-icon ac-ui-icon-upload' />
          {/* <!-- <input className='aud_label-input' type='file'> --> */}
        </label>
        <p className='aud_label-txt'>请先上传课件文档</p>
        <p className='aud_label-txt aud_label-txt--sub'>支持上传PPT / PDF / Word / 图片格式的文件，图片仅支持jpg / png格式</p>
        <div className='aud_button-wrap'>
          <a className='ac-ui-button ac-ui-button--main ac-ui-button--mid' onClick={this.openNDRResource} >从资源库选择</a>
          {/* <!-- ac-ui-button不可点击加类名ac-ui-button==disabled --> */}

          <label className='ac-ui-upload__label'>
            <a className='ac-ui-button ac-ui-button--main ac-ui-button--mid' id={localUploadDomId} >从本地上传</a>
            {/* <!-- ac-ui-button不可点击加类名ac-ui-button==disabled --> */}

            <input className='ac-ui-upload__input' type='file' />
          </label>
        </div>
      </div>
    </div>
  }
}

export default CoursewareEditerUploader
