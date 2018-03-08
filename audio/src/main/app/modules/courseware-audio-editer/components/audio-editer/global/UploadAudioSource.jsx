import React, { PropTypes } from 'react'
import AudioUploader from '../../resource-uploader/AudioUploader'
import { audioTypes } from '../../resource-uploader/TypeUtils'
import join from 'lodash/join'
import map from 'lodash/map'
import toUpper from 'lodash/toUpper'
import uuid from 'uuid/v1'
import classnames from 'classnames'

const SUPPORT_FORMAT = join(map(audioTypes, type => {
  return toUpper(type)
}), '/')

class UploadAudioSource extends React.Component {
  static propTypes = {
    editable: PropTypes.bool
  }
  constructor(props) {
    super(props)

    this.state = {
      localUploadDomId: uuid(),
      ndrVisible: false
    }
  }

  openNDRResource = () => {
    const { editable } = this.props
    if (!editable) {
      return
    }
    this.setState({
      ndrVisible: true
    })
  }

  onNdrClose = () => {
    this.setState({
      ndrVisible: false
    })
  }

  render = () => {
    const { ndrVisible, localUploadDomId } = this.state
    const { editable } = this.props
    return <div className='ac-ui-tab__item-box'>
      <AudioUploader ndrVisible={ndrVisible} disableBrowse={!editable} onNdrClose={this.onNdrClose} triggerLocalUploadDomId={localUploadDomId} />
      <div className='aut__btn-wrap'>
        <a className={classnames(
          'ac-ui-button-up-down aubud-resource',
          {'aubud--disabled': !editable}
        )} onClick={this.openNDRResource}>
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>从资源库选择</span>
        </a>
        {/* <!-- ac-ui-button-up-down加类aubud--active表示选中,加类aubud--disabled表示按钮不可用 --> */}
        <a className={classnames(
          'ac-ui-button-up-down aubud-local',
          {'aubud--disabled': !editable}
        )} id={localUploadDomId}>
          <i className='ac-ui-icon' />
          <span className='aubud-txt'>从本地上传</span>
        </a>
        {/* <!-- ac-ui-button-up-down加类aubud--active表示选中,加类aubud--disabled表示按钮不可用 --> */}
      </div>
      <div className='aut__txt-wrap'>
        <p className='aut__txt-main'>
          你可以上传一份音频对应所有的文档页面
        </p>
        <p className='aut__txt-sub'>
          支持{SUPPORT_FORMAT}格式的音频文件，大小控制在60M以内
        </p>
      </div>
    </div>
  }
}

export default UploadAudioSource
