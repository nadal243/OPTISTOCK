import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'
import { logAction } from '../../../lib/historique.js'
import ConfirmPassword from '../../../components/ConfirmPassword.jsx'

export default function Ajustements() {
  const { etablissement, gerant } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [form, setForm] = useState({ article_id: '', type: 'ajustement', quantite: '', sens: '+', raison: '' })
  const [articleSelectionne, setArticleSelectionne] = useState(null)
  const [mouvements, setMouvements] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const RAISONS = [
    'Produit abîmé / cassé', 'Perte ou vol', 'Produit périmé',
    'Erreur de saisie précédente', 'Don / offert', 'Retour fournisseur', 'Autre',
  ]

  useEffect(() => {
    if (etablissement) { chargerArticles(); chargerMouvements() }
  }, [etablissement])

  const chargerArticles = async () => {
    const { data } = await supabase.from('articles').select('id, nom, reference, quantite').eq('etablissement_id', etablissement.id).order('nom')
    setArticles(data || [])
  }

  const chargerMouvements = async () => {
    const { data } = await supabase
      .from('stock_mouvements')
      .select('*, articles(nom)')
      .eq('etablissement_id', etablissement.id)
      .in('type', ['ajustement', 'correction'])
      .order('created_at', { ascending: false })
      .limit(50)
    setMouvements(data || [])
  }

  const selectArticle = (id) => {
    const a = articles.find(x => x.id === id)
    setArticleSelectionne(a || null)
    setForm({ ...form, article_id: id })
  }

  const nouveauStock = () => {
    if (!articleSelectionne || !form.quantite) return null
    const qte = parseInt(form.quantite)
    return form.sens === '+' ? articleSelectionne.quantite + qte : Math.max(0, articleSelectionne.quantite - qte)
  }

  const soumettre = (e) => {
    e.preventDefault()
    setError('')
    if (!form.raison) { setError('Veuillez sélectionner une raison.'); return }
    setConfirm(true)
  }

  const appliquer = async () => {
    setConfirm(false)
    setLoading(true)

    const qtAvant = articleSelectionne.quantite
    const qte = parseInt(form.quantite)
    const qtApres = nouveauStock()
    const diff = form.sens === '+' ? qte : -qte

    await supabase.from('articles').update({ quantite: qtApres, updated_at: new Date() }).eq('id', form.article_id)
    await supabase.from('stock_mouvements').insert({
      etablissement_id: etablissement.id,
      article_id: form.article_id,
      nom_article: articleSelectionne.nom,
      type: 'ajustement',
      quantite: qte,
      quantite_avant: qtAvant,
      quantite_apres: qtApres,
      note: form.raison,
      user_id: gerant.id,
    })

    await logAction({
      etablissement_id: etablissement.id,
      user_id: gerant.id,
      user_nom: gerant.nom_complet,
      type: 'modification_stock',
      description: `Ajustement "${articleSelectionne.nom}" : ${qtAvant} → ${qtApres} (${diff > 0 ? '+' : ''}${diff}) — ${form.raison}`,
      meta: { article_id: form.article_id, avant: qtAvant, apres: qtApres, raison: form.raison },
    })

    setArticles(prev => prev.map(a => a.id === form.article_id ? { ...a, quantite: qtApres } : a))
    setSuccess(`Ajustement effectué : "${articleSelectionne.nom}" → ${qtApres} unités.`)
    setForm({ article_id: '', type: 'ajustement', quantite: '', sens: '+', raison: '' })
    setArticleSelectionne(null)
    chargerMouvements()
    setLoading(false)
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <>
      {success && <div className="alert-success">✓ {success}</div>}
      {error && <div className="alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Formulaire ajustement */}
        <div className="panel">
          <div className="panel-head"><h2>Ajustement / Correction de stock</h2></div>

          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#DC2626', lineHeight: 1.5 }}>
            ⚠️ Les ajustements manuels sont des opérations sensibles. Ils seront tracés dans l'historique avec votre confirmation.
          </div>

          <form onSubmit={soumettre}>
            <div className="m-field">
              <label>Article</label>
              <select value={form.article_id} onChange={(e) => selectArticle(e.target.value)} required>
                <option value="">-- Sélectionner un article --</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>{a.nom} — Stock : {a.quantite}</option>
                ))}
              </select>
            </div>

            {articleSelectionne && (
              <div style={{ background: 'var(--accent-pale)', border: '1px solid rgba(26,122,80,.2)', borderRadius: 8, padding: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{articleSelectionne.nom}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  Stock actuel : <strong style={{ color: 'var(--text)' }}>{articleSelectionne.quantite}</strong>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <div className="m-field">
                <label>Sens</label>
                <select value={form.sens} onChange={(e) => setForm({ ...form, sens: e.target.value })}>
                  <option value="+">➕ Ajouter</option>
                  <option value="-">➖ Retirer</option>
                </select>
              </div>
              <div className="m-field">
                <label>Quantité</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                  placeholder="Ex : 10"
                  required
                />
              </div>
            </div>

            {articleSelectionne && form.quantite && (
              <div style={{ fontSize: 12, marginBottom: 12, padding: '8px 12px', background: 'var(--panel-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                Nouveau stock prévu : <strong style={{ color: 'var(--accent)', fontSize: 14 }}>{nouveauStock()}</strong>
              </div>
            )}

            <div className="m-field">
              <label>Raison de l'ajustement</label>
              <select value={form.raison} onChange={(e) => setForm({ ...form, raison: e.target.value })} required>
                <option value="">-- Sélectionner une raison --</option>
                {RAISONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              <Icon.Database />
              {loading ? 'Application...' : 'Appliquer l\'ajustement'}
            </button>
          </form>
        </div>

        {/* Historique ajustements */}
        <div className="panel">
          <div className="panel-head"><h2>Historique des ajustements</h2></div>
          {mouvements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon.Database /></div>
              <h3>Aucun ajustement</h3>
              <p>Les ajustements apparaîtront ici.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mouvements.map((m) => {
                const diff = m.quantite_apres - m.quantite_avant
                return (
                  <div key={m.id} style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.nom_article || m.articles?.nom}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{m.note}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: diff > 0 ? '#2563EB' : '#DC2626' }}>
                          {diff > 0 ? `+${diff}` : diff}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>
                          {m.quantite_avant} → {m.quantite_apres}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                      {new Date(m.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmPassword
          gerant={gerant}
          titre="Confirmer l'ajustement"
          description={`Vous êtes sur le point de modifier le stock de "${articleSelectionne?.nom}" : ${articleSelectionne?.quantite} → ${nouveauStock()}. Cette action sera tracée.`}
          onConfirm={appliquer}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  )
}