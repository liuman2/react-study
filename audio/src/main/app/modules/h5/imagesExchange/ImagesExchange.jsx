import React, { Component } from 'react'
import {connect} from 'react-redux'
import { push } from 'react-router-redux/lib/actions'
import {toMakeCourseware} from 'modules/courseware-audio-editer/actions/courseware-action-creator'
import UploadCourseware from 'modules/h5/share/uploadCourseware/UploadCourseware'
import { default as TouchBackend } from 'react-dnd-touch-backend'
import { DragDropContext } from 'react-dnd'
import ImageItem from 'modules/h5/imagesExchange/components/ImageItem'
import { removeItem, changePosition, completeReorder } from 'modules/courseware-audio-editer/actions/imagereorder-action-creator'
import Header from 'modules/h5/share/header'
import map from 'lodash/map'
import ItemPreview from './components/ItemPreview'
import { getCsThumUrl } from 'app/utils/url'

const CATEGORYS = [
  {
    name: 'image',
    multiple: true
  }
]
const SCREEN_WIDTH = (window.innerWidth > 0) ? window.innerWidth : screen.width
let longTouchTimer
@connect(state => ({
  reorderImages: state.coursewareAudioEditer.imagereorder.reorder_images
}), {
  push,
  toMakeCourseware,
  removeItem,
  changePosition,
  completeReorder
})
class ImagesExchange extends Component {
  static propTypes = {
    push: React.PropTypes.func,
    reorderImages: React.PropTypes.array,
    toMakeCourseware: React.PropTypes.func,
    completeReorder: React.PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      uploadVisible: false,
      isDrag: false
    }
    this.handleOpenUpload = this.handleOpenUpload.bind(this)
  }
  componentWillMount() {
    if (!this.props.reorderImages || this.props.reorderImages.length === 0) this.props.push('/edit')
  }
  handleOpenUpload = () => {
    this.setState(preState => {
      return {
        uploadVisible: !preState.uploadVisible
      }
    })
  }
  handleLongTouch = () => {
    longTouchTimer = setTimeout(() => {
      this.setState({
        isDrag: true
      })
    }, 800)
  }
  handleCancelLongTouch = () => {
    if (longTouchTimer) {
      clearTimeout(longTouchTimer)
    }
  }
  handleFinished = () => {
    const { push, reorderImages, toMakeCourseware } = this.props
    push('/edit')
    const imageUrls = map(reorderImages, 'url')
    toMakeCourseware(reorderImages[0].name, imageUrls)
    this.props.completeReorder()
  }
  render() {
    const { reorderImages } = this.props
    const { uploadVisible, isDrag } = this.state
    const itemWidth = SCREEN_WIDTH * 0.3 // 数值不精确，大概值
    const shouldShowIndex = true
    return (
      <div className='select-wrapper'>
        <Header
          backUrl='/edit'
          title='图片调序'
          rightBtnAction={this.handleFinished}
        />
        <div className='select--body'>
          <ul className='select--list'>
            <li className='select--list__row open'>
              <p className='img-sort__tip'>长摁拖动图片可调节图片顺序</p>
              <ul className='img--list' onTouchStart={this.handleLongTouch} onTouchEnd={this.handleCancelLongTouch}>
                {
                  reorderImages.map((image, index) => {
                    image.thumUrl = getCsThumUrl(image.url, itemWidth)
                    return <ImageItem canDrag={isDrag} {...this.props} imageInfo={image} index={index} showIndex={shouldShowIndex} />
                  })
                }
              </ul>
              <ItemPreview key='__preview' />
            </li>
          </ul>
        </div>
        <div className='select--info'>
          <a className='img-sort__add' onClick={this.handleOpenUpload}>继续添加</a>
        </div>
        <UploadCourseware
          visible={uploadVisible}
          onClose={this.handleOpenUpload}
          categorys={CATEGORYS}
          type='image'
          backUrl='/images-exchange'
        />
      </div>
    )
  }
}

export default DragDropContext(TouchBackend({ enableMouseEvents: true }))(ImagesExchange)
