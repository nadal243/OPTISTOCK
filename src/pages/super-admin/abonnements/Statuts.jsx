import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'

const statutColor = { Actif: '#2FA36B', Suspendu: '#D9A441', Désactivé: '#C24B3F' }

export default function Statuts() {
  const { etablissements, setEtablissements } = useOutletContext()
  const setStatut = (id, statut) => setEtablissements((list) => list.map((it) => (it.id === id ? { ...it, statut } : it)))

  if (etablissements.length === 0) {
    return (
      <div className="panel">
        <div className="empty-state">
          <div className="empty-icon"><Icon.Card /></div>
          <h3>Aucun abonnement à gérer</h3>
          <p>Les abonnements apparaîtront ici dès qu'un établissement sera créé.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-head"><h2>Suspendre ou réactiver un abonnement</h2></div>
      <table>
        <thead><tr><th>Établissement</th><th>Abonnement</th><th>Statut</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
        <tbody>
          {etablissements.map((e) => (
            <tr key={e.id}>
              <td className="name-cell">{e.nom}</td>
              <td>{e.abonnement}</td>
              <td><span className="badge" style={{ color: statutColor[e.statut], background: `${statutColor[e.statut]}1a` }}>{e.statut}</span></td>
              <td>
                <div className="row-actions">
                  {e.statut === 'Suspendu'
                    ? <button title="Réactiver" onClick={() => setStatut(e.id, 'Actif')}><Icon.Power /></button>
                    : <button title="Suspendre" onClick={() => setStatut(e.id, 'Suspendu')}><Icon.Power /></button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}