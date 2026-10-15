import { Vector3 } from 'three'

export function latLonToVector3(
  latitude: number,
  longitude: number,
  radius: number
): Vector3 {
  const phi = ((90 - latitude) * Math.PI) / 180
  const theta = (longitude * Math.PI) / 180

  return new Vector3(
    -radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi)
  )
}