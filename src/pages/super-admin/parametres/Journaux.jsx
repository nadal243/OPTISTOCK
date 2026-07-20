import { Icon } from '../../../components/Icons.jsx'

export default function Journaux() {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Consultation des journaux système</h2>
        <div className="cap-icon"><Icon.Terminal /></div>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 520 }}>
        Historique complet des actions effectuées sur la plateforme : connexions, modifications,
        suppressions, erreurs système et tentatives de connexion suspectes.
      </p>
    </div>
  )
}