/**
 * 上传进度回调
 * 上传文件参数（格式，大小）限制
 * 上传完毕
 *
 */
import React, { Component } from 'react'
import plupload from 'plupload'
import noop from 'lodash/noop'
import compact from 'lodash/compact'
import indexOf from 'lodash/indexOf'
import isEqual from 'lodash/isEqual'
import isFunction from 'lodash/isFunction'
import assign from 'lodash/assign'
import { getLcUploadUrl } from 'app/services/lifecycle-commmon'
import { setTimeout } from 'timers'
import { adaptProtocol } from 'utils/url'

let assetId// 素材ID
let sessionId// 会话ID

export default class FileUpload extends Component {
  static propTypes = {
    uploadDomId: React.PropTypes.string,
    disableBrowse: React.PropTypes.bool,
    options: React.PropTypes.object,
    // 文件添加时回调
    uploadFilesAdded: React.PropTypes.func,
    // 开始上传
    startUpload: React.PropTypes.func,
    // 上传进度
    uploadProgress: React.PropTypes.func,
    // 上传失败
    uploadError: React.PropTypes.func,
    // 上传成功
    uploadSuccess: React.PropTypes.func,
    // 上传前进行校验
    beforeUpload: React.PropTypes.func,
    // uid
    uid: React.PropTypes.number,
    // 资源类型
    resType: React.PropTypes.string
  }

  static defaultProps = {
    uploadFilesAdded: noop,
    uploadProgress: noop,
    uploadError: noop,
    uploadSuccess: noop,
    disableBrowse: false
  }

  constructor(props) {
    super(props)

    this.uploader = null

    this.state = {
      // 如果上传方式是html4，提示安装flash
      unsupport: false
    }
    // console.log('constructor %s-%s', props.from, props.uploadDomId)
  }

  startFileUpload(files) {
    const { resType, uid, startUpload, uploadError } = this.props
    startUpload && startUpload()
    // TODO: 单选和多选分成两种
    // const option = this.uploader.getOption()
    // VR 3D两种类型需要根据文件后缀名特殊处理
    getLcUploadUrl(resType, uid, true).then((data) => {
      assetId = data.uuid
      sessionId = data.session_id
      this.uploader.setOption({
        url: `${adaptProtocol(data.access_url)}?session=${data.session_id}`,
        multipart_params: {
          path: data.dist_path,
          // 私密 0，公开 1
          scope: 1
        }
      })
      this.uploader.start()
    }).catch(error => {
      uploadError(error)
    })
  }

  /**
   * 终止文件上传，在组件外部执行
   */
  stopUpload() {
    this.uploader.stop()
    this.uploader.splice()
  }

  /**
   * 重置uploader，组件外部执行
   */
  resetUploader() {
    this.uploader.splice()
    this.uploader.refresh()
  }

  componentWillReceiveProps(nextProps) {
    // console.log('componentWillReceiveProps %s-%s', props.from, props.uploadDomId)
    const { options, disableBrowse } = nextProps
    const { filters = {} } = options
    const uploader = this.uploader

    const optionChange = !isEqual(options, this.props.options)
    const disableBrowseChange = disableBrowse !== this.props.disableBrowse
    if (!optionChange && !disableBrowseChange) {
      return
    }

    // setTimeout确保browse_button 对应dom已挂载
    setTimeout(() => {
      if (optionChange) {
        uploader.setOption('filters', filters)
      }
      if (disableBrowseChange) {
        // setOption后立即调用disable无效
        this.setDisableBrowse(uploader, disableBrowse)
      }
    })
  }

  setDisableBrowse = (uploader, disableBrowse) => {
    setTimeout(() => {
      console.log('setDisableBrowse %s', disableBrowse)
      uploader.disableBrowse(disableBrowse)
    }, 100)
  }

  componentDidMount() {
    setTimeout(() => {
      this.init(this.props)
    })
    // console.log('componentDidMount %s-%s', props.from, props.uploadDomId)
  }

