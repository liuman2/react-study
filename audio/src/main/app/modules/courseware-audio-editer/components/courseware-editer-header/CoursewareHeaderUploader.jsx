import React, { PropTypes } from 'react'
import uuid from 'uuid/v1'
import ResourceUploader from '../resource-uploader/ResourceUploader'
import classnames from 'classnames'
import { connect } from 'react-redux'
import Modal from 'antd/lib/modal'
import Button from 'antd/lib/button'
import join from 'lodash/join'
import { imageTypes, documentTypes } from '../resource-uploader/TypeUtils'

/**
 * 获取当前流程节点: image_reorder/courseware_making/undefined
 */
const getCurrentFlow = (reorderImages, currentPage) => {
  if (currentPage !== -1) {
    return 'courseware_making'
  } else if (reorderImages && reorderImages.length > 0) {
    return 'image_reorder'
  }
}

@connect(state => {
  const { reorder_images: reorderImages } = state.coursewareAudioEditer.imagereorder
  const { currentPage } = state.coursewareAudioEditer.courseware
  return {
    currentFlow: getCurrentFlow(reorderImages, currentPage)
  }
}, {})
class CoursewareHeaderUploader extends React.Component {
  static propTypes = {
    currentFlow: PropTypes.string,
    saveCourseware: PropTypes.func,
    disabled: PropTypes.bool
  }

  constructor(props) {
    super(props)

    this.dropLocalUploadDomId = uuid()
    this.confirmLocalUploadDomId = uuid()
    this.openType = undefined // ndr or local

    this.state = {
      ...this.getPartState(props),
      ndrVisible: false,
      dropDownOpen: false,
      confirmModalVisible: false, // 确认覆盖当前正在制作课件框的显隐
      localUploadConfirmVisible: false // 保存完之后，本地上传确认框
    }
  }

  /**
   * {
   *  resourceType: 限制上传类型,
   * confirmReupload: 课件制作过程上传确认函数,
   * disabledBrowse: 禁用本地上传功能
   * }
   */
  getPartState = props => {
    let resourceType
    let isCoursewareMaking = false
    switch (props.currentFlow) {
      case 'courseware_making':
        isCoursewareMaking = true
        break
      case 'image_reorder':
        resourceType = 'image'
        break
      default:
        break
    }

    return {
      resourceType,
      isCoursewareMaking
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentFlow !== this.props.currentFlow) {
      this.setState(this.getPartState(nextProps))
    }
  }

