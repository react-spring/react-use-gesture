import { Controller } from '../Controller'
import { getEventDetails } from '../utils/events'
import { call } from '../utils/fn'
import { V, computeRubberband } from '../utils/maths'
import { GestureKey, IngKey, State, Vector2 } from '../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Engine<Key extends GestureKey> {
  /**
   * Function that some gestures can use to add initilization
   * properties to the state when it is created.
   */
  init?(): void
  /**
   * Setup function that some gestures can use to set additional properties of
   * the state when the gesture starts.
   */
  setup?(): void
  /**
   * Function used by some gestures to determine the intentionality of a
   * a movement depending on thresholds. The intent function can change the
   * `state._active` or `state._blocked` flags if the gesture isn't intentional.
   * @param movement
   */
  intent?(movement: Vector2): void
}

export abstract class Engine<Key extends GestureKey> {
  /**
   * The Controller handling state.
   */
  ctrl: Controller
  /**
   * The gesture key ('drag' | 'pinch' | 'wheel' | 'scroll' | 'move' | 'hover')
   */
  readonly key: Key
  /**
   * The key representing the active state of the gesture in the shared state.
   * ('dragging' | 'pinching' | 'wheeling' | 'scrolling' | 'moving' | 'hovering')
   */
  abstract readonly ingKey: IngKey
  /**
   * The arguments passed to the `bind` function.
   */

  /**
   * State prop that aliases state values (`xy` or `da`).
   */
  abstract readonly aliasKey: string

  args: any[]

  rAF_id: number = -1

  constructor(ctrl: Controller, args: any[], key: Key) {
    this.ctrl = ctrl
    this.args = args
    this.key = key

    if (!this.state) {
      this.state = {
        values: [0, 0],
        initial: [0, 0]
      } as any
      if (this.init) this.init()
      this.reset()
    }
  }
  /**
   * Function implemented by gestures that compute the offset from the state
   * movement.
   */
  abstract computeOffset(): void
  /**
   * Function implemented by the gestures that compute the movement from the
   * corrected offset (after bounds and potential rubberbanding).
   */
  abstract computeMovement(): void
  /**
   * Executes the bind function so that listeners are properly set by the
   * Controller.
   * @param bindFunction
   */
  abstract bind(
    bindFunction: (
      device: string,
      action: string,
      handler: (event: any) => void,
      options?: AddEventListenerOptions
    ) => void
  ): void

  /**
   * Shortcut to the gesture state read from the Controller.
   */
  get state() {
    return this.ctrl.state[this.key]!
  }
  set state(state) {
    this.ctrl.state[this.key] = state
  }
  /**
   * Shortcut to the shared state read from the Controller
   */
  get shared() {
    return this.ctrl.state.shared
  }
  /**
   * Shortcut to the gesture event store read from the Controller.
   */
  get eventStore() {
    return this.ctrl.gestureEventStores[this.key]!
  }
  /**
   * Shortcut to the gesture timeout store read from the Controller.
   */
  get timeoutStore() {
    return this.ctrl.gestureTimeoutStores[this.key]!
  }
  /**
   * Shortcut to the gesture config read from the Controller.
   */
  get config() {
    return this.ctrl.config[this.key]!
  }
  /**
   * Shortcut to the shared config read from the Controller.
   */
  get sharedConfig() {
    return this.ctrl.config.shared
  }
  /**
   * Shortcut to the gesture handler read from the Controller.
   */
  get handler() {
    return this.ctrl.handlers[this.key]!
  }

