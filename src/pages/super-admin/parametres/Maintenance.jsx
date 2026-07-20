import { Icon } from '../../../components/Icons.jsx'

export default function Maintenance() {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Maintenance de la plateforme</h2>
        <div className="cap-icon"><Icon.Wrench /></div>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 520 }}>
        Active le mode maintenance pour bloquer temporairement l'accès aux établissements pendant une
        mise à jour, et planifie les prochaines interventions techniques.
      </p>
    </div>
  )
}