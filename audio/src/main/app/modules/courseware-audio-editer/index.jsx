import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import CoursewareEditerHeader from './components/courseware-editer-header/CoursewareEditerHeader'
import CoursewareEditerContent from './components/courseware-editer-content/CoursewareEditerContent'
import ImageReordering from './components/image-reorder/ImageReordering'
import classnames from 'classnames'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import { previewCourseware } from './actions/courseware-action-creator'

// 加入样式
// import 'theme/audio-courseware-ui/styles.css'

@connect(state => {
  const { reorder_images: reorderImages, from } = state.coursewareAudioEditer.imagereorder
  const { title, pages, currentPage, identifier, timepoints, isSingle } = state.coursewareAudioEditer.courseware
  return {
    isImageReorder: reorderImages && reorderImages.length > 0,
    reorderImages: reorderImages,
    imageFrom: from,
    title,
    pages,
    currentPage,
    identifier,
    timepoints,
    isSingle
  }
}, {
  previewCourseware
})

class CoursewareEditerApp extends React.Component {
  static propTypes = {
    isImageReorder: PropTypes.bool,
    isSingle: PropTypes.bool,
    reorderImages: PropTypes.array,
    imageFrom: PropTypes.string,
    title: PropTypes.string,
    pages: PropTypes.array,
    timepoints: PropTypes.array,
    currentPage: PropTypes.number,
    identifier: PropTypes.string,
    previewCourseware: PropTypes.func
  }

  getCurrentOperate = () => {
    const { isImageReorder, currentPage } = this.props
    let type
    if (currentPage !== -1) { // 课件编辑
      type = 'courseware-making'
    } else if (isImageReorder) {
      type = 'image-reordering'
    } else {
      type = 'upload-documents'
    }
    return type
  }

  preivew = () => {
    const { previewCourseware, identifier } = this.props
    previewCourseware(identifier).then((previewPath) => {
      const mainXml = previewPath.payload.data.url
      switch (window.location.hostname) {
        case '127.0.0.1':
        case 'audio-courseware.dev.web.nd':
          window.location.href = `//audio-courseware-player.dev.web.nd/index.html?main=${mainXml}`
          break
        case 'audio-courseware.debug.web.nd':
          window.location.href = `//audio-courseware-player.debug.web.nd/index.html?main=${mainXml}`
          break
        case 'audio-courseware.beta.101.com':
          window.location.href = `//audio-courseware-player.beta.101.com/index.html?main=${mainXml}`
          break
        case 'audio-courseware.101.com':
          window.location.href = `//audio-courseware-player.101.com/index.html?main=${mainXml}`
          break
        default:
      }
    })
  }

  render() {
    const { isImageReorder, reorderImages, imageFrom, title, pages, identifier, timepoints, isSingle } = this.props
    const currentOperate = this.getCurrentOperate()
    let structure
    if (isImageReorder) { // 图片调序
      structure = <ImageReordering reorderImages={reorderImages} from={imageFrom} />
    } else {
      structure = <CoursewareEditerContent />
    }
    return <div className={classnames(
      'ac-ui-layout ac-ui-layout__fix--top',
      {
        'ac-upload-documents': currentOperate === 'upload-documents',
        'ac-picture-reordering': currentOperate === 'image-reordering',
        'ac-courseware-making': currentOperate === 'courseware-making'
      }
    )}>
      <CoursewareEditerHeader title={title} pages={pages} timepoints={timepoints} isSingle={isSingle} identifier={identifier} preivew={this.preivew} />
      {structure}
    </div>
  }
}

export default DragDropContext(HTML5Backend)(CoursewareEditerApp)
