
class Slider {
  constructor(parent, target, options) {
    this.parent = parent
    this.target = target
    this.options = options
    this.parentLeft = 0
    this.parentWidth = 0
    this._init()
  }
  refresh = () => {
    this._removeEvent()
    this._init()
  }
  setTarget = (target) => {
    this.target = target
    this.refresh()
  }
  setParent = (parent) => {
    this.parent = parent
    this.refresh()
  }
  _removeEvent = () => {
    document.removeEventListener('mousedown', this._handleDown)
    document.removeEventListener('mouseup', this._handleUp)
    document.removeEventListener('mousemove', this._handleMove)
    this.target.map(target => {
      if (!target) return
      target.removeEventListener('mousedown', this._handleDown)
    })
  }
  _init = () => {
    this.parentWidth = this.parent.offsetWidth
    this.parentLeft = this._getParentOffset(this.parent)
    this._addListener()
  }
  _getParentOffset = (element) => {
    let elementLeft = element.offsetLeft
    let parent = element.offsetParent
    while (parent !== null) {
      elementLeft += parent.offsetLeft
      parent = parent.offsetParent
    }
    return elementLeft
  }
  _getPosition = (e) => {
    const posX = e.clientX - this.parentLeft
    const sum = this.parentWidth
    const position = parseFloat(posX / sum, 10).toFixed(2)
    const left = `${position * 100}%`
    if (position < 0 || position > 1) return {}
    return {
      position,
      left
    }
  }
  _addListener = () => {
    if (!this.target) return
    this.target.map(target => {
      if (!target) return
      target.addEventListener('mousedown', this._handleDown)
    })
  }
  _handleDown = (e) => {
    document.addEventListener('mouseup', this._handleUp)
    document.addEventListener('mousemove', this._handleMove)
    if (this.options.onDown) {
      this.options.onDown(this._getPosition(e))
    }
  }
  _handleUp = (e) => {
    document.removeEventListener('mousemove', this._handleMove)
    if (this.options.onUp) {
      const data = this._getPosition(e)
      this.options.onUp({
        ...data,
        event: e,
        target: this.target
      })
    }
  }
  _handleMove = (e) => {
    e.preventDefault()
    if (this.options.onMove) {
      const data = this._getPosition(e)
      this.options.onMove({
        ...data,
        event: e,
        target: this.target
      })
    }
  }
}

export default Slider
