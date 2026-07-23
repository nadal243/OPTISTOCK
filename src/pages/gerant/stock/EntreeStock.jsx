import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

export default function EntreeStock() {
  const { etablissement } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [form, setForm] = useState({ article_id: '', quantite: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [articleSelectionne, setArticleSelectionne] = useState(null)

  useEffect(() => { if (etablissement) chargerArticles() }, [etablissement])

  const chargerArticles = async () => {
    const { data } = await supabase.from('articles').select('id, nom, reference, quantite').eq('etablissement_id', etablissement.id).order('nom')
    setArticles(data || [])
  }

  const selectArticle = (id) => {
    const a = articles.find(x => x.id === id)
    setArticleSelectionne(a || null)
    setForm({ ...form, article_id: id })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const qte = parseInt(form.quantite)
    const qtAvant = articleSelectionne.quantite
    const qtApres = qtAvant + qte

    await supabase.from('articles').update({ quantite: qtApres, updated_at: new Date() }).eq('id', form.article_id)
    await supabase.from('stock_mouvements').insert({
      etablissement_id: etablissement.id,
      article_id: form.article_id,
      nom_article: articleSelectionne.nom,
      type: 'entree',
      quantite: qte,
      quantite_avant: qtAvant,
      quantite_apres: qtApres,
      note: form.note || null,
    })

    setArticles(prev => prev.map(a => a.id === form.article_id ? { ...a, quantite: qtApres } : a))
    setSuccess(`Stock mis à jour : ${articleSelectionne.nom} → ${qtAvant} + ${qte} = ${qtApres} unités.`)
    setForm({ article_id: '', quantite: '', note: '' })
    setArticleSelectionne(null)
    setLoading(false)
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <div className="panel" style={{ maxWidth: 480 }}>
      <div className="panel-head"><h2>Enregistrer une entrée de stock</h2></div>
      {success && <div className="alert-success">✓ {success}</div>}
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={submit}>
        <div className="m-field">
          <label>Article</label>
          <select value={form.article_id} onChange={(e) => selectArticle(e.target.value)} required>
            <option value="">-- Sélectionner un article --</option>
            {articles.map((a) => (
              <option key={a.id} value={a.id}>{a.nom} — Stock actuel : {a.quantite}</option>
            ))}
          </select>
        </div>

        {articleSelectionne && (
          <div style={{ background: 'var(--accent-pale)', border: '1px solid rgba(26,122,80,.2)', borderRadius: 8, padding: 10, marginBottom: 11, fontSize: 12 }}>
            <strong>{articleSelectionne.nom}</strong>
            <div style={{ color: 'var(--muted)', marginTop: 2 }}>
              Réf : {articleSelectionne.reference} · Stock actuel : <strong>{articleSelectionne.quantite}</strong>
            </div>
          </div>
        )}

        <div className="m-field">
          <label>Quantité à ajouter</label>
          <input type="number" min="1" step="1" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} placeholder="Ex : 50" required />
          {form.quantite && articleSelectionne && (
            <div className="hint" style={{ color: 'var(--success)' }}>
              Nouveau stock : {articleSelectionne.quantite + parseInt(form.quantite || 0)} unités
            </div>
          )}
        </div>

        <div className="m-field">
          <label>Note (optionnel)</label>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ex : Livraison fournisseur Diallo & Fils" />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          <Icon.Database />
          {loading ? 'Enregistrement...' : 'Enregistrer l\'entrée'}
        </button>
      </form>
    </div>
  )
}