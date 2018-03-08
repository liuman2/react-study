import React from 'react'

class RecorderDetector extends React.Component {
  render() {
    const ndrUri = 'https://webfront-exam.sdp.101.com/qashare/exam/detection/play'
    const macToken = encodeURIComponent(window.getCustomAuth(ndrUri, 'get'))
    const url = `${ndrUri}?_mac=${macToken}`
    return <div>
      <iframe src={url} />
    </div>
  }
}

export default RecorderDetector
