
import './CloudTransition.css'

type Props = {
  active: boolean
  revealing: boolean
}

export default function CloudTransition({
  active,
  revealing,
}: Props) {
  return (
    <div
      className={[
        'cloud-transition',
        active ? 'active' : '',
        revealing ? 'revealing' : '',
      ].join(' ')}
      aria-hidden="true"
    >
      <div className="cloud-layer cloud-layer-back" />
      <div className="cloud-layer cloud-layer-middle" />
      <div className="cloud-layer cloud-layer-front" />
      <div className="cloud-whiteout" />
    </div>
  )
}