  reset() {
    const { state, shared, config, ingKey, args } = this
    const { transform, threshold = [0, 0] } = config
    shared[ingKey] = state._active = state.active = state._blocked = state._force = false
    state._step = [false, false]
    state.intentional = false
    state._movement = [0, 0]
    state._distance = [0, 0]
    state._delta = [0, 0]
    // the _threshold is the difference between a [0,0] origin offset converted to
    // its new space coordinates
    state._threshold = V.sub(transform(threshold), transform([0, 0])).map(Math.abs) as Vector2
    // prettier-ignore
    state._bounds = [[-Infinity, Infinity], [-Infinity, Infinity]]
    state.args = args
    state.axis = undefined
    state.memo = undefined
    state.elapsedTime = 0
    state.direction = [0, 0]
    state.distance = [0, 0]
    state.velocity = [0, 0]
    state.movement = [0, 0]
    state.delta = [0, 0]
    state.timeStamp = 0
  }
  /**
   * Function ran at the start of the gesture.
   * @param event
   */
  start(event: NonNullable<State[Key]>['event']) {
    const state = this.state
    const config = this.config
    if (!state._active) {
      this.reset()
      state._active = true
      state.target = event.target!
      state.currentTarget = event.currentTarget!
      state.initial = state.values
      state.lastOffset = config.from ? call(config.from, state) : state.offset
      state.offset = state.lastOffset
    }
    state.startTime = state.timeStamp = event.timeStamp
  }
  queueKineticsUpdate() {
    const updater = (timeStamp: number) => {
      // Updates previous movement only when the timeStamp is greater as an
      // input event may have preceded this execution
      if (timeStamp > this.state.timeStamp) {
        this.state.previousMovement = this.state.movement
      }
      this.rAF_id = -1
    }
    // Queues for the frame after the next
    if (this.rAF_id === -1) {
      this.rAF_id = requestAnimationFrame(() => {
        this.rAF_id = requestAnimationFrame(updater)
      })
    }
  }
  cancelKineticsUpdate() {
    cancelAnimationFrame(this.rAF_id)
    this.rAF_id = -1
  }
  /**
   * Computes all sorts of state attributes, including kinematics.
   * @param event
   */
  compute(event?: NonNullable<State[Key]>['event']) {
    const { state, config, shared } = this
    state.args = this.args

    let dt = 0

    if (event) {
      // sets the shared state with event properties
      state.event = event
      state.type = event.type
      shared.touches = this.ctrl.pointerIds.size || this.ctrl.touchIds.size
      shared.locked = !!document.pointerLockElement
      Object.assign(shared, getEventDetails(event))
      shared.down = shared.pressed = shared.buttons % 2 === 1 || shared.touches > 0

      // sets time stamps
      dt = event.timeStamp - state.timeStamp
      state.timeStamp = event.timeStamp
      state.elapsedTime = state.timeStamp - state.startTime
    }

    // only compute _distance if the state is active otherwise we might compute it
    // twice when the gesture ends because state._delta wouldn't have changed on
    // the last frame.
    if (state._active) {
      const _absoluteDelta = state._delta.map(Math.abs) as Vector2
      V.addTo(state._distance, _absoluteDelta)
    }

    const [_m0, _m1] = config.transform(state._movement)
    const [_t0, _t1] = state._threshold
    // Step will hold the threshold at which point the gesture was triggered. The
    // threshold is signed depending on which direction triggered it.
    let [_s0, _s1] = state._step

    if (_s0 === false) _s0 = Math.abs(_m0) >= _t0 && Math.sign(_m0) * _t0
    if (_s1 === false) _s1 = Math.abs(_m1) >= _t1 && Math.sign(_m1) * _t1

    state.intentional = _s0 !== false || _s1 !== false

    if (!state.intentional) return

    state._step = [_s0, _s1]

    const movement: Vector2 = [0, 0]

    movement[0] = _s0 !== false ? _m0 - _s0 : 0
    movement[1] = _s1 !== false ? _m1 - _s1 : 0

    // let's run intentionality check.
    if (this.intent) this.intent(movement)

    if ((state._active && !state._blocked) || state.active) {
      state.first = state._active && !state.active
      state.last = !state._active && state.active
      state.active = shared[this.ingKey] = state._active

      if (event) {
        if (state.first) {
          if ('bounds' in config) state._bounds = call(config.bounds, state)
          if (this.setup) this.setup()
        }

        let previousMovement
        if (!state.last) {
          previousMovement = state.previousMovement = state.movement
          state.movement = movement
          this.queueKineticsUpdate()
        } else {
          this.cancelKineticsUpdate()
          previousMovement = state.previousMovement
        }

        state.delta = V.sub(movement, previousMovement)
        const absoluteDelta = state.delta.map(Math.abs) as Vector2

        V.addTo(state.distance, absoluteDelta)
        state.direction = state.delta.map(Math.sign) as Vector2

        if (!state.first && dt > 0) {
          // calculates kinematics unless the gesture starts or time has not passed
          state.velocity = [absoluteDelta[0] / dt, absoluteDelta[1] / dt]
        }

        this.computeOffset()
      }
    }

    // @ts-ignore
    const rubberband: Vector2 = state._active ? config.rubberband || [0, 0] : [0, 0]
    state.offset = computeRubberband(state._bounds, state.offset, rubberband)
    this.computeMovement()
  }
  /**
   * Fires the gesture handler.
   */
  emit() {
    const state = this.state
    const shared = this.shared
    const config = this.config

    if (!state._active) this.clean()

    // we don't trigger the handler if the gesture is blockedor non intentional,
    // unless the `_force` flag was set or the `triggerAllEvents` option was set
    // to true in the config.
    if ((state._blocked || !state.intentional) && !state._force && !config.triggerAllEvents) return

    // @ts-ignore
    const memo = this.handler({ ...shared, ...state, [this.aliasKey]: state.values })

    // Sets memo to the returned value of the handler (unless it's  undefined)
    if (memo !== undefined) state.memo = memo
  }
  /**
   * Cleans the gesture timeouts and event listeners.
   */
  clean() {
    this.eventStore.clean()
    this.timeoutStore.clean()
  }
}
