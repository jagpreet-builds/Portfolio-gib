
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Mesh } from 'three'
import gsap from 'gsap'

type SceneStage = 'earth' | 'terrain'

type Props = {
  sceneStage: SceneStage
  onCloudTransition: () => void
  onShowTerrain: () => void
  onRevealTerrain: () => void
  onReset: () => void
}

export default function CameraJourney({
  sceneStage,
  onCloudTransition,
  onShowTerrain,
  onRevealTerrain,
  onReset,
}: Props) {
  const { camera, scene } = useThree()

  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const callbacksRef = useRef({
    onCloudTransition,
    onShowTerrain,
    onRevealTerrain,
    onReset,
  })

  useEffect(() => {
    callbacksRef.current = {
      onCloudTransition,
      onShowTerrain,
      onRevealTerrain,
      onReset,
    }
  }, [
    onCloudTransition,
    onShowTerrain,
    onRevealTerrain,
    onReset,
  ])

  useEffect(() => {
    function resetCamera() {
      camera.position.set(0, 0, 7)
      camera.lookAt(0, 0, 0)
    }

    function startJourney() {
      timelineRef.current?.kill()
      timelineRef.current = null

      callbacksRef.current.onReset()
      resetCamera()

      // Wait for React to mount Earth after reset.
      // GSAP checks until the mesh is available.
      const findEarth = gsap.delayedCall(0.05, function check() {
        const earth = scene.getObjectByName('earth') as
          | Mesh
          | undefined

        if (!earth) {
          findEarth.restart(true)
          return
        }

        earth.rotation.set(-0.5, 1.5, 0)

        const timeline = gsap.timeline({
          paused: true,
        })

        timeline.to(
          earth.rotation,
          {
            y: 2.3,
            duration: 4.5,
            ease: 'power2.inOut',
          },
          0
        )

        timeline.to(
          camera.position,
          {
            x: 0.45,
            y: -0.25,
            z: 2.8,
            duration: 5,
            ease: 'power2.inOut',
          },
          2
        )

        // Clouds begin after Earth zoom.
        timeline.call(
          () => callbacksRef.current.onCloudTransition(),
          [],
          7
        )

        // Switch scenes while clouds cover the view.
        timeline.call(
          () => callbacksRef.current.onShowTerrain(),
          [],
          10.2
        )

        // Reveal the terrain.
        timeline.call(
          () => callbacksRef.current.onRevealTerrain(),
          [],
          10.5
        )

        timelineRef.current = timeline
        timeline.play()

        console.log('Earth journey started')
      })
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) return

      if (event.code === 'Space') {
        event.preventDefault()
        startJourney()
      }

      if (event.code === 'KeyR') {
        timelineRef.current?.kill()
        timelineRef.current = null

        callbacksRef.current.onReset()
        resetCamera()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    console.log('CameraJourney ready — press Space')

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      timelineRef.current?.kill()
    }
  }, [camera, scene])

  // The scene stage is handled by App.
  void sceneStage

  return null
}
