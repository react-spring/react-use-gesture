import { ConfigResolverMap } from '../../imports'
import { scrollConfigResolver } from '../../config/scrollConfigResolver'
import { CoordinatesEngine } from '../CoordinatesEngine'
import { Scroll } from '../../utils/events'
import { V } from '../../utils/maths'

ConfigResolverMap.set('scroll', scrollConfigResolver)

export function ScrollEngine(...args) {
  CoordinatesEngine.call(this, ...args, 'scroll')
  this.ingKey = 'scrolling'
}

ScrollEngine.prototype = Object.create(CoordinatesEngine.prototype)

ScrollEngine.prototype.scroll = function (event) {
  if (!this.state._active) this.scrollStart(event)
  else this.scrollChange(event)
  this.timeoutStore.add('scrollEnd', this.scrollEnd.bind(this))
}

ScrollEngine.prototype.scrollStart = function (event) {
  this.start(event)
  this.state.values = Scroll.values(event)
  this.scrollChange(event)
}

ScrollEngine.prototype.scrollChange = function (event) {
  if (event.cancelable) event.preventDefault()
  const state = this.state
  const values = Scroll.values(event)
  const delta = V.sub(values, state.values)
  V.addTo(state._movement, delta)
  state.values = values

  this.compute(event)
  this.emit()
}

ScrollEngine.prototype.scrollEnd = function () {
  if (!this.state._active) return
  this.state._active = false
  this.compute()
  this.emit()
}

ScrollEngine.prototype.bind = function (bindFunction) {
  bindFunction('scroll', '', this.scroll.bind(this))
}
