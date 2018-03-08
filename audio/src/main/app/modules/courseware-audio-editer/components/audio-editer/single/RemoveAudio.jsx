import React, { PropTypes } from 'react'

export default class RemoveAudio extends React.Component {
  static propTypes = {
    removeAudio: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      confirmModalVisible: false
    }
  }

  clickRemoveAudio = () => {
    this.setState({
      confirmModalVisible: true
    })
  }

  handleModalCancel = () => {
    this.setState({
      confirmModalVisible: false
    })
  }

  confirmRemove = () => {
    const { removeAudio } = this.props
    removeAudio()
  }
}
