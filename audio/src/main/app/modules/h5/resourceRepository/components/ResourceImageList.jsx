import React, { Component } from 'react'
import { connect } from 'react-redux'
import isArray from 'lodash/isArray'
import config from 'config'
import {
  addSelectItem,
  removeSelectItem
} from 'modules/courseware-audio-editer/actions/resource-repository-action-creator'

@connect(state => ({}), {
  addSelectItem,
  removeSelectItem
})
export default class ResourceImageList extends Component {
  static propTypes = {
    list: React.PropTypes.array,
    addSelectItem: React.PropTypes.func,
    removeSelectItem: React.PropTypes.func,
    prevPage: React.PropTypes.func,
    nextPage: React.PropTypes.func,
    totalPage: React.PropTypes.number,
    currentPage: React.PropTypes.number
  }
  getImageSrc = src => {
    if (!src) {
      return
    }
    return src.replace(`\${ref-path}`, `${config.cs_host}/v0.1/static`)
  }
  render() {
    const { list, addSelectItem, removeSelectItem, totalPage, currentPage, prevPage, nextPage } = this.props
    console.log(this.props)
    return (
      <div>
        <ul className='img--list'>
          {isArray(list) && list.length > 0 ? (
            list.map(item => (
              <li
                className='img--list__cell'
                onClick={() => {
                  if (!item.selectable) {
                    alert('图片仅支持jpg/png格式')
                    return
                  }
                  item._selected ? removeSelectItem(item) : addSelectItem(item)
                }
                }
                key={item.identifier}
              >
                <div className={`img--view ${item.selectable ? '' : 'img-disabled'}`}>
                  <img src={this.getImageSrc(item.tech_info.href.location + '?size=240')} />
                </div>
                <div className='img--check'>
                  <label
                    className={'ui-checkbox' + (item._selected ? ' checked' : '')}
                  />
                </div>
              </li>
            ))
          ) : (
            <li className='list--empty__name'>暂无数据</li>
          )}
        </ul>
        {totalPage && totalPage > 1 ? (
          <div style={{
            textAlign: 'center',
            margin: '.1rem .2rem',
            color: '#fff',
            padding: '.1rem .1rem .1rem .2rem',
            overflow: 'hidden'}}
          >
            {currentPage > 0 ? <a style={{float: 'left'}} onClick={prevPage}>上一页</a> : null}
            {currentPage < totalPage ? <a style={{float: 'right'}} onClick={nextPage}>下一页</a> : null}
          </div>
        ) : null}
      </div>
    )
  }
}
