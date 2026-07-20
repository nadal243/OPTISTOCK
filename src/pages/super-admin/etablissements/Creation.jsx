import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import {
  supabase,
  telephoneVersEmail,
  genererNumeroGerant,
  genererMotDePasse,
} from '../../../lib/supabaseClient.js'

const emptyForm = { prefixeGerant: '', nomEtablissement: '', type: 'Boutique', nomGerant: '', dateFin: '' }
const TYPES = ['Boutique', 'Pharmacie', 'Alimentation', 'Mini-supermarché', 'Dépôt', 'Magasin', 'Entrepôt']

export default function Creation() {
  const { setEtablissements } = useOutletContext()
  const [form, setForm] = useState(emptyForm)
  const [resultat, setResultat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const copier = (texte, label) => {
    navigator.clipboard.writeText(texte)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (form.prefixeGerant.length !== 3) {
      setError("Saisis exactement 3 chiffres pour le préfixe du gérant.")
      return
    }
    setError('')
    setLoading(true)

    // 1. Générer le numéro et mot de passe du gérant
    const numeroGerant = genererNumeroGerant(form.prefixeGerant)
    const motDePasse = genererMotDePasse()
    const emailGerant = telephoneVersEmail(numeroGerant)

    // 2. Créer le compte Auth Supabase pour le gérant
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: emailGerant,
      password: motDePasse,
      email_confirm: true,
    })

    if (authError) {
      setError(`Erreur création du compte : ${authError.message}`)
      setLoading(false)
      return
    }

    const gerantId = authData.user.id

    // 3. Créer le profil gérant dans la table profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: gerantId,
      role: 'gerant',
      nom_complet: form.nomGerant,
      telephone: numeroGerant,
    })

    if (profileError) {
      setError(`Erreur création du profil : ${profileError.message}`)
      setLoading(false)
      return
    }

    // 4. Calculer la date de fin (30 jours si non spécifiée)
    const dateFinDefaut = new Date()
    dateFinDefaut.setDate(dateFinDefaut.getDate() + 30)
    const dateFin = form.dateFin || dateFinDefaut.toISOString().slice(0, 10)

    // 5. Créer l'établissement dans Supabase
    const { data: etab, error: etabError } = await supabase
      .from('etablissements')
      .insert({
        nom: form.nomEtablissement,
        type: form.type,
        gerant_id: gerantId,
        email_gerant: emailGerant,
        statut: 'Actif',
        plan: 'Essai gratuit',
        date_fin_abonnement: dateFin,
      })
      .select()
      .single()

    if (etabError) {
      setError(`Erreur création de l'établissement : ${etabError.message}`)
      setLoading(false)
      return
    }

    // 6. Lier le gérant à son établissement
    await supabase.from('profiles').update({
      etablissement_id: etab.id,
    }).eq('id', gerantId)

    // 7. Mettre à jour le state local
    setEtablissements((list) => [...list, { ...etab, statut: 'Actif' }])

    setResultat({
      nomEtablissement: form.nomEtablissement,
      nomGerant: form.nomGerant,
      numeroGerant,
      motDePasse,
    })

    setForm(emptyForm)
    setLoading(false)
  }

  return (
    <div className="panel" style={{ maxWidth: 520 }}>
      <div className="panel-head">
        <h2>Créer un établissement</h2>
        <div className="cap-icon"><Icon.FilePlus /></div>
      </div>

      {/* Résultat après création */}
      {resultat && (
        <div style={{
          background: 'var(--accent-pale)', border: '1px solid rgba(20,108,67,.2)',
          borderRadius: 12, padding: 18, marginBottom: 22,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon.Key style={{ width: 16, height: 16, color: 'var(--accent)' }} />
            <strong style={{ fontSize: 13.5, color: 'var(--text)' }}>
              Compte créé — « {resultat.nomEtablissement} »
            </strong>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
            Transmets ces identifiants au gérant <b>{resultat.nomGerant}</b>. Il pourra se connecter dès maintenant avec son numéro et ce mot de passe.
          </p>

          {/* Numéro gérant */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 9.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.06em', marginBottom: 3 }}>NUMÉRO (IDENTIFIANT)</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{resultat.numeroGerant}</div>
            </div>
            <button className="btn-ghost" style={{ flex: 'none', padding: '6px 12px', fontSize: 11.5 }} onClick={() => copier(resultat.numeroGerant, 'num')}>
              {copied === 'num' ? '✓ Copié' : 'Copier'}
            </button>
          </div>

          {/* Mot de passe */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px' }}>
            <div>
              <div style={{ fontSize: 9.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.06em', marginBottom: 3 }}>MOT DE PASSE</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{resultat.motDePasse}</div>
            </div>
            <button className="btn-ghost" style={{ flex: 'none', padding: '6px 12px', fontSize: 11.5 }} onClick={() => copier(resultat.motDePasse, 'mdp')}>
              {copied === 'mdp' ? '✓ Copié' : 'Copier'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(194,75,63,.08)', color: 'var(--danger)', fontSize: 12.5, padding: '10px 13px', borderRadius: 9, marginBottom: 16, border: '1px solid rgba(194,75,63,.2)' }}>
          {error}
        </div>
      )}

      <form onSubmit={submit}>
        {/* Préfixe gérant */}
        <div className="m-field">
          <label>Préfixe du numéro gérant (3 chiffres)</label>
          <input
            type="text"
            maxLength={3}
            value={form.prefixeGerant}
            onChange={(e) => setForm({ ...form, prefixeGerant: e.target.value.replace(/\D/g, '') })}
            placeholder="Ex : 077"
            required
          />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
            Le système complètera les 7 chiffres restants automatiquement.
          </div>
        </div>

        <div className="m-field">
          <label>Nom du gérant</label>
          <input
            value={form.nomGerant}
            onChange={(e) => setForm({ ...form, nomGerant: e.target.value })}
            placeholder="Ex : Moussa Diallo"
            required
          />
        </div>

        <div className="m-field">
          <label>Nom de l'établissement</label>
          <input
            value={form.nomEtablissement}
            onChange={(e) => setForm({ ...form, nomEtablissement: e.target.value })}
            placeholder="Ex : Pharmacie Al Amane"
            required
          />
        </div>

        <div className="m-field">
          <label>Type d'établissement</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="m-field">
          <label>Date de fin d'abonnement</label>
          <input
            type="date"
            value={form.dateFin}
            onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
          />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
            Si vide, essai gratuit de 30 jours appliqué automatiquement.
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={loading}
        >
          <Icon.Plus />
          {loading ? 'Création en cours...' : "Créer l'établissement"}
        </button>
      </form>
    </div>
  )
}