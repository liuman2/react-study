import React, { PropTypes } from 'react'
import map from 'lodash/map'
import join from 'lodash/join'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'

import LocalUploader from './LocalUploader'
import ResourceRepositoryUploader from './ResourceRepositoryUploader'

import url from 'app/utils/url'
import { getCsFileList, toMakeCourseware } from '../../actions/courseware-action-creator'
import { openImageReorder } from '../../actions/imagereorder-action-creator'
import { TypeEnum, imageTypes, documentTypes } from './TypeUtils'
import { connect } from 'react-redux'
import Loading from 'app/components/loading'
import Toast from 'components/toast'
import { checkImageCount } from '../../biz/ResourceUtils'

const MIME_TYPES = {
  image: {
    title: 'Image files',
    extensions: join(imageTypes, ','),
    max_file_size: '10mb'
  },
  document: {
    title: 'Document files',
    extensions: join(documentTypes, ','),
    max_file_size: '50mb'
  }
}

@connect(state => ({}), {
  toMakeCourseware,
  openImageReorder
})
class ResourceUploader extends React.Component {
  static propTypes = {
    ndrVisible: PropTypes.bool, // 显示或隐藏资源库
    disableBrowse: PropTypes.bool, // 禁用本地上传功能
    onNdrClose: PropTypes.func, // 资源库弹框关闭回调
    triggerLocalUploadDomId: PropTypes.string, // 用于触发本地上传的domId
    toMakeCourseware: PropTypes.func,
    openImageReorder: PropTypes.func,
    resourceType: PropTypes.string, // 资源选择好后检测所选资源是否是指定类型 image/document（资源库中的资源类型很多不匹配，比如文档类型下居然又图片）
    res_type: PropTypes.String, // 给资源选择组件用的类型过滤条件。数组格式的字符串。默认值 '["image","coursewares","documents"]'
    onSuccess: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      uploadOptions: this.getUploadOptions(props)
    }
  }

  componentWillReceiveProps(nextProps) {
    const newUploadOptions = this.getUploadOptions(nextProps)
    if (!isEqual(newUploadOptions, this.state.uploadOptions)) {
      this.setState({
        uploadOptions: newUploadOptions
      })
    }
  }

  getUploadOptions = props => {
    let uploadOptions
    switch (props.resourceType) {
      case 'image':
        uploadOptions = {
          filters: {
            mime_types: [MIME_TYPES.image]
          },
          multi_selection: true
        }
        break
      case 'document':
        uploadOptions = {
          filters: {
            mime_types: [MIME_TYPES.document]
          },
          multi_selection: false
        }
        break

      default:
        uploadOptions = {
          filters: {
            mime_types: [MIME_TYPES.image, MIME_TYPES.document]
          },
          multi_selection: true
        }
        break
    }
    return uploadOptions
  }

  imageSuccess = (modelArray, getPath, from) => {
    const values = map(modelArray, resp => {
      const path = url.delRefPath(get(resp, getPath))
      return {
        name: resp.name || resp.title, // 前者本地上传cs实体，后者资源库实体
        url: url.csStatic(path)
      }
    })
    this.props.openImageReorder(from, values)
    if (this.props.onSuccess) this.props.onSuccess(from, values)
  }

  documentSuccess = (title, modelArray, getPath) => {
    const coursewareImages = map(modelArray, resp => {
      const path = url.delRefPath(get(resp, getPath))
      return url.csStatic(path)
    })
    this.props.toMakeCourseware(title, coursewareImages)
  }

  onLocalUploadStart = () => {
    Loading.open()
  }

  /**
  *  repositoryModel值有两种可能: Array<CSRespModel>(图片上传)，素材info(文档上传)
  */
  onLocalUploadSuccess = (type, repositoryModel, sessionId) => {
    if (type.toLocaleLowerCase() === 'image') { // 上传图片
      this.imageSuccess(repositoryModel, 'path', 'local')
      Loading.close()
    } else { // 上传文档
      const { tech_info: techInfo, title } = repositoryModel
      const path = url.delRefPath(techInfo.image.location)
      getCsFileList(path, sessionId, true).payload.then(items => {
        this.documentSuccess(title, items, 'path')
        Loading.close()
      }).catch(this.onLocalUploadFail)
    }
  }

  onLocalUploadFail = errObject => {
    Toast('上传失败，图片仅支持.jpg和.png')
    Loading.close()
  }

  /**
   * ndr中选择的资源(已校验)
   * @param {string} type 类型
   * @param {array | object} model image则为array, 其他则为object
   * @param {string} sessionId 会话id,非图片后续接口使用， 图片，则为undefined
   */
  onNdrChooseComplete = (type, model, sessionId) => {
    if (type === 'image') {
      this.imageSuccess(model, 'tech_info.href.location', 'ndr')
    } else {
      const { tech_info: techInfo, title } = model
      if (!techInfo.image) {
        alert('该资源不存在相关素材!')
        return
      }
      getCsFileList(url.delRefPath(techInfo.image.location), sessionId).payload.then(items => {
        this.documentSuccess(title, items, 'path')
      }).catch(errObj => {
        Toast('获取文档数据异常')
      })
    }
  }

  /**
   * 验证资源库资源或本地文件类型是否合法
   * @param {array} resources plupload选择的文件列表或资源库素材列表
   * @param {function} getType 获取类型（TypeUtils中定义的类型）
   */
  varifyResources = (resources, getType) => {
    const {resourceType} = this.props
    const resourcesLength = resources.length
    console.log('添加文件数量=' + resourcesLength)
    if (resourcesLength === 0) {
      alert('未选择任何资源!')
      return false
    }
    const firstElementType = getType(resources[0])
    if (resourceType && resourceType !== firstElementType) {
      alert(resourceType === TypeEnum.image ? '请选择图片资源!' : '请选择文档资源!')
      return false
    }

    if (firstElementType === TypeEnum.document) { // 只能选一个文档资源
      if (resourcesLength === 1) {
        return true
      } else {
        alert('请选择一个文档或多张图片!')
        return false
      }
    } else if (firstElementType === TypeEnum.image) {
      for (var i = resourcesLength - 1; i > 0; i--) {
        if (getType(resources[i]) !== TypeEnum.image) { // 不能同时选择图片和其他类型资源
          alert('请选择一个文档或多张图片!')
          return false
        }
      }
      return checkImageCount(resources.length)
    }
    alert('只支持png或jpg类型的图片')
    return false
  }
  render() {
    // '["image","coursewares","documents"]'
    const { ndrVisible, disableBrowse, onNdrClose, triggerLocalUploadDomId, res_type: resType = '["image","documents"]' } = this.props
    const { uploadOptions } = this.state
    return <div>
      {/* ndr回调消息是全局，所以只能有一个实例，否则会回调多次 */}
      {!ndrVisible ? null : <ResourceRepositoryUploader visible={ndrVisible} onClose={onNdrClose} res_type={resType} varifyResources={this.varifyResources} onChooseComplete={this.onNdrChooseComplete} />}
      <LocalUploader triggerDomId={triggerLocalUploadDomId} disableBrowse={disableBrowse} uploadOptions={uploadOptions} varifyBeforeUpload={this.varifyResources} onUploadStart={this.onLocalUploadStart} onUploadSuccess={this.onLocalUploadSuccess} onUploadFail={this.onLocalUploadFail} />
    </div>
  }
}

export default ResourceUploader
