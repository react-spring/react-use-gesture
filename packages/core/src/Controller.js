import { EngineMap } from './imports'
import { parse } from './config/resolver'
import { Touches, isTouch, toReactHandlerProp } from './utils/events'
import { EventStore } from './EventStore'
import { TimeoutStore } from './TimeoutStore'
import { chain } from './utils/fn'

export function Controller(handlers) {
  this._gestures = new Set()
  this._targetEventStore = new EventStore(this)
  this._gestureEventStores = {}
  this._gestureTimeoutStores = {}
  this._handlers = {}
  this._nativeHandlers = {}
  this._config = {}
  this._pointerIds = new Set()
  this._touchIds = new Set()
  this.state = {}

  resolveGestures(this, handlers)
}

Controller.prototype.setupGesture = function (gestureKey) {
  this._gestures.add(gestureKey)
  this._gestureEventStores[gestureKey] = new EventStore(this)
  this._gestureTimeoutStores[gestureKey] = new TimeoutStore()
}

Controller.prototype.setEventIds = function (event) {
  if (isTouch(event)) {
    this._touchIds = new Set(Touches.ids(event))
  } else if ('pointerId' in event) {
    if (event.type === 'pointerup') this._pointerIds.delete(event.pointerId)
    else this._pointerIds.add(event.pointerId)
  }
}

Controller.prototype.applyHandlers = function (handlers, nativeHandlers) {
  this._handlers = handlers
  this._nativeHandlers = nativeHandlers
}

Controller.prototype.applyConfig = function (config, gestureKey) {
  this._config = parse(config, gestureKey)
}

Controller.prototype.clean = function () {
  this._targetEventStore.clean()
  for (const key of this._gestures) {
    this._gestureEventStores[key].clean()
    this._gestureTimeoutStores[key].clean()
  }
}

Controller.prototype.effect = function () {
  if (this._config.shared.target) this.bind()
  return () => this._targetEventStore.clean()
}

Controller.prototype.bind = function (...args) {
  const sharedConfig = this._config.shared
  const eventOptions = sharedConfig.eventOptions
  const props = {}

  const bindFunction = sharedConfig.target
    ? bindToEventStore(this._targetEventStore, sharedConfig.target())
    : bindToProps(props, eventOptions)

  if (sharedConfig.enabled) {
    // Adding native handlers
    for (const eventKey in this._nativeHandlers) {
      bindFunction(eventKey, '', (event) => this._nativeHandlers[eventKey]({ ...this.state.shared, event, args }))
    }

    // Adding gesture handlers
    for (const gestureKey of this._gestures) {
      if (this._config[gestureKey].enabled) {
        const Engine = EngineMap.get(gestureKey)
        new Engine(this, args).bind(bindFunction)
      }
    }
  }

  // If target isn't set, we return an object that contains gesture handlers
  // mapped to props handler event keys.
  if (!sharedConfig.target) {
    for (const handlerProp in props) {
      props[handlerProp] = chain(...props[handlerProp])
    }
    return props
  }
}

function resolveGestures(ctrl, internalHandlers) {
  if (internalHandlers.drag) ctrl.setupGesture('drag')
  if (internalHandlers.wheel) ctrl.setupGesture('wheel')
  if (internalHandlers.scroll) ctrl.setupGesture('scroll')
  if (internalHandlers.move) ctrl.setupGesture('move')
  if (internalHandlers.pinch) ctrl.setupGesture('pinch')
  if (internalHandlers.hover) ctrl.setupGesture('hover')
}

const bindToEventStore = (eventStore, target) => (device, action, handler, options) => {
  eventStore.add(target, device, action, handler, options)
}

const bindToProps = (props, eventOptions) => (device, action, handler, options = {}) => {
  const capture = options.capture ?? eventOptions.capture
  const handlerProp = toReactHandlerProp(device, action, capture)
  props[handlerProp] = props[handlerProp] || []
  props[handlerProp].push(handler)
}
