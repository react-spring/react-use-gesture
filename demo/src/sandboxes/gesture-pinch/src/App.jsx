import React from 'react'
import { usePinch } from '@use-gesture/react'
import { a, useSpring } from '@react-spring/web'
import { useControls } from 'leva'

import styles from './styles.module.css'

export default function App() {
  const target = React.useRef()
  const [style, api] = useSpring(() => ({ scale: 1, rotate: 0 }))
  const { gesture, touch } = useControls({
    gesture: { options: ['offset', 'movement'] },
    touch: false
  })

  usePinch(
    ({ active, ...state }) => {
      let [scale, angle] = state[gesture]

      api.start({
        rotate: active || gesture === 'offset' ? angle : 0,
        scale: active || gesture === 'offset' ? scale : 1
      })
    },
    { target, eventOptions: { passive: false }, pointer: { touch } }
  )

  return (
    <div className="flex fill center">
      <a.div ref={target} className={styles.drag} style={style}>
        <div>child</div>
      </a.div>
    </div>
  )
}
