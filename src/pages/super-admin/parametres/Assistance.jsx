import { Icon } from '../../../components/Icons.jsx'

export default function Assistance() {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Assistance technique</h2>
        <div className="cap-icon"><Icon.Headset /></div>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 520 }}>
        Retrouve ici les demandes de support envoyées par les établissements : problèmes de connexion,
        anomalies de stock, questions sur l'abonnement, etc.
      </p>
    </div>
  )
}