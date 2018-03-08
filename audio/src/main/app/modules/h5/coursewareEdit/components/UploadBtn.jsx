import React, { Component } from 'react'
import UploadCourseware from 'modules/h5/share/uploadCourseware/UploadCourseware'

const CATEGORYS = [
  {
    name: 'document'
  },
  {
    name: 'image',
    multiple: true
  }
]

/**
 * 上传课件文档
 */
export default class UploadBtn extends Component {
  constructor(props) {
    super(props)
    this.state = {
      uploadVisible: false
    }
    this.handleOpenUpload = this.handleOpenUpload.bind(this)
  }
  handleOpenUpload() {
    this.setState(preState => {
      return {
        uploadVisible: !preState.uploadVisible
      }
    })
  }
  render() {
    const { uploadVisible } = this.state
    return (
      <div className='carousel--upload'>
        <a className='ui-btn ui-btn__upload' onClick={this.handleOpenUpload} />
        <p className='carousel--upload__desc'>请上传课件文档</p>
        <p className='carousel--upload__tip'>支持上传PPT / PDF / Word / 图片格式的文件</p>
        <p className='carousel--upload__tip'>图片仅支持jpg / png格式</p>
        <UploadCourseware
          visible={uploadVisible}
          onClose={this.handleOpenUpload}
          categorys={CATEGORYS}
          type='image'
          backUrl='/'
        />
      </div>
    )
  }
}
