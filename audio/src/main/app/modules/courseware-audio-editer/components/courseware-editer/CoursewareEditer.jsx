import React, {PropTypes} from 'react'
import AudioEditerContainer from '../audio-editer/AudioEditerContainer'
import IMaxPreview from '../IMaxPreview'
import Pagination from '../Pagination'
import CoursewareEditerUploader from './CoursewareEditerUploader'
import { connect } from 'react-redux'

@connect(state => {
  const {pages: coursewarePages, currentPage} = state.coursewareAudioEditer.courseware
  return {
    coursewarePages,
    currentPage
  }
}, {})

class CoursewareEditer extends React.Component {
  static propTypes = {
    coursewarePages: PropTypes.array,
    currentPage: PropTypes.number
  }
  render() {
    const {coursewarePages, currentPage} = this.props
    let mainStructure
    if (currentPage !== -1) {
      // 大图预览
      mainStructure = <IMaxPreview page={coursewarePages[currentPage]} />
    } else {
      // 编辑区上传
      mainStructure = <CoursewareEditerUploader />
    }

    return <div className='ac-ui-layout__content'>
      <div className='ac-ui-layout__main-wrap'>
        {mainStructure}
      </div>
      <div className='ac-ui-layout__con-bottom'>
        <div className='ac-ui-audio-board-wrap'>
          {/* 音频编辑器 */}
          <AudioEditerContainer />
        </div>
        {/* 分页组件 */}
        <Pagination />
      </div>
    </div>
  }
}

export default CoursewareEditer
