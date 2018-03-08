import React, { Component } from 'react'
import {connect} from 'react-redux'
import { h5BottomTypeSet, removeAudio } from 'modules/courseware-audio-editer/actions/courseware-action-creator'
import Modal from 'modules/h5/components/Modal'

@connect(state => ({}), {
  h5BottomTypeSet,
  removeAudio
})
export default class DeleteBtn extends Component {
  static propTypes = {
    h5BottomTypeSet: React.PropTypes.func,
    removeAudio: React.PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false
    }
  }
  handleToggleVisible = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }
  handleRemoveAudio = () => {
    this.props.removeAudio()
    this.props.h5BottomTypeSet(0)
  }
  render() {
    const {
      modalVisible
    } = this.state
    return (
      <div className='upload--delete'>
        <a className='ui-btn ui-btn__main' onClick={this.handleToggleVisible}>删除音频</a>
        <Modal
          visible={modalVisible}
          onOk={this.handleRemoveAudio}
          onCancel={this.handleToggleVisible}
          okText='是'
          cancelText='否'
        >
          <p className='modal--save__desc'>确定删除该页音频吗？</p>
        </Modal>
      </div>
    )
  }
}
