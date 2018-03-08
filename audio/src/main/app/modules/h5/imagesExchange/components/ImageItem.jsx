import React, { PropTypes } from 'react'
import { DragSource, DropTarget } from 'react-dnd'
import { findDOMNode } from 'react-dom'

const imageSource = {
  canDrag(props) {
    return props.canDrag
  },
  beginDrag(props, monitor, component) {
    /**
     * 父级尺寸包含了padding，所以这里以img尺寸为准
     */
    const dragNode = findDOMNode(component).getElementsByTagName('img')[0]
    const dragImgRect = dragNode.getBoundingClientRect()
    return {
      dragNodeSize: {
        width: dragImgRect.width,
        height: dragImgRect.height
      },
      index: props.index,
      ...props.imageInfo
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
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top
    const hoverClientX = clientOffset.x - hoverBoundingRect.left

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY && hoverClientX < hoverMiddleX) {
      return
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY && hoverClientX > hoverMiddleX) {
      return
    }

    // Time to actually perform the action
    // props.moveCard(dragIndex, hoverIndex)
    props.changePosition(dragIndex, hoverIndex)

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
export default class ImageItem extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    imageInfo: PropTypes.object,
    index: PropTypes.number,
    removeItem: PropTypes.func,
    canDrag: PropTypes.bool,
    showIndex: PropTypes.bool
  }
  constructor(props) {
    super(props)
    this.state = {
      hover: false
    }
  }
  hoverChange = isHover => {
    this.setState({
      hover: isHover
    })
  }

  remove = () => {
    const { index, removeItem } = this.props
    removeItem(index)
  }

  render() {
    const { imageInfo, connectDragSource, connectDropTarget, canDrag, showIndex, index } = this.props
    return connectDragSource(
      connectDropTarget(
        <li className='img--list__cell' style={{marginBottom: '.4rem'}}>
          <div className='img--view'>
            <img src={imageInfo.thumUrl} />
          </div>
          <div className='img--check' hidden={!canDrag}>
            <a className='img--list__del' onClick={this.remove} />
          </div>
          {showIndex === true ? <div className='img-index'>{index + 1}</div> : null}
        </li>
      )
    )
  }
}
