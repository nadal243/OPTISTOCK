import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'

export default function Suppression() {
  const { etablissements, setEtablissements } = useOutletContext()
  const [confirmId, setConfirmId] = useState(null)

  const remove = (id) => {
    setEtablissements((list) => list.filter((it) => it.id !== id))
    setConfirmId(null)
  }

  if (etablissements.length === 0) {
    return (
      <div className="panel">
        <div className="empty-state">
          <div className="empty-icon"><Icon.FileMinus /></div>
          <h3>Aucun établissement à supprimer</h3>
          <p>La liste est vide pour le moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-head"><h2>Supprimer un établissement</h2></div>
      <table>
        <thead><tr><th>Établissement</th><th>Type</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
        <tbody>
          {etablissements.map((e) => (
            <tr key={e.id}>
              <td className="name-cell">{e.nom}</td>
              <td className="type-cell">{e.type}</td>
              <td>
                <div className="row-actions">
                  <button className="danger" title="Supprimer" onClick={() => setConfirmId(e.id)}><Icon.Trash /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmId && (
        <div className="overlay" onClick={() => setConfirmId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Confirmer la suppression</h3>
              <button className="modal-close" onClick={() => setConfirmId(null)}><Icon.X /></button>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>
              Cette action est irréversible. L'établissement et ses données seront supprimés définitivement.
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmId(null)}>Annuler</button>
              <button className="btn-danger" onClick={() => remove(confirmId)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}