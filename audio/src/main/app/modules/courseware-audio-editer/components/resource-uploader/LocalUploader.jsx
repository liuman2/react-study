import React, { PropTypes } from 'react'
import FileUpload from '../../../file-uploader/components/FileUpload'
import { SUCCESS, createAssets } from '../../biz/AssetsCreator'
import { connect } from 'react-redux'
import { TypeEnum, getTypeFromExtension } from './TypeUtils'

/**
* 本地上传
* 仅限上传一个文档或一个音频或多个图片
*/
@connect(state => {
  const userInfo = state.coursewareAudioEditer.userInfo
  return {
    uid: userInfo.user_id
  }
}, {})
class LocalUploader extends React.Component {
  static propTypes = {
    uid: PropTypes.number,
    triggerDomId: PropTypes.string, // 触发本地上传的domId
    disableBrowse: PropTypes.bool, // 禁用本地上传
    uploadOptions: PropTypes.object,
    onUploadStart: PropTypes.func, // 上传开始
    onUploadSuccess: PropTypes.func, // 上传成功后回调(需要创建素材及转码的资源，在这些操作完成后回调)
    onUploadFail: PropTypes.func, // 上传失败后回调
    varifyBeforeUpload: PropTypes.func // 上传前文件校验
  }

  _onLocalUploaderSuccess = (files, resps, assetsId, sessionId) => {
    const { uid, onUploadSuccess, onUploadFail } = this.props
    const type = this.getType(files[0])
    if (type.toLocaleLowerCase() === TypeEnum.image) { // 图片无需执行创建素材操作
      onUploadSuccess(type, resps, sessionId)
    } else {
      // 创建素材
      createAssets(uid, assetsId, resps[0], sessionId, function (status, result) {
        if (status === SUCCESS) {
          onUploadSuccess(type, result, sessionId)
        } else {
          onUploadFail && onUploadFail(result)
        }
      })
    }
  }
  _onLocalUploaderFail = errObject => {
    const { onUploadFail } = this.props
    onUploadFail && onUploadFail(errObject)
  }
  _onLocalBeforeUpload = (files) => {
    const { varifyBeforeUpload } = this.props
    return varifyBeforeUpload ? varifyBeforeUpload(files, this.getType) : true
  }

  /**
   * 获取类型(TypeUtils中定义的类型)
   * @param {object} file plupload文件实体
   */
  getType(file) {
    if (file) {
      // 文件扩展名
      const extension = file.name.split('.').pop()
      return getTypeFromExtension(extension)
    }
  }

  render() {
    const {
      uid, triggerDomId, uploadOptions, disableBrowse, onUploadStart
    } = this.props

    const uploadConfig = {
      options: uploadOptions,
      resType: 'assets',
      uid,
      startUpload: onUploadStart,
      uploadSuccess: this._onLocalUploaderSuccess,
      uploadError: this._onLocalUploaderFail,
      beforeUpload: this._onLocalBeforeUpload
    }
    return <FileUpload {...uploadConfig} uploadDomId={triggerDomId} disableBrowse={disableBrowse} />
  }
}

export default LocalUploader
