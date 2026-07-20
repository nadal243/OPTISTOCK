import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'

const statutColor = { Actif: '#2FA36B', Suspendu: '#D9A441', Désactivé: '#C24B3F' }

export default function Activation() {
  const { etablissements, setEtablissements } = useOutletContext()

  const toggle = (id) => {
    setEtablissements((list) => list.map((it) => (it.id === id ? { ...it, statut: it.statut === 'Actif' ? 'Désactivé' : 'Actif' } : it)))
  }

  if (etablissements.length === 0) {
    return (
      <div className="panel">
        <div className="empty-state">
          <div className="empty-icon"><Icon.ToggleLeft /></div>
          <h3>Aucun compte à activer</h3>
          <p>La liste est vide pour le moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-head"><h2>Activer / désactiver un compte</h2></div>
      <table>
        <thead><tr><th>Établissement</th><th>Statut</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
        <tbody>
          {etablissements.map((e) => (
            <tr key={e.id}>
              <td className="name-cell">{e.nom}</td>
              <td><span className="badge" style={{ color: statutColor[e.statut], background: `${statutColor[e.statut]}1a` }}>{e.statut}</span></td>
              <td>
                <div className="row-actions">
                  <button title={e.statut === 'Actif' ? 'Désactiver' : 'Activer'} onClick={() => toggle(e.id)}><Icon.Power /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}