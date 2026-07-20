import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

const TYPES = ['Boutique', 'Pharmacie', 'Alimentation', 'Mini-supermarché', 'Dépôt', 'Magasin', 'Entrepôt']
const PLANS = ['Essai gratuit', 'Essentiel', 'Pro', 'Entreprise']
const statutColor = { Actif: '#16A34A', Suspendu: '#D97706', Désactivé: '#DC2626' }

export default function Modification() {
  const { etablissements, setEtablissements } = useOutletContext()
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(null)
  const [gerantInfo, setGerantInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const select = async (etab) => {
    setSelectedId(etab.id)
    setForm(etab)
    setSuccess('')
    setError('')
    setGerantInfo(null)

    if (etab.gerant_id) {
      const { data } = await supabase
        .from('profiles')
        .select('nom_complet, telephone, actif')
        .eq('id', etab.gerant_id)
        .single()
      setGerantInfo(data)
    }
  }

  const fermer = () => {
    setSelectedId(null)
    setForm(null)
    setGerantInfo(null)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('etablissements')
      .update({
        nom: form.nom,
        type: form.type,
        telephone: form.telephone,
        statut: form.statut,
        plan: form.plan,
        date_fin_abonnement: form.date_fin_abonnement,
      })
      .eq('id', selectedId)

    setLoading(false)

    if (err) {
      setError("Erreur lors de la modification.")
      return
    }

    setEtablissements((list) => list.map((it) => (it.id === selectedId ? { ...it, ...form } : it)))
    setSuccess("Établissement mis à jour avec succès.")
    fermer()
  }

  const accederCompteGerant = async (etab) => {
    if (!etab.gerant_id) return
    const { data } = await supabase
      .from('profiles')
      .select('telephone, nom_complet')
      .eq('id', etab.gerant_id)
      .single()

    if (data) {
      alert(
        `Accès au compte gérant\n\nNom : ${data.nom_complet}\nTéléphone : ${data.telephone}\n\nEn production, cette action vous connecte à l'espace gérant avec ses droits complets.`
      )
    }
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
    <>
      {success && <div className="alert-success">✓ {success}</div>}

      <div className="panel">
        <div className="panel-head"><h2>Sélectionner un établissement</h2></div>
        <table>
          <thead>
            <tr>
              <th>Établissement</th>
              <th>Statut</th>
              <th>Plan</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {etablissements.map((e) => (
              <tr key={e.id} style={{ background: selectedId === e.id ? 'var(--accent-pale)' : '' }}>
                <td>
                  <div className="name-cell">{e.nom}</div>
                  <div className="type-cell">{e.type}</div>
                </td>
                <td>
                  <span className="badge" style={{ color: statutColor[e.statut], background: `${statutColor[e.statut]}1a` }}>
                    {e.statut}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: 'var(--muted)' }}>{e.plan}</td>
                <td>
                  <div className="row-actions">
                    <button title="Modifier" onClick={() => select(e)}><Icon.Edit /></button>
                    <button
                      title="Accéder au compte gérant"
                      onClick={() => accederCompteGerant(e)}
                      style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                    >
                      <Icon.Users />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="panel">
          <div className="panel-head">
            <h2>Modifier « {form.nom} »</h2>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={fermer}>
              Fermer
            </button>
          </div>

          {gerantInfo && (
            <div style={{ background: 'var(--accent-pale)', border: '1px solid rgba(26,122,80,.2)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.06em', marginBottom: 10, fontWeight: 600 }}>
                COMPTE GÉRANT
              </div>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Nom</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{gerantInfo.nom_complet}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Téléphone</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{gerantInfo.telephone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Statut</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: gerantInfo.actif ? '#16A34A' : '#DC2626' }}>
                    {gerantInfo.actif ? 'Actif' : 'Désactivé'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={submit} style={{ maxWidth: 460 }}>
            <div className="m-field">
              <label>Nom de l'établissement</label>
              <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            <div className="m-field">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="m-field">
              <label>Téléphone</label>
              <input
                value={form.telephone || ''}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="+221 77 000 00 00"
              />
            </div>
            <div className="m-field">
              <label>Statut</label>
              <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Désactivé">Désactivé</option>
              </select>
            </div>
            <div className="m-field">
              <label>Plan d'abonnement</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="m-field">
              <label>Date de fin d'abonnement</label>
              <input
                type="date"
                value={form.date_fin_abonnement || ''}
                onChange={(e) => setForm({ ...form, date_fin_abonnement: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={fermer}>Annuler</button>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}