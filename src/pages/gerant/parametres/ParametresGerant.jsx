import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'
import ConfirmPassword from '../../../components/ConfirmPassword.jsx'

const TYPES = ['Boutique', 'Pharmacie', 'Alimentation', 'Mini-supermarché', 'Dépôt', 'Magasin', 'Entrepôt']

export default function ParametresGerant() {
  const { etablissement, gerant } = useOutletContext()
  const [form, setForm] = useState(null)
  const [mdpForm, setMdpForm] = useState({ nouveau: '', confirmer: '' })
  const [loading, setLoading] = useState(false)
  const [mdpLoading, setMdpLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    if (etablissement) {
      setForm({
        nom: etablissement.nom || '',
        type: etablissement.type || 'Boutique',
        telephone: etablissement.telephone || '',
      })
    }
  }, [etablissement])

  const sauvegarder = async () => {
    setConfirm(false)
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('etablissements')
      .update({ nom: form.nom, type: form.type, telephone: form.telephone })
      .eq('id', etablissement.id)

    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess('Paramètres mis à jour.')
    setTimeout(() => setSuccess(''), 3000)
  }

  const changerMotDePasse = async (e) => {
    e.preventDefault()
    if (mdpForm.nouveau !== mdpForm.confirmer) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (mdpForm.nouveau.length < 6) {
      setError('Minimum 6 caractères.')
      return
    }
    setMdpLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password: mdpForm.nouveau })
    setMdpLoading(false)
    if (err) { setError(err.message); return }
    setSuccess('Mot de passe modifié.')
    setMdpForm({ nouveau: '', confirmer: '' })
    setTimeout(() => setSuccess(''), 3000)
  }

  if (!form) return null

  return (
    <>
      {success && <div className="alert-success">✓ {success}</div>}
      {error && <div className="alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Infos établissement */}
        <div className="panel">
          <div className="panel-head"><h2>Informations de l'établissement</h2></div>
          <form onSubmit={(e) => { e.preventDefault(); setConfirm(true) }}>
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
              <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+221 77 000 00 00" />
            </div>

            <div style={{ background: 'var(--accent-pale)', border: '1px solid rgba(26,122,80,.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 6, fontWeight: 600 }}>ABONNEMENT ACTUEL</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{etablissement?.plan}</div>
              {etablissement?.date_fin_abonnement && (
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>
                  Expire le : {new Date(etablissement.date_fin_abonnement).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              <Icon.Settings />Enregistrer
            </button>
          </form>
        </div>

        {/* Sécurité */}
        <div className="panel">
          <div className="panel-head"><h2>Sécurité — Changer le mot de passe</h2></div>

          <div style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>COMPTE GÉRANT</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{gerant?.nom_complet}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{gerant?.telephone}</div>
          </div>

          <form onSubmit={changerMotDePasse}>
            <div className="m-field">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                value={mdpForm.nouveau}
                onChange={(e) => setMdpForm({ ...mdpForm, nouveau: e.target.value })}
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />
            </div>
            <div className="m-field">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={mdpForm.confirmer}
                onChange={(e) => setMdpForm({ ...mdpForm, confirmer: e.target.value })}
                placeholder="Répétez le mot de passe"
                required
              />
            </div>
            {mdpForm.nouveau && mdpForm.confirmer && mdpForm.nouveau !== mdpForm.confirmer && (
              <div style={{ fontSize: 11.5, color: '#DC2626', marginBottom: 10 }}>⚠️ Les mots de passe ne correspondent pas.</div>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={mdpLoading}>
              <Icon.Key />
              {mdpLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>

      {confirm && (
        <ConfirmPassword
          gerant={gerant}
          titre="Modifier les paramètres"
          description="Confirmez votre identité pour sauvegarder les modifications de l'établissement."
          onConfirm={sauvegarder}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  )
}