  manualBrowseDialog = () => {
    // ie8 and lower don't support
    const elements = document.querySelectorAll('.moxie-shim input[type=file]')
    elements[0].click()
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

  showDropDown = () => {
    this.setState({
      dropDownOpen: true
    })
  }

  hideDropDown = () => {
    this.setState({
      dropDownOpen: false
    })
  }

  confirmReupload = openType => {
    this.openType = openType
    this.setState({
      confirmModalVisible: true
    })
  }

  handleCancel = () => {
    this.setState({
      ...this.getPartState(this.props),
      confirmModalVisible: false
    })
  }

  closeConfirmModal = () => {
    this.setState({
      confirmModalVisible: false
    })
  }

  confirmCancel = () => {
    this.closeConfirmModal()
  }

  confirmNo() {
    if (this.openType === 'ndr') {
      this.setState({
        ndrVisible: true,
        confirmModalVisible: false
      })
    } else {
      this.closeConfirmModal()
    }
  }

  confirmToSave = () => {
    this.setState({
      confirmModalVisible: false
    })
    const afterSaveOperate = this.openType === 'ndr' ? this.openNDRResource : this.confirmLocalUploadAfterSave
    this.props.saveCourseware(afterSaveOperate)
  }

  clickNdrUpload = () => {
    const { isCoursewareMaking } = this.state
    if (isCoursewareMaking) {
      this.confirmReupload('ndr')
    } else {
      this.openNDRResource()
    }
  }

  clickLocalUpload = () => {
    const { isCoursewareMaking } = this.state
    if (isCoursewareMaking) {
      this.confirmReupload('local')
    }
  }

  componentDidUpdate() {
    this.manualChangeLocalFileFilter()
  }

  /**
   * Plupload 实例后无法设置文件过滤，所以手动改
   */
  manualChangeLocalFileFilter = () => {
    const { resourceType } = this.state
    const elements = document.querySelectorAll('.moxie-shim input[type=file]')
    let fileTypes
    if (resourceType === 'image') {
      fileTypes = join(imageTypes, ',.')
      elements[0].setAttribute('accept', '.jpg,.jpeg,.gif,.png,.bmp')
    } else {
      fileTypes = join(imageTypes.concat(documentTypes), ',.')
    }
    if (elements && elements.length && elements[0]) {
      elements[0].setAttribute('accept', '.' + fileTypes)
    }
  }

  confirmLocalUploadAfterSave = () => {
    this.setState({
      localUploadConfirmVisible: true
    })
  }
  confirmLocalUploadCancel = () => {
    this.setState({
      localUploadConfirmVisible: false
    })
  }
  confirmOpenLocalUpload = () => {
    this.manualBrowseDialog()
    this.setState({
      localUploadConfirmVisible: false
    })
  }

  render = () => {
    const {
      resourceType, ndrVisible, isCoursewareMaking, dropDownOpen, confirmModalVisible, localUploadConfirmVisible
    } = this.state
    const { disabled } = this.props
    return <div className={classnames(
      'ac-ui-dropdown',
      {
        'ac-ui-dropdown--open': dropDownOpen,
        'ac-ui-dropdown--disabled': disabled
      }
    )} onMouseEnter={this.showDropDown} onMouseLeave={this.hideDropDown}>
      <Modal ref='modal'
        visible={confirmModalVisible}
        onCancel={this.handleCancel}
        wrapClassName='ac-fish-pop ac-pop-save3'
        title='保存'
        footer={[
          <Button type='danger' size='large' id={this.confirmLocalUploadDomId} onClick={() => this.confirmNo()}>否</Button>,
          <Button type='primary' size='large' onClick={this.confirmToSave}>是</Button>
        ]}>
        <ResourceUploader from='modal' resourceType={resourceType} disableBrowse={this.openType === 'ndr'} triggerLocalUploadDomId={this.confirmLocalUploadDomId} />
        <div className='ac-ui-pop__body'>
          <p className='ac-ui-pop__body-txt'>
            当前课件还未保存，是否保存？
            </p>
        </div>
      </Modal>
      <Modal
        visible={localUploadConfirmVisible}
        wrapClassName='ac-fish-pop ac-pop-save2'
        width='600px'
        title='本地上传'
        onCancel={this.confirmLocalUploadCancel}
        onOk={this.confirmOpenLocalUpload}>
        <div className='ac-ui-pop__body'>
          <p className='ac-ui-pop__body-txt'>
            确定打开本地上传？
          </p>
        </div>
      </Modal>
      <ResourceUploader from='header' resourceType={resourceType} ndrVisible={ndrVisible} onNdrClose={this.onNdrClose}
        disableBrowse={isCoursewareMaking} triggerLocalUploadDomId={this.dropLocalUploadDomId} />
      {/* <!-- ac-ui-dropdown 加类 ac-ui-dropdown--open展开下拉菜单 --> */}
      <span className='ac-ui-dropdown-top' >
        <i className='ac-dropdown-icon icon-upload' />
        <span className='ac-ui-dropdown__txt'>
          上传文档
        </span>
      </span>
      {disabled ? null : <div className='ac-ui-select-padding'>
        <div className='ac-ui-select ac-ui-select__scroll'>
          <ul className='ac-ui-select__menu header-menu'>
            <li className='ac-ui-select__item' onClick={this.clickNdrUpload} >
              <span className='ac-ui-select__item-txt'>从资源库选择</span>
            </li>
            <li className='ac-ui-select__item' onClick={this.clickLocalUpload} id={this.dropLocalUploadDomId} >
              <label className='ac-ui-upload__label'>
                <span className='ac-ui-select__item-txt'>从本地上传</span>
              </label>
            </li>
          </ul>
        </div>
      </div>}
    </div>
  }
}

export default CoursewareHeaderUploader
