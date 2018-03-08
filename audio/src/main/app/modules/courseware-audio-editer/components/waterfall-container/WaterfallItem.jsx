import React, { PropTypes } from 'react'
import classnames from 'classnames'
import { DragSource, DropTarget } from 'react-dnd'
import { findDOMNode } from 'react-dom'
import { getCsThumUrl } from 'app/utils/url'

const imageSource = {
  beginDrag(props) {
    return {
      index: props.index
    }
  }
}

const imageTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    // Time to actually perform the action
    // props.moveCard(dragIndex, hoverIndex)
    props.movePage(dragIndex, hoverIndex)

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
  }
}

@DropTarget('IMAGE', imageTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource('IMAGE', imageSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class WaterfallItem extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    page: PropTypes.object,
    index: PropTypes.number,
    isActive: PropTypes.bool,
    goPage: PropTypes.func.isRequired
  }

  pageClick = () => {
    const { index, goPage } = this.props
    goPage(index)
  }

  render() {
    const { page, index, isActive, connectDragSource, connectDropTarget } = this.props
    return connectDragSource(
      connectDropTarget(
        <li className='aui__sider-li' onClick={this.pageClick}>
          <span className='aui__sider-li-index'>{index + 1}</span>
          <span className={classnames(
            'aui__sider-doc',
            { 'aui__sider-doc--active': isActive }
          )}>
            <img className='aui__sider-img' src={getCsThumUrl(page.imageUrl, 290)} alt='' />
            <i className={classnames(
              'ac-ui-icon',
              // 有音频无来源数据，默认用audio标识
              page.audio && page.audio.from === 'upload' ? 'ac-ui-icon-audio-tip' : 'ac-ui-icon-sound-tip',
              {
                // 'ac-ui-icon-sound-tip': page.audio && page.audio.from === 'record',
                // 'ac-ui-icon-audio-tip': page.audio && page.audio.from === 'upload',
                'hide': !page.audio
              }
            )} />
            {/* <!-- ac-ui-icon 加类ac-ui-icon-audio-tip代表有音频，加类hide可以隐藏 --> */}
          </span>
        </li>
      )
    )
  }
}

export default WaterfallItem
