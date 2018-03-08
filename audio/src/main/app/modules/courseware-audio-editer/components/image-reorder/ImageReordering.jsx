import React, {PropTypes} from 'react'
import ImageGrid from './ImageGrid'
import ResourceUploader from '../resource-uploader/ResourceUploader'
import uuid from 'uuid/v1'
import { connect } from 'react-redux'
import { toMakeCourseware } from '../../actions/courseware-action-creator'
import { completeReorder } from '../../actions/imagereorder-action-creator'
import map from 'lodash/map'

@connect(state => ({}), {
  toMakeCourseware,
  completeReorder
})
class ImageReordering extends React.Component {
  static propTypes = {
    reorderImages: PropTypes.array,
    from: PropTypes.string,
    toMakeCourseware: PropTypes.func,
    completeReorder: PropTypes.func
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

  sure = () => {
    const {reorderImages, completeReorder, toMakeCourseware} = this.props
    const coursewareImages = map(reorderImages, 'url')

    completeReorder()
    toMakeCourseware(reorderImages[0].name, coursewareImages)
  }

  render() {
    const { from, reorderImages } = this.props
    const { localUploadDomId, ndrVisible } = this.state
    let resourceStructure, addBtnStructureNdr, addBtnStructureLocal
    // if (from === 'ndr') {
    //   addBtnStructureNdr = <a className={`ac-ui-button ac-ui-button--main ac-ui-button--mid ${from === 'ndr' ? '' : 'hide'}`} onClick={this.openNDRResource} >继续添加</a>
    // } else { // local
    //   addBtnStructureLocal = <a className={`ac-ui-button ac-ui-button--main ac-ui-button--mid ${from === 'local' ? '' : 'hide'}`} id={localUploadDomId} >继续添加1</a>
    // }
    addBtnStructureNdr = <a className={`ac-ui-button ac-ui-button--main ac-ui-button--mid ${from === 'ndr' ? '' : 'hide'}`} onClick={this.openNDRResource} >继续添加</a>
    addBtnStructureLocal = <a className={`ac-ui-button ac-ui-button--main ac-ui-button--mid ${from === 'local' ? '' : 'hide'}`} id={localUploadDomId} >继续添加</a>
    resourceStructure = <ResourceUploader disableBrowse={from === 'ndr'} triggerLocalUploadDomId={localUploadDomId} ndrVisible={ndrVisible} onNdrClose={this.onNdrClose} resourceType='image' res_type='["image"]' />
    return <div>
      {resourceStructure}
      <div className='ac-ui-layout__body'>
        <div className='apr-content'>
          <div className='apr-title-wrap'>
            <p className='apr-title'>
              图片调序
            </p>
            <p className='apr-title apr-title--sub'>
              拖动图片即可调节图片顺序
            </p>
          </div>
          <div className='apr-item-wrap'>
            <ImageGrid reorderImages={reorderImages} />
          </div>
        </div>
      </div>

      <div className='ac-ui-layout__bottom'>
        {addBtnStructureNdr}
        {addBtnStructureLocal}
        {/* <!-- ac-ui-button不可点击加类名ac-ui-button--disabled --> */}
        <a className='ac-ui-button ac-ui-button--main ac-ui-button--mid' onClick={this.sure} >确定</a>
        {/* <!-- ac-ui-button不可点击加类名ac-ui-button--disabled --> */}
      </div>
    </div>
  }
}

export default ImageReordering
