import React, {PropTypes} from 'react'
import join from 'lodash/join'

import LocalUploader from './LocalUploader'
import ResourceRepositoryUploader from './ResourceRepositoryUploader'
import { uploadAudio } from '../../actions/courseware-action-creator'
import { audioTypes } from './TypeUtils'
import { connect } from 'react-redux'
import { getAudioInfo } from '../../biz/AudioTool'
import Loading from 'app/components/loading'
import Toast from 'components/toast'

const uploadOptions = {
  filters: {
    mime_types: [
      {
        title: 'Audio files',
        extensions: join(audioTypes, ','),
        max_file_size: '60mb'
      }
    ]
  },
  multi_selection: false
}

@connect(state => ({}), {
  uploadAudio
})
class AudioUploader extends React.Component {
  static propTypes = {
    ndrVisible: PropTypes.bool, // 显示或隐藏资源库
    disableBrowse: PropTypes.bool, // 禁用本地上传功能
    onNdrClose: PropTypes.func, // 资源库弹框关闭回调
    onStartUpload: PropTypes.func, // 开始上传回调
    onCompleteUpload: PropTypes.func, // 完成资源选择回调
    triggerLocalUploadDomId: PropTypes.string, // 用于触发本地上传的domId
    uploadAudio: PropTypes.func
  }

  onLocalUploadStart = () => {
    const { onStartUpload } = this.props
    onStartUpload && onStartUpload()
    Loading.open()
  }

  /**
  *  assetsInfo: assetsInfo
  */
  onLocalUploadSuccess = (type, assetsInfo, sessionId) => {
    const { uploadAudio, onCompleteUpload } = this.props
    const audioInfo = getAudioInfo(assetsInfo, 'upload')
    uploadAudio(audioInfo)
    onCompleteUpload && onCompleteUpload()
    Loading.close()
  }

  onLocalUploadFail = errorObject => {
    Toast('上传失败!')
    Loading.close()
  }

  // ndr中选择的资源(已校验)
  onNdrChooseComplete = (type, assetsInfo, sessionId) => {
    const { uploadAudio, onCompleteUpload } = this.props
    const audioInfo = getAudioInfo(assetsInfo, 'upload')
    uploadAudio(audioInfo)
    onCompleteUpload && onCompleteUpload()
  }

  /**
  * server返回的path格式是: ${ref_path}/edu/esp/test/abc.jpg
  * 需要剔除${ref_path}部分
  */
  delRefPath = (serverCsPath) => {
    const pathStartIndex = serverCsPath.indexOf('/')
    return serverCsPath.substring(pathStartIndex)
  }

  /**
 * 验证资源库资源或本地文件类型是否合法
 * @param {array} resources plupload选择的文件列表或资源库素材列表
 * @param {function} getType 获取类型（TypeUtils中定义的类型）
 */
  varifyResources = (resources, getType) => {
    const resourcesLength = resources.length
    console.log('添加文件数量=' + resourcesLength)

    const firstElementType = getType(resources[0])
    if (firstElementType === 'audio' && resourcesLength === 1) {
      return true
    }
    alert('请选择一个音频资源，音频只支持mp3、wma、wav!')
    return false
  }
  render() {
    const { ndrVisible, onNdrClose, triggerLocalUploadDomId, disableBrowse } = this.props
    return <div>
      {!ndrVisible ? null : <ResourceRepositoryUploader visible={ndrVisible} onClose={onNdrClose} res_type='["audio"]' varifyResources={this.varifyResources} onChooseComplete={this.onNdrChooseComplete} />}
      <LocalUploader triggerDomId={triggerLocalUploadDomId} disableBrowse={disableBrowse} uploadOptions={uploadOptions} varifyBeforeUpload={this.varifyResources} onUploadStart={this.onLocalUploadStart} onUploadSuccess={this.onLocalUploadSuccess} onUploadFail={this.onLocalUploadFail} />
    </div>
  }
}

export default AudioUploader
