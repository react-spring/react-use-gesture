import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGesture } from '@use-gesture/react'
import * as THREE from 'three'

import styles from './styles.module.css'

const torusknot = new THREE.TorusKnotBufferGeometry(3, 0.8, 256, 16)
const material = new THREE.MeshStandardMaterial({
  metalness: 1,
  roughness: 0.5,
  color: 'red'
})

const Mesh = () => {
  const ref = useRef()
  const rEuler = useMemo(() => new THREE.Euler(), [])
  const { viewport } = useThree()

  const bind = useGesture(
    {
      onDrag: ({ active, offset: [x, y] }) => {
        rEuler.set(y / viewport.factor, x / viewport.factor, 0)
        ref.current.quaternion.setFromEuler(rEuler)
      }
      // onHover: ({ dragging, hovering }) =>
      //   !dragging && ref.current && (ref.current.style.cursor = hovering ? 'grab' : 'initial'),
    },
    { drag: { r3f: true, preventScroll: true } }
  )

  return <mesh ref={ref} {...bind()} geometry={torusknot} material={material} />
}

export default function App() {
  return (
    <main style={{ maxWidth: 420, margin: '0 auto', background: '#ccc', padding: '100px 0' }}>
      <p style={{ padding: 20, lineHeight: 2 }}>
        <code>touch-action: none</code> is a common css property that you'll set on draggable items so that scroll
        doesn't interfere with the drag behavior on touch devices. However, this generally means that the scroll of the
        page can't be initiated from the draggable element. This is fine if your page isn't meant to be scrolled or if
        your draggable element is relatively small, but in case of large draggable areas this might become a usability
        issue.
      </p>
      <div className={styles.three}>
        <Canvas
          concurrent
          dpr={[1, 2]}
          className={styles.canvas}
          camera={{ position: [0, 0, 16], fov: 50 }}
          // onCreated={({ gl }) => (ref.current = gl.domElement)}
        >
          <directionalLight />
          <Suspense fallback={null}>
            <Mesh />
          </Suspense>
        </Canvas>
      </div>
      <p style={{ padding: 20, lineHeight: 2 }}>
        <code>preventScroll</code> is a convenient way to have both vertical drag and vertical scrolling coexist. Note
        that scroll will always have precedence over drag. To drag vertically the user will have to press the draggable
        area for <code>250ms</code> without moving. After these <code>250ms</code> the element is draggable and scroll
        is prevented. Note that if you drag horizontally the scroll will immediately be prevented without waiting for{' '}
        <code>250ms</code>.
      </p>
    </main>
  )
}