  init = props => {
    const self = this
    const { options, disableBrowse } = props
    const { filters = {} } = options
    const {
      uploadDomId, uploadFilesAdded, uploadProgress, uploadError, uploadSuccess, beforeUpload
    } = this.props
    // 上传回复的数据信息
    var uploadedResponses = []

    // 初始化上传实例对象
    this.uploader = new plupload.Uploader({
      runtimes: 'html5,flash,silverlight',
      browse_button: uploadDomId,
      url: '',
      flash_swf_url: '/lib/plupload/Moxie.swf',
      silverlight_xap_url: '/lib/plupload/Moxie.xap',
      filters,
      // 设置分块上传
      chunk_size: '2mb',
      // 是否支持多选
      multi_selection: options.multi_selection || false,
      multipart: true
    })

    this.uploader.init()

    this.uploader.bind('Init', function (up, params) {
      if (params.runtime === 'html4') {
        console.error('不支持html4上传方式')
      }
      self.setState({
        unsupport: params.runtime === 'html4'
      })
    })

    this.uploader.bind('FilesAdded', function (uploader, files) {
      if (isFunction(beforeUpload) && !beforeUpload(files)) {
        uploader.splice() // 删除队列中的文件
        return false
      }
      if (self.state.unsupport) {
        uploader.splice()
        return false
      }
      uploadedResponses = []
      // 添加文件后就开始上传
      if (files && files.length) {
        files.forEach(f => {
          let nameArr = f.name.split('.')
          let firstName = ''
          if (nameArr[0].indexOf('#') > -1 ||
          nameArr[0].indexOf('%') > -1 ||
          nameArr[0].indexOf('&') > -1 ||
          nameArr[0].indexOf('@') > -1 ||
          nameArr[0].indexOf('=') > -1 ||
          nameArr[0].indexOf('{') > -1 ||
          nameArr[0].indexOf('}') > -1 ||
          nameArr[0].indexOf(',') > -1 ||
          nameArr[0].indexOf('~') > -1 ||
          nameArr[0].indexOf('!') > -1 ||
          nameArr[0].indexOf('$') > -1 ||
          nameArr[0].indexOf('^') > -1 ||
          nameArr[0].indexOf('(') > -1 ||
          nameArr[0].indexOf(')') > -1 ||
          nameArr[0].indexOf('_') > -1 ||
          nameArr[0].indexOf('+') > -1 ||
          nameArr[0].indexOf('-') > -1) {
            firstName = Math.floor(Math.random() * 100 + 1)
          }

          if (firstName) {
            f.name = `${firstName}.${nameArr[nameArr.length - 1]}`
          }
        })
      }
      self.startFileUpload(files)
      return true
    })

    this.uploader.bind('BeforeUpload', function (uploader, file) {
      self.uploader.setOption('multipart_params', assign(uploader.getOption('multipart_params'), {
        size: file.size
      }))

      uploadFilesAdded(file)
      return true
    })

    /**
     * 上传出错
     */
    this.uploader.bind('Error', function (uploader, errObject) {
      uploadError(errObject)
    })

    /**
     * 上传完成
     */
    this.uploader.bind('FileUploaded', function (uploader, file, responseObject) {
      const files = this.files
      // 加载到最后一处触发上传成功的回调
      const fileIndex = indexOf(files, file)
      uploadedResponses[fileIndex] = JSON.parse(responseObject.response)

      if (compact(uploadedResponses).length === files.length) {
        uploadSuccess(files, uploadedResponses, assetId, sessionId)
        uploader.splice()
      }
    })

    /**
     * 上传进度
     */
    this.uploader.bind('UploadProgress', function (uploader, file) {
      // 传入百分比和文件大小
      uploadProgress(uploader, file)
    })

    this.setDisableBrowse(this.uploader, disableBrowse)
  }

  render() {
    // console.log('render %s-%s', this.props.from, this.props.uploadDomId)
    return (
      <div />
    )
  }
}
