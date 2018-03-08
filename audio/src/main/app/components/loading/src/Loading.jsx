import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import CSSModules from 'react-css-modules'
import styles from '../styles/loading.scss'

@CSSModules(styles, {allowMultiple: true})
class LoadingComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadings: []
    }
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
  }
  add(loading) {
    this.setState(preState => {
      return {
        loadings: [loading]
      }
    })
  }
  remove(key) {
    this.setState(preState => {
      return {
        loadings: []
      }
    })
  }
  render() {
    const loadingNodes = this.state.loadings.map((loading, index) => {
      return (
        <div key={index} styleName='c-loading__content' />
      )
    })
    return (
      <div>
        {
          loadingNodes.length ? <div styleName='c-loading'>{loadingNodes}</div> : null
        }
      </div>
    )
  }
}

function createDiv() {
  let div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

export default (() => {
  let _open, _close, div
  const ref = (c) => {
    _open = c.add
    _close = c.remove
  }
  const open = () => {
    if (!div) {
      div = createDiv()
      ReactDOM.render(<LoadingComponent ref={ref} />, div)
    }
    _open(div)
  }
  const close = () => {
    _close()
  }
  return {
    open,
    close
  }
})()
