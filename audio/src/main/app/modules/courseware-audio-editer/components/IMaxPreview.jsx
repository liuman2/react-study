import React, {PropTypes} from 'react'

class IMaxPreview extends React.Component {
  static propTypes = {
    page: PropTypes.object
  }
  render() {
    const {page} = this.props
    return <div className='ac-ui-layout__main'>
      <div className='ac-ui-layout__main-doc'>
        <img className='ac-ui-layout__main-img' src={page.imageUrl} alt='' />
      </div>
    </div>
  }
}

export default IMaxPreview
