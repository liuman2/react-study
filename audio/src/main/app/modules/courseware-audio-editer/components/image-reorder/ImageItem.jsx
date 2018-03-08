import React, { PropTypes } from 'react'
import classnames from 'classnames'
import { DragSource, DropTarget } from 'react-dnd'
import { findDOMNode } from 'react-dom'
import isEqual from 'lodash/isEqual'
import { getCsThumUrl } from 'app/utils/url'

const imageSource = {
  beginDrag(props) {
    const { index } = props
    return {
      index
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
  },
  drop(props) {
    const { dropped, index } = props
    dropped && dropped(index)
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
    isDragging: PropTypes.bool.isRequired,
    imageInfo: PropTypes.object,
    index: PropTypes.number,
    dragged: PropTypes.bool, // 当前拖拽或上次拖拽并且未产生新拖拽
    removeItem: PropTypes.func,
    dropped: PropTypes.func,
    showIndex: PropTypes.bool
  }
  constructor(props) {
    super(props)
    this.state = {
      hover: false
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextProps, this.props) || !isEqual(nextState, this.state)
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
    const { hover } = this.state
    const { dragged, imageInfo, connectDragSource, connectDropTarget, isDragging, index, showIndex } = this.props
    return connectDragSource(
      connectDropTarget(
        <li className='apr-item-li' onMouseEnter={() => this.hoverChange(true)} onMouseLeave={() => this.hoverChange(false)} >
          <span className={classnames(
            'ac-picture-reordering-item',
            {
              'apri--active': dragged
            }
          )}>
            <a className={classnames(
              'ac-ui-button-icon',
              { 'aubi-small-close ac-ui-button-icon--active': !isDragging && hover }
            )} onClick={this.remove} />
            {/* <!-- ac-ui-button-icon加类ac-ui-button-icon--active表示选中 --> */}
            <img className='apr-img' src={getCsThumUrl(imageInfo.url, 290)} alt='' />
          </span>
          {showIndex ? <div style={{textAlign: 'center'}}>{index + 1}</div> : null}
        </li>
      )
    )
  }
}

// export default flow(
//   DropTarget('IMAGE', imageTarget, connect => ({
//     connectDropTarget: connect.dropTarget()
//   })),
//   DragSource('IMAGE', imageSource, connect => ({
//     connectDragSource: connect.dragSource()
//   }))
// )(ImageItem)
