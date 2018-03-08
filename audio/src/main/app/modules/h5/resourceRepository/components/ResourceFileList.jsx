import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatTime } from 'utils/format-time'
import { convertSizeToKB } from 'utils/format-unit'
import isArray from 'lodash/isArray'
import {
  addSelectItem,
  removeSelectItem
} from 'modules/courseware-audio-editer/actions/resource-repository-action-creator'

const FILE_ICON = {
  ppt: 'ppt',
  pptx: 'ppt',
  doc: 'word',
  docx: 'word',
  pdf: 'pdf'
}

@connect(state => ({}), {
  addSelectItem,
  removeSelectItem
})
export default class ResourceFileList extends Component {
  static propTypes = {
    type: React.PropTypes.string,
    list: React.PropTypes.array,
    addSelectItem: React.PropTypes.func,
    removeSelectItem: React.PropTypes.func,
    prevPage: React.PropTypes.func,
    nextPage: React.PropTypes.func,
    totalPage: React.PropTypes.number,
    currentPage: React.PropTypes.number
  }
  getFileIcon = (fileNameHaveExt, type) => {
    if (type === 'audio') {
      return 'audio'
    }

    if (!fileNameHaveExt) {
      return ''
    }
    let result = fileNameHaveExt.split('.')
    if (result.length > 1) {
      return FILE_ICON[result[result.length - 1]] || ''
    }
    return ''
  }

  render() {
    // type: audio\document
    // 区别在于document会根据文件名后缀去取图标，audio图标固定为音频图标
    const { type, list, addSelectItem, removeSelectItem, totalPage, currentPage, prevPage, nextPage } = this.props
    return (
      <div>
        <ul className='file--list'>
          {isArray(list) && list.length > 0 ? (
            list.map(item => (
              <li
                className='file--list__row'
                onClick={() => {
                  if (!item.selectable) {
                    alert(type === 'audio' ? '音频只支持mp3、wma、wav' : '文档仅支持PPT/PDF/Word')
                    return
                  }
                  item._selected ? removeSelectItem(item) : addSelectItem(item)
                }
                }
                key={item.identifier}
              >
                <label
                  className={`ui-checkbox${item._selected ? ' checked' : ''} ${item.selectable ? '' : 'ui-checkbox-disabled'}`}
                />
                <i className={`file--type ${this.getFileIcon(item.title, type)} ${item.selectable ? '' : 'img-disabled'}`} />
                <div
                  className='file--info'
                  title={item.title}
                  style={{ overflow: 'hidden' }}
                >
                  <p className={`file--info__name ${item.selectable ? '' : 'item-disabled'}`}>{item.title}</p>
                  <p className='file--info__other'>
                    <span className='file--info__size'>
                      {convertSizeToKB(item.tech_info.href.size)}
                    </span>{' '}
                    &nbsp;
                    <span className='file--info__time'>
                      {formatTime(item.life_cycle.last_update, 'YYYY-MM-dd HH:mm:ss')}
                    </span>
                  </p>
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
