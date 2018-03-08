import React from 'react'
import CoursewareEditer from '../courseware-editer/CoursewareEditer'
import WaterfallContainer from '../waterfall-container/WaterfallContainer'

class CoursewareEditerContent extends React.Component {
  render() {
    return <div className='ac-ui-layout__body ac-ui-layout__fix--left'>
      {/* 左侧导航 */}
      <WaterfallContainer />
      {/* 编辑区域 */}
      <CoursewareEditer />
    </div>
  }
}

export default CoursewareEditerContent
