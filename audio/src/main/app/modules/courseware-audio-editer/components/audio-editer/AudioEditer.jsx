import React, { PropTypes } from 'react'
import SingleAudioEditer from './single/SingleAudioEditer'
import GlobalAudioEditer from './global/GlobalAudioEditer'

class AudioEditer extends React.Component {
  static propTypes = {
    isSingleMode: PropTypes.bool // 是否单页编辑
  }
  render() {
    const { isSingleMode } = this.props
    let structure
    if (isSingleMode) {
      structure = <SingleAudioEditer />
    } else {
      structure = <GlobalAudioEditer />
    }
    return <ul className='ac-ui-tab'>
      {structure}
    </ul>
  }
}

export default AudioEditer
