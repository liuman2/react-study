import React, { Component } from 'react'
import {connect} from 'react-redux'
import { changeTitle, changeCategory, changeSaveTo, changeDesc, createCourseware, previewCourseware } from 'modules/courseware-audio-editer/actions/courseware-action-creator'
import Modal from 'modules/h5/components/Modal'
import Toast from 'components/toast'
import { toSubmitData } from 'modules/courseware-audio-editer/biz/convert'
import { push } from 'react-router-redux/lib/actions'
import Header from 'modules/h5/share/header'
import CSSModules from 'react-css-modules'
import styles from './styles/common.scss'
import { TITLE_MAX_LENGTH } from '../../courseware-audio-editer/constants/common-constant'

@connect(state => {
  const { title, description, editMode, pages, timepoints } = state.coursewareAudioEditer.courseware
  const userInfo = state.coursewareAudioEditer.userInfo
  return {
    uid: userInfo.user_id,
    title,
    description,
    pages,
    timepoints,
    editMode
  }
}, {
  changeTitle,
  changeCategory,
  changeSaveTo,
  changeDesc,
  createCourseware,
  previewCourseware,
  push
})
@CSSModules(styles, {allowMultiple: true})
export default class CoursewareSave extends Component {
  static propTypes = {
    title: React.PropTypes.string,
    pages: React.PropTypes.array,
    changeTitle: React.PropTypes.func,
    createCourseware: React.PropTypes.func,
    previewCourseware: React.PropTypes.func,
    push: React.PropTypes.func
  }
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: true,
      optVisible: false,
      previewVisible: false,
      previewAble: false,
      resourceUrl: null
    }
    this.identifier = null
  }
  componentDidMount() {
    document.body.addEventListener('click', this.hideOpt, false)
  }
  componentWillUnmount() {
    document.body.removeEventListener('click', this.hideOpt)
  }
  hideOpt = (e) => {
    if (e.target.innerText === '操作') return
    this.setState({
      optVisible: false
    })
  }
  handleToggleModal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }
  handleOpenOpt = (e) => {
    this.setState({
      optVisible: !this.state.optVisible
    })
  }
  handleModalCancel = () => {
    this.handleToggleModal()
  }

  /**
   * TITLE
   */
  handleChangleTitle = (e) => {
    this.props.changeTitle(e.target.value)
  }
  handleSave = () => {
    const { title, createCourseware, pages } = this.props
    if (pages.length === 0) {
      Toast('请编辑课件')
      return
    }
    if (!title) {
      Toast('请输入课件名称')
      return
    }

    this.setState({
      previewVisible: true
    })

    const submitData = toSubmitData(this.props)
    createCourseware(submitData).then((res) => {
      this.identifier = res.payload.data.identifier
    })
    this.handleToggleModal()
  }
  handlePreview = () => {
    const { previewCourseware } = this.props
    previewCourseware(this.identifier).then((previewPath) => {
      const mainXml = previewPath.payload.data.url
      let src = null
      switch (window.location.hostname) {
        case '127.0.0.1':
        case 'audio-courseware.dev.web.nd':
          src = `//audio-courseware-player.dev.web.nd/index.html?main=${mainXml}`
          break
        case 'audio-courseware.debug.web.nd':
          src = `//audio-courseware-player.debug.web.nd/index.html?main=${mainXml}`
          break
        case 'audio-courseware.beta.101.com':
          src = `//audio-courseware-player.beta.101.com/index.html?main=${mainXml}`
          break
        case 'audio-courseware.101.com':
          src = `//audio-courseware-player.101.com/index.html?main=${mainXml}`
          break
        default:
      }

      this.setState({
        previewAble: true,
        resourceUrl: src
      })
    })
  }
  stopPreview =() => {
    this.setState({
      previewAble: false
    })
  }
  handleEdit = () => {
    Toast('功能暂未开放')
    // this.props.push('/edit')
  }
  handleDelete = () => {
    Toast('功能暂未开放')
  }
  handleShare = () => {
    Toast('功能暂未开放')
  }
  render() {
    const {
      modalVisible,
      optVisible,
      previewVisible,
      previewAble,
      resourceUrl
    } = this.state
    const {
      title
    } = this.props
    return (
      <div className='layout-wrapper'>
        <Header
          title='课件保存'
          rightBtnText='操作'
          rightBtnAction={(e) => { this.handleOpenOpt(e) }}
        />
        <div className='ui-operate--select' hidden={!optVisible}>
          <ul className='ui-select'>
            {(previewVisible && !previewAble) ? <li className='ui-select--row type-share' onClick={this.handlePreview}>播放</li> : null}
            {previewAble ? <li className='ui-select--row type-share' onClick={this.stopPreview}>停止播放</li> : null}
            {/* <li className='ui-select--row type-edit' onClick={this.handleEdit}>编辑</li> */}
            <li className='ui-select--row type-delete' onClick={this.handleDelete}>删除</li>
            <li className='ui-select--row type-share' onClick={this.handleShare}>分享</li>
          </ul>
        </div>
        {previewAble ? <iframe
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            border: 'none',
            height: '100%',
            width: '1px',
            minWidth: '100%'
          }}
          scrolling={'no'}
          sandbox='allow-same-origin allow-top-navigation allow-scripts allow-forms'
          src={resourceUrl}
        >
          <div style={{ overflow: 'auto', height: 'auto' }} />
        </iframe> : null}

        <Modal
          visible={modalVisible}
          onOk={this.handleSave}
          onCancel={this.handleModalCancel}
          hideCancel
          clickWrapperClose={false}
        >
          <div>
            <p className='modal--save__desc'>请输入课件名称</p>
            <input onChange={this.handleChangleTitle} value={title} type='text' maxLength={TITLE_MAX_LENGTH} className='modal--save__ipt' />
          </div>
        </Modal>
      </div>
    )
  }
}
