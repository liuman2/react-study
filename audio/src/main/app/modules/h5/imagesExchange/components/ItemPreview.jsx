import React, { PropTypes } from 'react'
import DragLayer from 'react-dnd/lib/DragLayer'

function collect(monitor) {
  var item = monitor.getItem()
  return {
    index: item && item.id,
    url: item && item.thumUrl,
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
    width: item && item.dragNodeSize.width,
    height: item && item.dragNodeSize.height
  }
}

function getItemStyles(currentOffset, width, height) {
  if (!currentOffset) {
    return {
      display: 'none'
    }
  }
  var x = currentOffset.x
  var y = currentOffset.y
  var transform = `translate(${x}px, ${y}px)`

  return {
    width: `${width}px`,
    height: `${height}px`,
    transform: transform,
    WebkitTransform: transform
  }
}

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
}

@DragLayer(collect)
export default class ItemPreview extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    url: PropTypes.string,
    currentOffset: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    }),
    isDragging: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number
  }

  render() {
    const { index, url, currentOffset, isDragging, width, height } = this.props
    if (!isDragging) {
      return null
    }

    return <div style={layerStyles}>
      <img src={url} style={getItemStyles(currentOffset, width, height)} />
    </div>
  }
}
