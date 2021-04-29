export const EngineMap = new Map()
export const ConfigResolverMap = new Map()

export function registerEngine(action, Engine) {
  EngineMap.set(action, Engine)
}

const RE_NOT_NATIVE = /^on(Drag|Wheel|Scroll|Move|Pinch|Hover)/

function sortHandlers(_handlers) {
  const native = {}
  const handlers = {}
  const actions = new Set()

  for (let key in _handlers) {
    if (RE_NOT_NATIVE.test(key)) {
      actions.add(RegExp.lastMatch)
      handlers[key] = _handlers[key]
    } else {
      native[key.slice(2).toLowerCase()] = _handlers[key]
    }
  }

  return [handlers, native, actions]
}

function registerGesture(actions, handlers, handlerKey, key, internalHandlers, config) {
  if (!actions.has(handlerKey)) return

  const startKey = handlerKey + 'Start'
  const endKey = handlerKey + 'End'

  const fn = (state) => {
    let memo = undefined
    if (state.first && startKey in handlers) handlers[startKey](state)
    if (handlerKey in handlers) memo = handlers[handlerKey](state)
    if (state.last && endKey in handlers) handlers[endKey](state)
    return memo
  }

  internalHandlers[key] = fn
  config[key] = config[key] || {}
}

export function parseMergedHandlers(mergedHandlers, mergedConfig) {
  const [handlers, nativeHandlers, actions] = sortHandlers(mergedHandlers)

  const internalHandlers = {}

  registerGesture(actions, handlers, 'onDrag', 'drag', internalHandlers, mergedConfig)
  registerGesture(actions, handlers, 'onWheel', 'wheel', internalHandlers, mergedConfig)
  registerGesture(actions, handlers, 'onScroll', 'scroll', internalHandlers, mergedConfig)
  registerGesture(actions, handlers, 'onPinch', 'pinch', internalHandlers, mergedConfig)
  registerGesture(actions, handlers, 'onMove', 'move', internalHandlers, mergedConfig)
  registerGesture(actions, handlers, 'onHover', 'hover', internalHandlers, mergedConfig)

  return { handlers: internalHandlers, config: mergedConfig, nativeHandlers }
}
