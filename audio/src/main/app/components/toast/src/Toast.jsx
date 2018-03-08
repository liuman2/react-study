import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import CSSModules from 'react-css-modules'
import styles from '../styles/toast.scss'

function getUuid() {
  return `toast_${new Date().valueOf()}`
}

@CSSModules(styles, {allowMultiple: true})
class Toast extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toasts: []
    }
    this.show = this.show.bind(this)
    this.remove = this.remove.bind(this)
  }
  remove(id) {
    this.setState(preState => {
      const toasts = preState.toasts.filter(t => t.id !== id)
      return {
        toasts: toasts.filter(t => t.id !== id)
      }
    })
  }
  show(msg, timeout) {
    const toast = {
      msg: msg,
      timeout: timeout,
      id: getUuid()
    }
    this.setState(preState => {
      const toasts = preState.toasts
      toasts.push(toast)
      return {
        toasts: toasts
      }
    })

    setTimeout(() => {
      this.remove(toast.id)
    }, timeout)
  }
  render() {
    const {toasts} = this.state
    return (
      <div>
        {
          toasts.map(toast => {
            return (
              <span key={toast.id} styleName='ac-ui-toast ac-ui-toast-show'>{toast.msg}</span>
            )
          })
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
  let div, _show
  const ref = (ref) => {
    _show = ref.show
  }
  if (!div) {
    div = createDiv()
    ReactDOM.render(<Toast ref={ref} />, div)
  }
  return (msg, timeout = 2000) => {
    _show(msg, timeout)
  }
})()
