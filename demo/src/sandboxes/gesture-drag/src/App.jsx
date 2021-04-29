import React from 'react'
import { useDrag } from '@use-gesture/react'
import { a, useSpring } from '@react-spring/web'
import { useControls } from 'leva'

import styles from './styles.module.css'

function Draggable() {
  const ref = React.useRef()

  const [color, setColor] = React.useState('black')
  const toggleColor = () => setColor((c) => (c === 'black' ? '#ec625c' : 'black'))

  const [style, api] = useSpring(() => ({ scale: 1, x: 0, y: 0 }))
  const [coords, set] = React.useState({ x: 0, y: 0 })

  const { boundToParent, gesture, ...options } = useControls({
    enabled: true,
    gesture: { options: ['offset', 'movement'] },
    axis: { options: [undefined, 'x', 'y', 'lock'] },
    filterTaps: false,
    boundToParent: false,
    rubberband: false,
    delay: { value: 1000, step: 100, min: 0, max: 3000, optional: true, disabled: true }
  })

  const pointerOptions = useControls('pointer', { touch: false, capture: true, lock: false })

  const bind = useDrag(
    ({ active, tap, canceled, ...state }) => {
      let [x, y] = state[gesture]
      set({ x, y })

      if (pointerOptions.lock) {
        const dx = window.innerWidth / 2 - 40
        const dy = window.innerHeight / 2 - 40
        x = ((x + Math.sign(x) * dx) % window.innerWidth) - Math.sign(x) * dx
        y = ((y + Math.sign(y) * dy) % window.innerHeight) - Math.sign(y) * dy
      }
      api.start({
        scale: active ? 1.2 : 1,
        x: active || gesture === 'offset' ? x : 0,
        y: active || gesture === 'offset' ? y : 0,
        immediate: pointerOptions.lock
      })
    },
    {
      ...options,
      pointer: pointerOptions,
      // bounds: { top: -40, bottom: 40, left: -40, right: 40 }
      ...(boundToParent && { bounds: ref })
    }
  )

  return (
    <>
      <a.div tabIndex="-1" {...bind()} className={styles.drag} style={style}>
        <div onClick={toggleColor} style={{ backgroundColor: color }}>
          <span>bind</span>
          <span>
            x:{Math.round(coords.x)}, y:{Math.round(coords.y)}
          </span>
        </div>
      </a.div>
      <div ref={ref} className={styles.hover} />
    </>
  )
}

export default function App() {
  const { shown } = useControls({ shown: true })
  return <div className="flex fill center">{shown && <Draggable />}</div>
}
