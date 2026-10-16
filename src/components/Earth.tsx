
import { useLoader } from '@react-three/fiber'
import { TextureLoader, SRGBColorSpace } from 'three'

export default function Earth() {
  const earthTexture = useLoader(
    TextureLoader,
    '/textures/earth-golden-I1.jpg'
  )

  earthTexture.colorSpace = SRGBColorSpace

  return (
    <mesh
      name="earth"
      rotation={[-0.5, 1.5, 0]}
    >
      <sphereGeometry args={[2, 96, 96]} />

      <meshStandardMaterial
        map={earthTexture}
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}
