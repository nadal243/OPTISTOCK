import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'

const TYPES = ['Boutique', 'Pharmacie', 'Alimentation', 'Mini-supermarché', 'Dépôt', 'Magasin', 'Entrepôt']

export default function Modification() {
  const { etablissements, setEtablissements } = useOutletContext()
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(null)

  const select = (etab) => { setSelectedId(etab.id); setForm(etab) }

  const submit = (e) => {
    e.preventDefault()
    setEtablissements((list) => list.map((it) => (it.id === selectedId ? { ...it, ...form } : it)))
    setSelectedId(null)
    setForm(null)
  }

  if (etablissements.length === 0) {
    return (
      <div className="panel">
        <div className="empty-state">
          <div className="empty-icon"><Icon.FileEdit /></div>
          <h3>Aucun établissement à modifier</h3>
          <p>Crée d'abord un établissement depuis l'onglet Création.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-head"><h2>Modifier un établissement</h2></div>
      <table>
        <thead><tr><th>Établissement</th><th>Type</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
        <tbody>
          {etablissements.map((e) => (
            <tr key={e.id}>
              <td className="name-cell">{e.nom}</td>
              <td className="type-cell">{e.type}</td>
              <td>
                <div className="row-actions">
                  <button title="Modifier" onClick={() => select(e)}><Icon.Edit /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {form && (
        <div style={{ marginTop: 22, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14.5, marginBottom: 14 }}>
            Modifier « {form.nom} »
          </h3>
          <form onSubmit={submit} style={{ maxWidth: 420 }}>
            <div className="m-field"><label>Nom</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
            <div className="m-field"><label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div className="m-field"><label>E-mail du gérant</label>
              <input type="email" value={form.emailGerant} onChange={(e) => setForm({ ...form, emailGerant: e.target.value })} /></div>
            <div className="m-field"><label>Téléphone</label>
              <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
            <div className="modal-actions" style={{ marginTop: 4 }}>
              <button type="button" className="btn-ghost" onClick={() => { setSelectedId(null); setForm(null) }}>Annuler</button>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}