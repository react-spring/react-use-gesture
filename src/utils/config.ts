import { FullUserConfig, PartialUserConfig, InternalConfig } from '../types'

const DEFAULT_DRAG_DELAY = 180

// default config (will extend user config)
export const defaultConfig: FullUserConfig = {
  domTarget: undefined,
  eventOptions: { passive: true, capture: false, pointer: false },
  window: typeof window !== 'undefined' ? window : undefined,
  enabled: true,
  drag: {
    enabled: true,
    filterClicks: false,
    intentionalThreshold: undefined,
    delay: false,
    swipeVelocity: 0.5,
    swipeDistance: 100,
  },
}

/**
 * 2nd level merge of a1 into a2
 * @param a1 array to be merged
 * @param a2 default array
 */
const merge = <T>(a1: Partial<T>, a2: T): T =>
  Object.entries(a1).reduce((acc, [name, value]) => {
    // @ts-ignore
    // if value is an object (and not the window key object) we merge it with default
    if (typeof value === 'object' && name !== 'window') return { ...acc, [name]: { ...a2[name], ...value } }
    // @ts-ignore
    // otherwise we just take the config value if it exists
    return { ...acc, [name]: a2[name] || value }
  }, a2)

export function getDerivedConfig(config: PartialUserConfig): InternalConfig {
  // first we merge the config with the default config
  const mergedConfig = merge(config, defaultConfig)

  const {
    eventOptions: { passive, capture, pointer },
    domTarget,
    ...rest
  } = mergedConfig

  const derivedConfig = {
    ...rest,
    domTarget: domTarget && 'current' in domTarget ? domTarget.current : domTarget,
    // if there isn't a domtarget or if event.passive is true, then passiveEvents is true
    eventOptions: { passive: !mergedConfig.domTarget || passive, capture },
    pointer: pointer,
    captureString: capture ? 'Capture' : '',
  }

  const { intentionalThreshold, swipeVelocity, swipeDistance, delay } = derivedConfig.drag

  // TODO utility that does that
  if (intentionalThreshold === void 0) {
    derivedConfig.drag.intentionalThreshold = derivedConfig.drag.filterClicks ? [3, 3] : [0, 0]
  } else {
    derivedConfig.drag.filterClicks = true
    if (typeof intentionalThreshold === 'number') {
      derivedConfig.drag.intentionalThreshold = [intentionalThreshold, intentionalThreshold]
    }
  }

  if (typeof swipeVelocity === 'number') {
    derivedConfig.drag.swipeVelocity = [swipeVelocity, swipeVelocity]
  }

  if (typeof swipeDistance === 'number') {
    derivedConfig.drag.swipeDistance = [swipeDistance, swipeDistance]
  }

  derivedConfig.drag.delay = typeof delay === 'number' ? delay : delay ? DEFAULT_DRAG_DELAY : 0

  return <InternalConfig>derivedConfig
}