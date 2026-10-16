
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  CanvasTexture,
  Group,
  MeshBasicMaterial,
  SRGBColorSpace,
} from 'three'

type Props = {
  active: boolean
  exiting: boolean
}

function createCloudTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const ctx = canvas.getContext('2d')!

  // Soft overlapping cloud puffs
  for (let i = 0; i < 90; i++) {
    const angle = i * 2.39996
    const radius = Math.sqrt((i + 0.5) / 90) * 175

    const x = 256 + Math.cos(angle) * radius
    const y = 256 + Math.sin(angle) * radius

    const size = 65 + (i % 7) * 12

    const gradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    )

    gradient.addColorStop(0, 'rgba(255,255,255,0.22)')
    gradient.addColorStop(0.45, 'rgba(245,249,255,0.13)')
    gradient.addColorStop(1, 'rgba(230,240,250,0)')

    ctx.fillStyle = gradient
    ctx.fillRect(
      x - size,
      y - size,
      size * 2,
      size * 2
    )
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}

function CloudField({ exiting }: { exiting: boolean }) {
  const group = useRef<Group>(null)
  const progress = useRef(0)
  const opacity = useRef(1)

  const texture = useMemo(() => createCloudTexture(), [])

  const clouds = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const angle = i * 2.39996
      const spread = 1.5 + (i % 8) * 0.6

      return {
        x: Math.cos(angle) * spread,
        y: Math.sin(angle) * spread * 0.65,
        z: -4 - i * 1.15,
        size: 3.5 + (i % 5) * 0.8,
        rotation: (i * 0.71) % Math.PI,
      }
    })
  }, [])

  const materials = useMemo(
    () =>
      clouds.map(
        () =>
          new MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            opacity: 0.72,
            toneMapped: false,
          })
      ),
    [clouds, texture]
  )

  useEffect(() => {
    return () => {
      materials.forEach(material => material.dispose())
      texture.dispose()
    }
  }, [materials, texture])

  useFrame((_, delta) => {
    if (!group.current) return

    const dt = Math.min(delta, 0.05)

    // Accelerate into the cloud field.
    progress.current += dt

    const speed = Math.min(
      24,
      4 + progress.current * 4
    )

    // Move cloud field toward camera.
    group.current.position.z += speed * dt

    // Slight sideways motion creates a falling sensation.
    group.current.position.x =
      Math.sin(progress.current * 0.9) * 0.15

    group.current.rotation.z =
      Math.sin(progress.current * 0.45) * 0.015

    if (exiting) {
      opacity.current = Math.max(
        0,
        opacity.current - dt * 0.65
      )
    }

    materials.forEach(material => {
      material.opacity = 0.72 * opacity.current
    })
  })

  return (
    <group ref={group}>
      {clouds.map((cloud, index) => (
        <mesh
          key={index}
          position={[cloud.x, cloud.y, cloud.z]}
          rotation={[0, 0, cloud.rotation]}
          material={materials[index]}
        >
          <planeGeometry
            args={[cloud.size, cloud.size]}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function CloudDive({
  active,
  exiting,
}: Props) {
  if (!active) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
        }}
        camera={{
          position: [0, 0, 0],
          fov: 75,
          near: 0.1,
          far: 150,
        }}
        style={{
          background: 'transparent',
        }}
      >
        <CloudField exiting={exiting} />
      </Canvas>
    </div>
  )
}
