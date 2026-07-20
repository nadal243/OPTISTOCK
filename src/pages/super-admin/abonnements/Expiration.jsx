import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'

function joursRestants(dateFin) {
  if (!dateFin) return null
  return Math.ceil((new Date(dateFin) - new Date()) / (1000 * 60 * 60 * 24))
}
function expirationBadge(dateFin) {
  const jours = joursRestants(dateFin)
  if (jours === null) return { label: 'Non définie', color: '#75897F' }
  if (jours < 0) return { label: 'Expiré', color: '#C24B3F' }
  if (jours <= 7) return { label: `Expire dans ${jours} j`, color: '#D9A441' }
  return { label: `Expire le ${new Date(dateFin).toLocaleDateString('fr-FR')}`, color: '#2FA36B' }
}

export default function Expiration() {
  const { etablissements } = useOutletContext()

  if (etablissements.length === 0) {
    return (
      <div className="panel">
        <div className="empty-state">
          <div className="empty-icon"><Icon.Clock /></div>
          <h3>Aucune échéance à afficher</h3>
          <p>Les dates d'expiration apparaîtront ici dès qu'un établissement sera créé.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-head"><h2>Suivi des expirations</h2></div>
      <table>
        <thead><tr><th>Établissement</th><th>Échéance</th></tr></thead>
        <tbody>
          {etablissements.map((e) => {
            const exp = expirationBadge(e.dateFin)
            return (
              <tr key={e.id}>
                <td className="name-cell">{e.nom}</td>
                <td><span className="badge" style={{ color: exp.color, background: `${exp.color}1a` }}>{exp.label}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}