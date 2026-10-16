
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
  const pendingStartRef = useRef<gsap.core.Tween | null>(null)

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

    function cancelJourney() {
      timelineRef.current?.kill()
      timelineRef.current = null

      pendingStartRef.current?.kill()
      pendingStartRef.current = null
    }

    function startJourney() {
      cancelJourney()

      callbacksRef.current.onReset()
      resetCamera()

      // Wait until Earth is mounted and ready.
      function waitForEarth() {
        const earth = scene.getObjectByName('earth') as
          | Mesh
          | undefined

        if (!earth) {
          pendingStartRef.current = gsap.delayedCall(
            0.05,
            waitForEarth
          )
          return
        }

        earth.rotation.set(-0.5, 1.5, 0)

        const timeline = gsap.timeline({
          paused: true,
        })

        // Stage 1: Rotate Earth toward Australia.
        // 0–4.5 seconds
        timeline.to(
          earth.rotation,
          {
            y: 2.3,
            duration: 4.5,
            ease: 'power2.inOut',
          },
          0
        )

        // Stage 2: Initial approach.
        // 2–7 seconds
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

        // Stage 3: Continue falling toward Earth.
        // 7–9.8 seconds
        timeline.to(
          camera.position,
          {
            x: 0.55,
            y: -0.3,
            z: 2.15,
            duration: 2.8,
            ease: 'power2.in',
          },
          7
        )

        // Begin cloud fly-through at 7 seconds.
        timeline.call(
          () =>
            callbacksRef.current.onCloudTransition(),
          [],
          7
        )

        // Switch to NSW terrain while clouds pass.
        timeline.call(
          () =>
            callbacksRef.current.onShowTerrain(),
          [],
          9.8
        )

        // Thin the clouds to reveal the landscape.
        timeline.call(
          () =>
            callbacksRef.current.onRevealTerrain(),
          [],
          10.1
        )

        timelineRef.current = timeline
        timeline.play()

        console.log('Earth journey started')
      }

      waitForEarth()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) return

      if (event.code === 'Space') {
        event.preventDefault()
        startJourney()
      }

      if (event.code === 'KeyR') {
        cancelJourney()
        callbacksRef.current.onReset()
        resetCamera()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    console.log('CameraJourney ready — press Space')

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      cancelJourney()
    }
  }, [camera, scene])

  void sceneStage

  return null
}
