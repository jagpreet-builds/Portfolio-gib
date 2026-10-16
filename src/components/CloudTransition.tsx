
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
      <div className="cloud-haze" />

      <div className="cloud-sheet cloud-sheet-one" />
      <div className="cloud-sheet cloud-sheet-two" />
      <div className="cloud-sheet cloud-sheet-three" />

      <div className="cloud-mist" />
    </div>
  )
}
