import React from 'react'
import CSSModules from 'react-css-modules'
import Modal from 'antd/lib/modal'
import { registerReceive, unregisterReceive } from 'app/utils/messenger-service'
import { TypeEnum, getTypeFromMimeType } from './TypeUtils'
import map from 'lodash/map'
import axios from 'axios'
import config from 'config'
import { getLcUploadUrl, getLcDownloadUrl } from 'app/services/lifecycle-commmon'
import { getAssetsInfo } from '../../actions/courseware-action-creator'

import { connect } from 'react-redux'
import styles from './styles/repository-uploader.scss'

@connect(state => {
  const userInfo = state.coursewareAudioEditer.userInfo
  return {
    uid: userInfo.user_id
  }
}, {})
@CSSModules(styles, {allowMultiple: true})
class ResourceRepositoryUploader extends React.Component {
  static propTypes = {
    uid: React.PropTypes.number,
    res_type: React.PropTypes.string,
    visible: React.PropTypes.bool, // 显示或隐藏
    onClose: React.PropTypes.func, // 关闭事件
    varifyResources: React.PropTypes.func, // 验证选择的资源合法性
    onChooseComplete: React.PropTypes.func // 选择完成并验证成功后回调
  }

  handleMessage = result => {
    if (result.type === 'resources_selected_ok') {
      const resources = result.data
      if (!this.props.varifyResources(resources, this.getType)) {
        return
      }
      this.dealData(resources)
    } else if (result.type === 'resources_selected_cancel') {
      // 关闭消息
    }
    // TODO: 获得勾选的数据结果
    console.debug(result)
    // 关闭窗口
    this._onRepositoryClose()
  }

  /**
   * 获取类型
   * @param {object} resource 资源库中资源实体
   */
  getType(resource) {
    if (resource) {
      const { tech_info: techInfo } = resource
      return getTypeFromMimeType(techInfo.href.format)
    }
  }

  componentDidMount() {
    registerReceive(this.handleMessage)
  }

  componentWillUnmount() {
    unregisterReceive(this.handleMessage)
  }

  dealData = resources => {
    const { uid, onChooseComplete } = this.props
    // 从tech_info下的源文件即source 取类型
    const type = this.getType(resources[0])
    if (type === TypeEnum.image) {
      onChooseComplete(type, resources)
    } else {
      getLcDownloadUrl('assets', uid, resources[0].identifier).then(data => {
        onChooseComplete(type, resources[0], data.session_id)
      })
    }
  }

  _onRepositoryClose = () => {
    this.props.onClose()
  }

  getNdrUrl = () => {
    const { uid, res_type: resType } = this.props
    // 旧资源库接入
    // const ndrUri = `${config.ndr_host}/prefight/resources`
    // const macToken = encodeURIComponent(window.getCustomAuth(ndrUri, 'get'))
    // // &coverage=User/${uid}/OWNER
    // return `${ndrUri}?operation=readonly&show_tab=all&tab=chapter&coverage=Org/nd/OWNER&coverage=User/${uid}/OWNER&res_type=${resType}&mac_token=${macToken}`

    // 新资源库接入
    const requestUri = `${config.ndr_host}/#`
    const macToken = btoa(window.getCustomAuth(requestUri, 'get'))
    // &coverage=User/${uid}/OWNER
    return `${config.ndr_host}/r.html#/resources_selector?auth=${macToken}&res_type=${resType}`
  }
  render() {
    const { visible } = this.props
    const ndrUrl = this.getNdrUrl()
    return <Modal
      wrapClassName='fish-no-padding'
      width={'85%'}
      visible={visible}
      onCancel={this._onRepositoryClose}
      closable={false}
      footer={null}>
      <iframe styleName='repository-iframe' src={ndrUrl} />
    </Modal>
  }
}

export default ResourceRepositoryUploader
