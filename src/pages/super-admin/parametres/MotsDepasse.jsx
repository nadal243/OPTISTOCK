import { Icon } from '../../../components/Icons.jsx'

export default function MotsDePasse() {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Réinitialisation des mots de passe</h2>
        <div className="cap-icon"><Icon.Key /></div>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 520 }}>
        Génère un nouveau mot de passe temporaire pour un compte gérant qui a perdu l'accès à son espace.
        Un lien de réinitialisation sera envoyé à l'adresse e-mail enregistrée pour l'établissement concerné.
      </p>
    </div>
  )
}