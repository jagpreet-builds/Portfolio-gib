
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  ShaderMaterial,
} from 'three'
import type { Mesh } from 'three'

export default function Atmosphere() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    // Rotate the atmosphere slowly around Earth.
    mesh.rotation.y += delta * 0.012

    const material = mesh.material

    if (material instanceof ShaderMaterial) {
      material.uniforms.uTime.value += delta
    }
  })

  return (
    <mesh ref={meshRef}>
      {/* Earth radius = 2, atmosphere radius = 2.08 */}
      <sphereGeometry args={[2.045, 128, 128]} />

      <shaderMaterial
        transparent
        depthWrite={false}
        depthTest
        side={DoubleSide}
        blending={AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new Color('#67b5ff') },
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          varying vec3 vWorldNormal;

          void main() {
            vec4 worldPosition =
              modelMatrix * vec4(position, 1.0);

            vWorldPosition = worldPosition.xyz;
            vWorldNormal = normalize(
              mat3(modelMatrix) * normal
            );

            gl_Position =
              projectionMatrix *
              viewMatrix *
              worldPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;

          varying vec3 vWorldPosition;
          varying vec3 vWorldNormal;

          float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(
              p.x * p.y * p.z *
              (p.x + p.y + p.z)
            );
          }

          float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);

            f = f * f * (3.0 - 2.0 * f);

            return mix(
              mix(
                mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)),
                    hash(i + vec3(1,1,0)), f.x),
                f.y
              ),
              mix(
                mix(hash(i + vec3(0,0,1)),
                    hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)),
                    hash(i + vec3(1,1,1)), f.x),
                f.y
              ),
              f.z
            );
          }

          void main() {
            vec3 normal = normalize(vWorldNormal);
            vec3 viewDirection =
              normalize(cameraPosition - vWorldPosition);

            float facing =
              abs(dot(normal, viewDirection));

            // Atmosphere strongest near the horizon.
            float rim = pow(1.0 - facing, 1.5);

            // Moving, cloud-like gas density.
            vec3 p = vWorldPosition * 7.0;

            float n1 = noise(
              p + vec3(0.0, uTime * 0.018, 0.0)
            );

            float n2 = noise(
              p * 2.0 -
              vec3(uTime * 0.012, 0.0, 0.0)
            );

            float gas = mix(n1, n2, 0.35);

            float density =
              smoothstep(0.25, 0.8, gas);

            float wisps = smoothstep(0.30, 0.78, gas);

            float alpha =
              rim * (0.015 + wisps * 0.13);

            gl_FragColor =
              vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  )
}
