import React, { useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGesture } from '@use-gesture/react'
import * as THREE from 'three'

import styles from './styles.module.css'

const torusknot = new THREE.TorusKnotBufferGeometry(3, 0.8, 256, 16)

const Mesh = () => {
  const rEuler = useMemo(() => new THREE.Euler(), [])
  const { viewport } = useThree()

  const bind = useGesture(
    {
      onDrag: ({ event, offset: [x, y] }) => {
        rEuler.set(y / viewport.factor, x / viewport.factor, 0)
        event.object.quaternion.setFromEuler(rEuler)
      },
      onPinch: ({ event, offset: [s] }) => {
        event.object.scale.set(s, s, s)
      }
    },
    { drag: { r3f: true } }
  )

  return (
    <mesh {...bind()} geometry={torusknot}>
      <meshPhysicalMaterial attach="material" flatShading />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas
      className={styles.canvas}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 16], fov: 50 }}
      style={{ background: 'dimgray', height: '100vh', width: '100vw' }}
    >
      <directionalLight />
      <Mesh />
    </Canvas>
  )
}
