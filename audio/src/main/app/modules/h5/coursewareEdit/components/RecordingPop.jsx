import React, { Component } from 'react'
import classnames from 'classnames'

export default class RecordingPop extends Component {
  static propTypes = {
    status: React.PropTypes.string,
    durction: React.PropTypes.string,
    visible: React.PropTypes.bool
  }
  render() {
    const {
      status,
      durction,
      visible
    } = this.props
    return (
      <div hidden={!visible} className='recording--modal'>
        <div className='recording--info'><i className='recording--info__dot' />
          {
            status === 'start' ? '正在录音' : '已暂停'
          }
          <span hidden={status !== 'start'} className='recording--info__time'>{durction}</span>
        </div>
        <div className='recording--view'>
          <i
            className={classnames(
              'recording--view__img',
              {
                'recording': status === 'start'
              }
            )}
          />
        </div>
      </div>
    )
  }
}
