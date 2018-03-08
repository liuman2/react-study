import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import join from 'lodash/join'
import isEqual from 'lodash/isEqual'
import { removeNoAudioPage, changeTitle, changeCategory, changeSaveTo, changeDesc, changeTags, createCourseware, setIdentifier } from '../../actions/courseware-action-creator'
import Modal from 'antd/lib/modal'
import Toast from 'components/toast'
import { toSubmitData } from '../../biz/convert'
import { TITLE_MAX_LENGTH } from '../../constants/common-constant'

/**
 * 获取无音频页码数组
 * @param {bool} isSingle
 * @param {array} pages
 */
const getNoAudioPageNumbers = (isSingle, pages, timepoints) => {
  const noAudioPageNumbers = []
  const length = pages.length
  for (let i = 0; i < length; i++) {
    if (isSingle) { // 单页编辑
      pages[i].audio || noAudioPageNumbers.push(i + 1)
    } else { // 全局编辑
      timepoints[i].startTime !== undefined || noAudioPageNumbers.push(i + 1)
    }
  }
  return noAudioPageNumbers
}

@connect(state => {
  const { title, description, editMode, pages, timepoints } = state.coursewareAudioEditer.courseware
  const userInfo = state.coursewareAudioEditer.userInfo
  return {
    uid: userInfo.user_id,
    title,
    description,
    pages,
    timepoints,
    editMode,
    noAudioPageNumbers: getNoAudioPageNumbers(editMode.isSingle, pages, timepoints)
  }
}, {
  removeNoAudioPage,
  changeTitle,
  changeCategory,
  changeSaveTo,
  changeDesc,
  changeTags,
  createCourseware,
  setIdentifier
})
export default class SaveCourseware extends React.Component {
  static propTypes = {
    visible: PropTypes.bool, // 显示或隐藏
    onCancel: PropTypes.func, // 关闭回调
    title: PropTypes.string,
    description: PropTypes.string,
    pages: PropTypes.array,
    editMode: PropTypes.object,
    noAudioPageNumbers: PropTypes.array,
    removeNoAudioPage: PropTypes.func,
    changeTitle: PropTypes.func,
    changeDesc: PropTypes.func,
    createCourseware: PropTypes.func,
    setIdentifier: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      ...this.getStateFromProps(props),
      identifier: null
    }
  }

  componentWillReceiveProps(nextProps) {
    const newState = this.getStateFromProps(nextProps)
    if (!isEqual(this.state, newState)) {
      this.setState(newState)
    }

    const { noAudioPageNumbers, pages, onCancel } = this.props
    if (nextProps.visible) {
      if (!this.props.visible && noAudioPageNumbers.length === pages.length) {
        Toast('课件不存在音频！')
      }
      if (!newState.showNoAudio && !newState.showSave) {
        onCancel()
      }
    }
  }

  getStateFromProps(props) {
    const { visible, noAudioPageNumbers, pages } = props
    let showNoAudio, showSave
    if (visible && pages.length > 0) {
      showSave = noAudioPageNumbers.length === 0
      showNoAudio = showSave ? false : noAudioPageNumbers.length < pages.length
    } else {
      showSave = false
      showNoAudio = false
    }

    return {
      showNoAudio,
      showSave
    }
  }

  save = () => {
    const { title, createCourseware, onCancel, setIdentifier } = this.props
    if (!title) {
      Toast('请输入课件名称')
      return
    }
    const submitData = toSubmitData(this.props)
    createCourseware(submitData).then((res) => {
      this.setState({
        identifier: res.payload.data.identifier
      })
      setIdentifier(res.payload.data.identifier)
      onCancel()
    })
  }

  handleTitleChange = event => {
    const { changeTitle } = this.props
    changeTitle(event.target.value)
  }

  handleDescChange = event => {
    const { changeDesc } = this.props
    changeDesc(event.target.value)
  }

  render() {
    const { onCancel, title, description, editMode, noAudioPageNumbers,
      removeNoAudioPage
    } = this.props
    const { showNoAudio, showSave } = this.state
    return <div>
      {/* 存在无音频数据页的提示 */}
      <Modal
        visible={showNoAudio}
        wrapClassName='ac-fish-pop ac-pop-save2'
        maskClosable={false}
        width='600px'
        title='保存'
        onCancel={onCancel}
        onOk={() => removeNoAudioPage()}>
        <div className='ac-ui-pop__body'>
          <p className='ac-ui-pop__body-txt'>
            {noAudioPageNumbers.length > 5 ? '多个页面' : (join(noAudioPageNumbers, '、') + '页')}
            {editMode.isSingle ? '还未录制或上传音频' : '还未添加时间标签'}，
          </p>
          <p className='ac-ui-pop__body-txt'>
            确定保存这些页面将被删除。
          </p>
        </div>
      </Modal>
      {/* 课件保存 */}
      <Modal
        visible={showSave}
        wrapClassName='ac-fish-pop ac-pop-save'
        maskClosable={false}
        onCancel={onCancel}
        width='800px'
        title='课件保存'
        onOk={this.save}>
        <div className='ac-ui-pop__body'>
          <p className='ac-ui-pop__body-tit'>基本信息</p>
          <div className='ac-ui-pop__body-item'>
            <span className='ac-ui-lab ac-ui-lab--red'>课件名称</span>
            <input className='ac-ui-input ac-ui-input--m' value={title} onChange={this.handleTitleChange} type='text' placeholder='文档名称' maxLength={TITLE_MAX_LENGTH} />
          </div>
          <div className='ac-ui-pop__body-item'>
            <span className='ac-ui-lab'>课件简介</span>
            <textarea className='ac-ui-texrarea' value={description} onChange={this.handleDescChange} maxLength={300} name='' id='' cols='30' rows='10' />
            <p className='ac-ui-texrarea__num'>
              <span className='ac-ui-texrarea__num-cur'>{description.length}</span>/300
            </p>
          </div>
        </div>
      </Modal>
    </div>
  }
}
