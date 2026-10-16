
import {
  Suspense,
  useCallback,
  useState,
} from 'react'

import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

import Earth from './components/Earth'
import Atmosphere from './components/Atmosphere'
import CameraJourney from './components/CameraJourney'
import CloudDive from './components/CloudDive'
import NSWTerrain from './components/NSWTerrain'

type SceneStage = 'earth' | 'terrain'

export default function App() {
  const [sceneStage, setSceneStage] =
    useState<SceneStage>('earth')

  const [cloudActive, setCloudActive] =
    useState(false)

  const [cloudExiting, setCloudExiting] =
    useState(false)

  const startClouds = useCallback(() => {
    setCloudActive(true)
    setCloudExiting(false)
  }, [])

  const showTerrain = useCallback(() => {
    setSceneStage('terrain')
  }, [])

  const revealTerrain = useCallback(() => {
    setCloudExiting(true)
  }, [])

  const resetJourney = useCallback(() => {
    setSceneStage('earth')
    setCloudActive(false)
    setCloudExiting(false)
  }, [])

  return (
    <>
      <Canvas
        camera={{
          position: [0, 0, 7],
          fov: 45,
          near: 0.01,
          far: 1000,
        }}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          background: '#02030a',
        }}
      >
        {sceneStage === 'earth' && (
          <>
            <ambientLight intensity={0.6} />

            <directionalLight
              position={[5, 3, 5]}
              intensity={2}
            />

            <Stars
              radius={100}
              depth={50}
              count={1800}
              factor={3}
              saturation={0}
              fade
              speed={0.3}
            />

            <Suspense fallback={null}>
              <Earth />
              <Atmosphere />
            </Suspense>
          </>
        )}

        {sceneStage === 'terrain' && (
          <NSWTerrain />
        )}

        <CameraJourney
          sceneStage={sceneStage}
          onCloudTransition={startClouds}
          onShowTerrain={showTerrain}
          onRevealTerrain={revealTerrain}
          onReset={resetJourney}
        />
      </Canvas>

      <CloudDive
        active={cloudActive}
        exiting={cloudExiting}
      />

      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontSize: 12,
          letterSpacing: '0.08em',
          opacity: 0.65,
          pointerEvents: 'none',
          zIndex: 150,
        }}
      >
        SPACE — START / REPLAY
        <span style={{ margin: '0 12px' }}>·</span>
        R — RESET
      </div>
    </>
  )
}
