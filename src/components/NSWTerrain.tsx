
import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BufferAttribute,
  Color,
  DoubleSide,
  Fog,
  PlaneGeometry,
  Vector3,
} from 'three'

function getHeight(x: number, y: number) {
  const hills =
    Math.sin(x * 0.13) * 1.2 +
    Math.cos(y * 0.12) * 1.1

  const ridges =
    Math.sin(x * 0.35 + y * 0.17) * 0.45 +
    Math.cos(y * 0.29 - x * 0.12) * 0.4

  const detail =
    Math.sin(x * 1.3) *
    Math.cos(y * 1.1) *
    0.08

  return hills + ridges + detail
}

function TerrainSurface() {
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(70, 100, 160, 200)
    const position = geo.attributes.position

    const colors: number[] = []

    const low = new Color('#344d3a')
    const mid = new Color('#66734b')
    const high = new Color('#85836a')

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i)
      const y = position.getY(i)

      const height = getHeight(x, y)

      position.setZ(i, height)

      const colour = new Color()

      if (height < 0.4) {
        colour.copy(low).lerp(
          mid,
          Math.max(0, Math.min(1, (height + 2) / 2.4))
        )
      } else {
        colour.copy(mid).lerp(
          high,
          Math.max(0, Math.min(1, (height - 0.4) / 3))
        )
      }

      colors.push(colour.r, colour.g, colour.b)
    }

    geo.setAttribute(
      'color',
      new BufferAttribute(new Float32Array(colors), 3)
    )

    geo.computeVertexNormals()

    return geo
  }, [])

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2, -22]}
      receiveShadow
    >
      <meshStandardMaterial
        vertexColors
        roughness={1}
        metalness={0}
        side={DoubleSide}
      />
    </mesh>
  )
}

export default function NSWTerrain() {
  const { camera, scene } = useThree()

  useEffect(() => {
    scene.background = new Color('#b5bec0')
    scene.fog = new Fog('#b5bec0', 15, 85)

    camera.position.set(0, 11, 18)
    camera.lookAt(0, 0, -20)

    return () => {
      scene.fog = null
      scene.background = new Color('#02030a')
    }
  }, [camera, scene])

  useFrame((_, delta) => {
    camera.position.z -= delta * 2.2

    camera.position.y = Math.max(
      5,
      camera.position.y - delta * 0.25
    )

    camera.lookAt(
      new Vector3(
        0,
        0,
        camera.position.z - 25
      )
    )
  })

  return (
    <>
      <ambientLight intensity={1.1} />

      <directionalLight
        position={[-15, 25, -20]}
        intensity={2.2}
        color="#ffe0ae"
      />

      <hemisphereLight
        args={['#d9e7ee', '#4c5540', 1.4]}
      />

      <TerrainSurface />
    </>
  )
}
