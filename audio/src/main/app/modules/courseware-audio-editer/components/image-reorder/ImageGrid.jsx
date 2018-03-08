import React, { PropTypes } from 'react'
import ImageItem from './ImageItem'
import map from 'lodash/map'
import { connect } from 'react-redux'
import { removeItem, changePosition } from '../../actions/imagereorder-action-creator'

@connect(state => ({}), {
  removeItem,
  changePosition
})
class ImageGrid extends React.Component {
  static propTypes = {
    reorderImages: PropTypes.array,
    removeItem: PropTypes.func,
    changePosition: PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      draggedIndex: -1 // 当前拖动或上次拖动的item index
    }
  }

  dropped = index => {
    this.setState({
      draggedIndex: index
    })
  }

  render() {
    const { reorderImages, ...itemProps } = this.props
    const { draggedIndex } = this.state
    const shouldShowIndex = true
    return <div className='apr-item-wrap' style={{fontSize: '12px'}}>
      <ul className='apr-item-ul'>
        {map(reorderImages, (value, index) => <ImageItem key={index} {...itemProps} index={index} dragged={draggedIndex === index} imageInfo={value} dropped={this.dropped} showIndex={shouldShowIndex} />)}
      </ul>
    </div>
  }
}

export default ImageGrid
