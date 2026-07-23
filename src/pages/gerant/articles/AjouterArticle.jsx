import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'
import EmplacementField from './EmplacementField.jsx'

const emptyForm = {
  reference: '', code_barres: '', nom: '', categorie_id: '', description: '',
  prix_achat: '', prix_vente: '', quantite: '', seuil_alerte: '5',
  fournisseur_id: '', emplacement: {},
}

export default function AjouterArticle() {
  const { etablissement, typeEtablissement } = useOutletContext()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (etablissement) chargerDonnees()
  }, [etablissement])

  const chargerDonnees = async () => {
    const [{ data: cats }, { data: fours }] = await Promise.all([
      supabase.from('categories').select('*').eq('etablissement_id', etablissement.id),
      supabase.from('fournisseurs').select('*').eq('etablissement_id', etablissement.id),
    ])
    setCategories(cats || [])
    setFournisseurs(fours || [])
  }

  const genererRef = () => {
    const prefix = typeEtablissement.slice(0, 2).toUpperCase()
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    const num = Date.now().toString().slice(-4)
    setForm({ ...form, reference: `${prefix}-${rand}-${num}` })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Vérifier si l'article existe déjà
    const { data: existant } = await supabase
      .from('articles')
      .select('id, quantite')
      .eq('etablissement_id', etablissement.id)
      .eq('nom', form.nom)
      .single()

    if (existant) {
      // Article existant → ajouter la quantité
      const nouvelleQte = existant.quantite + parseInt(form.quantite || 0)
      await supabase.from('articles').update({ quantite: nouvelleQte, updated_at: new Date() }).eq('id', existant.id)
      await supabase.from('stock_mouvements').insert({
        etablissement_id: etablissement.id,
        article_id: existant.id,
        nom_article: form.nom,
        type: 'entree',
        quantite: parseInt(form.quantite || 0),
        quantite_avant: existant.quantite,
        quantite_apres: nouvelleQte,
        note: 'Ajout automatique — article déjà existant',
      })
      setSuccess(`Article existant — quantité mise à jour (+${form.quantite} unités).`)
    } else {
      // Nouvel article
      const { error: err } = await supabase.from('articles').insert({
        etablissement_id: etablissement.id,
        reference: form.reference,
        code_barres: form.code_barres || null,
        nom: form.nom,
        categorie_id: form.categorie_id || null,
        description: form.description || null,
        prix_achat: parseFloat(form.prix_achat),
        prix_vente: parseFloat(form.prix_vente),
        quantite: parseInt(form.quantite || 0),
        seuil_alerte: parseInt(form.seuil_alerte || 5),
        fournisseur_id: form.fournisseur_id || null,
        emplacement: form.emplacement,
      })

      if (err) { setError(err.message); setLoading(false); return }
      setSuccess('Article ajouté avec succès.')
    }

    setForm(emptyForm)
    setLoading(false)
  }

  const marge = form.prix_vente && form.prix_achat
    ? ((parseFloat(form.prix_vente) - parseFloat(form.prix_achat)) / parseFloat(form.prix_vente) * 100).toFixed(1)
    : null

  return (
    <div className="panel" style={{ maxWidth: 560 }}>
      <div className="panel-head">
        <h2>Ajouter un article</h2>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{typeEtablissement}</div>
      </div>

      {success && <div className="alert-success">✓ {success}</div>}
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={submit}>
        {/* Référence */}
        <div className="m-row">
          <div className="m-field">
            <label>Référence unique</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Ex : PH-AB12-0001" required style={{ flex: 1 }} />
              <button type="button" className="btn-ghost" style={{ flex: 'none', padding: '0 10px', fontSize: 11 }} onClick={genererRef}>Auto</button>
            </div>
          </div>
          <div className="m-field">
            <label>Code-barres (optionnel)</label>
            <input value={form.code_barres} onChange={(e) => setForm({ ...form, code_barres: e.target.value })} placeholder="Ex : 3012345678901" />
          </div>
        </div>

        <div className="m-field">
          <label>Nom de l'article</label>
          <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder={typeEtablissement === 'Pharmacie' ? 'Ex : Paracétamol 500mg' : 'Ex : Eau minérale 1.5L'} required />
        </div>

        <div className="m-row">
          <div className="m-field">
            <label>Catégorie</label>
            <select value={form.categorie_id} onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}>
              <option value="">-- Sélectionner --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="m-field">
            <label>Fournisseur</label>
            <select value={form.fournisseur_id} onChange={(e) => setForm({ ...form, fournisseur_id: e.target.value })}>
              <option value="">-- Sélectionner --</option>
              {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>
        </div>

        <div className="m-field">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de l'article..." />
        </div>

        {/* Prix */}
        <div className="m-row">
          <div className="m-field">
            <label>Prix d'achat (F)</label>
            <input type="number" min="0" step="1" value={form.prix_achat} onChange={(e) => setForm({ ...form, prix_achat: e.target.value })} placeholder="0" required />
          </div>
          <div className="m-field">
            <label>Prix de vente (F)</label>
            <input type="number" min="0" step="1" value={form.prix_vente} onChange={(e) => setForm({ ...form, prix_vente: e.target.value })} placeholder="0" required />
          </div>
        </div>

        {marge !== null && (
          <div style={{ fontSize: 11, color: parseFloat(marge) > 0 ? 'var(--success)' : 'var(--danger)', marginTop: -6, marginBottom: 10 }}>
            Marge : {marge}% — Bénéfice par unité : {(parseFloat(form.prix_vente) - parseFloat(form.prix_achat)).toLocaleString('fr-FR')} F
          </div>
        )}

        {/* Stock */}
        <div className="m-row">
          <div className="m-field">
            <label>Quantité initiale</label>
            <input type="number" min="0" step="1" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} placeholder="0" required />
          </div>
          <div className="m-field">
            <label>Seuil d'alerte (min)</label>
            <input type="number" min="0" step="1" value={form.seuil_alerte} onChange={(e) => setForm({ ...form, seuil_alerte: e.target.value })} placeholder="5" />
            <div className="hint">Alerte déclenchée quand le stock atteint ce seuil.</div>
          </div>
        </div>

        {/* Emplacement adapté */}
        <EmplacementField
          typeEtablissement={typeEtablissement}
          value={form.emplacement}
          onChange={(e) => setForm({ ...form, emplacement: e })}
        />

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          <Icon.Plus />
          {loading ? 'Ajout en cours...' : "Ajouter l'article"}
        </button>
      </form>
    </div>
  )
}