/**
 * url?userId&option&backurl
 *
userId: 必须
backurl: 点击导入后的会跳地址
option: 配置项
{
  multiple: false, // 是否允许多选，默认false
  crosscategory: false, //是否允许选择多个分类的内容
  // 每个分类的名称，单独配置的multiple，会覆盖全局的multiple
  categorys: [{
    name: 'document'
  }, {
    name: 'image',
    multiple: true
  }]
}
  TODO: 列表分页
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux/lib/actions'
import {
  init,
  switchRepository,
  getAssetsList,
  changeSearchKey,
  switchAssetsCategory,
  prevPage,
  nextPage
} from 'modules/courseware-audio-editer/actions/resource-repository-action-creator'
import { CATEGORY } from 'modules/courseware-audio-editer/reducers/resource-repository-reducer'
import ResourceFileList from './components/ResourceFileList'
import ResourceImageList from './components/ResourceImageList'
import Header from 'modules/h5/share/header'
import { resourceImport } from './ResourceImportUntil'
import Toast from 'components/toast'

@connect(
  state => ({
    userId: state.coursewareAudioEditer.resourceRepository.userId,
    filter: state.coursewareAudioEditer.resourceRepository.filter,
    list: state.coursewareAudioEditer.resourceRepository.list,
    totalPage: state.coursewareAudioEditer.resourceRepository.totalPage,
    currentPage: state.coursewareAudioEditer.resourceRepository.currentPage,
    repositoryTypes:
      state.coursewareAudioEditer.resourceRepository.repositoryTypes,
    currentRepositoryType:
      state.coursewareAudioEditer.resourceRepository.currentRepositoryType,
    categorys: state.coursewareAudioEditer.resourceRepository.categorys,
    selectedFileSize:
      state.coursewareAudioEditer.resourceRepository.selectedFileSize,
    routing: state.routing.locationBeforeTransitions,
    currentCategory:
      state.coursewareAudioEditer.resourceRepository.currentCategory,
    selected: state.coursewareAudioEditer.resourceRepository.selected
  }),
  {
    push,
    init,
    switchRepository,
    getAssetsList,
    changeSearchKey,
    switchAssetsCategory,
    prevPage,
    nextPage
  }
)
export default class ResourceRepository extends Component {
  static propTypes = {
    location: React.PropTypes.object,
    userId: React.PropTypes.number,
    filter: React.PropTypes.object,
    list: React.PropTypes.array,
    totalPage: React.PropTypes.number,
    currentPage: React.PropTypes.number,
    push: React.PropTypes.func,
    repositoryTypes: React.PropTypes.array,
    currentRepositoryType: React.PropTypes.object,
    categorys: React.PropTypes.array,
    selectedFileSize: React.PropTypes.string,
    init: React.PropTypes.func,
    switchRepository: React.PropTypes.func,
    changeSearchKey: React.PropTypes.func,
    switchAssetsCategory: React.PropTypes.func,
    getAssetsList: React.PropTypes.func,
    routing: React.PropTypes.object,
    history: React.PropTypes.object,
    currentCategory: React.PropTypes.object,
    selected: React.PropTypes.array,
    prevPage: React.PropTypes.func,
    nextPage: React.PropTypes.func
  }
  static contextTypes = {
    store: React.PropTypes.object
  }
  constructor(props) {
    super(props)
    if (!props.location.query.userId) {
      alert('必须要有参数userId')
      return
    }
    // 根据参数初始化分类列表
    props.init(props.location.query)
  }
  componentWillMount() {
    setTimeout(() => {
      this.props.getAssetsList(this.props.filter)
    }, 0)
  }
  componentDidMount() {
    console.log()
    console.log(this.props.routing)
  }
  handleImportConfirm = () => {
    // if (this.props.routing.query.action) {
    //   this.context.store.dispatch({
    //     type: this.props.routing.query.action,
    //     payload: {}
    //   })
    // }
    const { currentCategory, selected, userId, push } = this.props
    if (!selected.length) {
      return
    }
    resourceImport(currentCategory.name, selected, userId)
      .then(action => {
        this.context.store.dispatch(action)
        if (currentCategory.name === 'IMAGE') {
          push('/images-exchange')
        } else if (this.props.routing.query.backUrl) {
          push(this.props.routing.query.backUrl)
        } else {
          this.props.history.goBack()
        }
      })
      .catch(errObj => {
        Toast(errObj.message)
      })
    // this.props.history.goBack()
  }

  handleRepositorySwitch = repositoryType => {
    clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(() => {
      if (repositoryType.code === this.props.currentRepositoryType.code) {
        return
      }
      this.props.switchRepository(repositoryType)
      this.props.getAssetsList(this.props.filter)
    }, 300)
  }

  handleSearchKeyChange = value => {
    clearTimeout(this.timeoutId)
    this.timeoutId = setTimeout(() => {
      this.props.changeSearchKey(value)
      this.props.getAssetsList(this.props.filter)
    }, 300)
  }

  handleCategorySwitch = category => {
    clearTimeout(this.timeoutId2)
    this.timeoutId2 = setTimeout(() => {
      this.props.switchAssetsCategory(category.code)
      if (!category.isOpen) {
        this.props.getAssetsList(this.props.filter)
      }
    }, 50)
  }

  prevPage = () => {
    this.props.prevPage()
    setTimeout(() => {
      this.props.getAssetsList(this.props.filter)
    }, 50)
  }

  nextPage= () => {
    this.props.nextPage()
    setTimeout(() => {
      this.props.getAssetsList(this.props.filter)
    }, 50)
  }

  render() {
    return (
      <div className='select-wrapper'>
        <Header title='从资源库选择' hiddenBtn />
        <ul className='ui-tab'>
          {this.props.repositoryTypes.map(type => {
            return (
              <li
                className={
                  type.code === this.props.currentRepositoryType.code
                    ? 'ui-tab--cell current'
                    : 'ui-tab--cell'
                }
                onClick={() => this.handleRepositorySwitch(type)}
                key={type.code}
              >
                {type.name}
              </li>
            )
          })}
        </ul>
        <div className='ui-search'>
          <input
            className='ui-input__search'
            placeholder='搜索'
            type='text'
            onKeyUp={evt => this.handleSearchKeyChange(evt.target.value)}
          />
          <a className='ui-btn__search' />
        </div>
        <div className='select--body'>
          <div className='select--list__group'>
            <p className='select--list__tip' style={{padding: 0}}>
              支持上传PPT / PDF / Word / 图片格式的文件
            </p>
            <p className='select--list__tip' style={{padding: 0}}>
              图片仅支持jpg / png格式
            </p>
            <ul className='select--list'>
              {this.props.categorys.map(category => {
                return (
                  <li
                    className={`select--list__row ${category.isOpen ? 'open' : ''
                      }`}
                  >
                    <p className='select--list__title' onClick={() => {
                      this.handleCategorySwitch(category)
                    }}>
                      <i className='select--title__icon' />
                      {category.label}
                    </p>
                    {(categoryCode => {
                      if (!category.isOpen) {
                        return ''
                      }
                      switch (categoryCode) {
                        case CATEGORY.DOCUMENT:
                          return (
                            <ResourceFileList
                              list={this.props.list}
                              totalPage={this.props.totalPage}
                              currentPage={this.props.currentPage}
                              type={'document'}
                              prevPage={this.prevPage}
                              nextPage={this.nextPage}
                            />
                          )
                        case CATEGORY.IMAGE:
                          return <ResourceImageList list={this.props.list} totalPage={this.props.totalPage} currentPage={this.props.currentPage} prevPage={this.prevPage} nextPage={this.nextPage} />
                        case CATEGORY.AUDIO:
                          return (
                            <ResourceFileList
                              list={this.props.list}
                              totalPage={this.props.totalPage}
                              currentPage={this.props.currentPage}
                              type={'audio'}
                              prevPage={this.prevPage}
                              nextPage={this.nextPage}
                            />
                          )
                      }
                    })(category.code)}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <div className='select--info'>
          <span className='select--info__size'>
            {this.props.selectedFileSize
              ? `已选${this.props.selectedFileSize}`
              : ''}
          </span>
          <div className='select--info__right'>
            <a
              className={`ui-btn ui-btn__default ${
                this.props.selectedFileSize ? '' : 'disabled'
                }`}
              onClick={this.handleImportConfirm}
              style={{ marginTop: '0.12rem' }}
            >
              导入
            </a>
          </div>
        </div>
      </div>
    )
  }
}
