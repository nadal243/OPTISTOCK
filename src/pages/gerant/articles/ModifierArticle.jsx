import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'
import { logAction } from '../../../lib/historique.js'
import EmplacementField from './EmplacementField.jsx'
import ConfirmPassword from '../../../components/ConfirmPassword.jsx'

const TYPES = ['Boutique', 'Pharmacie', 'Alimentation', 'Mini-supermarché', 'Dépôt', 'Magasin', 'Entrepôt']

export default function ModifierArticle() {
  const { etablissement, gerant, typeEtablissement } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [fournisseurs, setFournisseurs] = useState([])
  const [recherche, setRecherche] = useState('')
  const [articleSelectionne, setArticleSelectionne] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [confirmAction, setConfirmAction] = useState(null) // 'prix' | 'stock' | 'save'

  useEffect(() => {
    if (etablissement) chargerDonnees()
  }, [etablissement])

  const chargerDonnees = async () => {
    const [{ data: arts }, { data: cats }, { data: fours }] = await Promise.all([
      supabase.from('articles').select('*, categories(nom)').eq('etablissement_id', etablissement.id).order('nom'),
      supabase.from('categories').select('*').eq('etablissement_id', etablissement.id),
      supabase.from('fournisseurs').select('*').eq('etablissement_id', etablissement.id),
    ])
    setArticles(arts || [])
    setCategories(cats || [])
    setFournisseurs(fours || [])
  }

  const selectionner = (article) => {
    setArticleSelectionne(article)
    setForm({ ...article })
    setSuccess('')
    setError('')
  }

  const filtres = articles.filter(a =>
    a.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    a.reference.toLowerCase().includes(recherche.toLowerCase())
  )

  // Vérifie si une action sensible est détectée
  const actionsSensibles = () => {
    if (!form || !articleSelectionne) return null
    if (parseFloat(form.prix_vente) !== parseFloat(articleSelectionne.prix_vente) ||
      parseFloat(form.prix_achat) !== parseFloat(articleSelectionne.prix_achat)) {
      return 'prix'
    }
    if (parseInt(form.quantite) !== parseInt(articleSelectionne.quantite)) {
      return 'stock'
    }
    return 'save'
  }

  const demanderConfirmation = (e) => {
    e.preventDefault()
    setConfirmAction(actionsSensibles())
  }

  const enregistrer = async () => {
    setConfirmAction(null)
    setLoading(true)
    setError('')

    const prixChange = parseFloat(form.prix_vente) !== parseFloat(articleSelectionne.prix_vente)
    const stockChange = parseInt(form.quantite) !== parseInt(articleSelectionne.quantite)

    const { error: err } = await supabase
      .from('articles')
      .update({
        nom: form.nom,
        categorie_id: form.categorie_id || null,
        description: form.description || null,
        prix_achat: parseFloat(form.prix_achat),
        prix_vente: parseFloat(form.prix_vente),
        quantite: parseInt(form.quantite),
        seuil_alerte: parseInt(form.seuil_alerte),
        fournisseur_id: form.fournisseur_id || null,
        emplacement: form.emplacement,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleSelectionne.id)

    if (err) { setError(err.message); setLoading(false); return }

    // Traçabilité
    if (prixChange) {
      await logAction({
        etablissement_id: etablissement.id,
        user_id: gerant.id,
        user_nom: gerant.nom_complet,
        type: 'changement_prix',
        description: `Prix de "${form.nom}" modifié : ${articleSelectionne.prix_vente} F → ${form.prix_vente} F`,
        meta: { article_id: articleSelectionne.id, ancien_prix: articleSelectionne.prix_vente, nouveau_prix: form.prix_vente },
      })
    }

    if (stockChange) {
      await logAction({
        etablissement_id: etablissement.id,
        user_id: gerant.id,
        user_nom: gerant.nom_complet,
        type: 'modification_stock',
        description: `Stock de "${form.nom}" modifié : ${articleSelectionne.quantite} → ${form.quantite}`,
        meta: { article_id: articleSelectionne.id, ancien_stock: articleSelectionne.quantite, nouveau_stock: form.quantite },
      })
    }

    await logAction({
      etablissement_id: etablissement.id,
      user_id: gerant.id,
      user_nom: gerant.nom_complet,
      type: 'modification_article',
      description: `Article "${form.nom}" modifié`,
      meta: { article_id: articleSelectionne.id },
    })

    chargerDonnees()
    setSuccess(`"${form.nom}" mis à jour avec succès.`)
    setArticleSelectionne(null)
    setForm(null)
    setLoading(false)
    setTimeout(() => setSuccess(''), 4000)
  }

  const marge = form
    ? ((parseFloat(form.prix_vente || 0) - parseFloat(form.prix_achat || 0)) / parseFloat(form.prix_vente || 1) * 100).toFixed(1)
    : null

  const confirmConfig = {
    prix: { titre: 'Modification de prix', description: 'Vous modifiez le prix d\'un article. Cette action est sensible et sera enregistrée. Confirmez avec votre mot de passe.' },
    stock: { titre: 'Modification du stock', description: 'Vous modifiez manuellement le stock. Cette action est sensible et sera tracée. Confirmez avec votre mot de passe.' },
    save: { titre: 'Confirmer la modification', description: 'Veuillez confirmer votre identité pour enregistrer les modifications.' },
  }

  return (
    <>
      {success && <div className="alert-success">✓ {success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: form ? '1fr 1fr' : '1fr', gap: 12 }}>
        {/* Liste articles */}
        <div className="panel">
          <div className="panel-head">
            <h2>Sélectionner un article</h2>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{filtres.length} article(s)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--panel-2)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 11px', marginBottom: 12 }}>
            <Icon.Search style={{ width: 14, height: 14, color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text)', width: '100%', fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {filtres.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon.FilePlus /></div>
              <h3>Aucun article</h3>
              <p>Ajoutez d'abord des articles.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtres.map((a) => {
                const enRupture = a.quantite === 0
                const stockFaible = a.quantite > 0 && a.quantite <= a.seuil_alerte
                return (
                  <div
                    key={a.id}
                    onClick={() => selectionner(a)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 8, border: '1.5px solid',
                      borderColor: articleSelectionne?.id === a.id ? 'var(--accent)' : 'var(--border)',
                      background: articleSelectionne?.id === a.id ? 'var(--accent-pale)' : 'var(--panel-2)',
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{a.nom}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{a.reference}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }}>
                        {parseInt(a.prix_vente).toLocaleString('fr-FR')} F
                      </div>
                      <div style={{ fontSize: 10.5, color: enRupture ? '#DC2626' : stockFaible ? '#D97706' : '#16A34A', fontWeight: 600 }}>
                        {enRupture ? '⛔ Rupture' : stockFaible ? `⚠️ ${a.quantite} restant(s)` : `✓ ${a.quantite}`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Formulaire modification */}
        {form && (
          <div className="panel">
            <div className="panel-head">
              <h2>Modifier « {form.nom} »</h2>
              <button className="btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => { setForm(null); setArticleSelectionne(null) }}>
                Fermer
              </button>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={demanderConfirmation}>
              <div className="m-field">
                <label>Nom de l'article</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="m-field">
                  <label>Catégorie</label>
                  <select value={form.categorie_id || ''} onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}>
                    <option value="">-- Sélectionner --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="m-field">
                  <label>Fournisseur</label>
                  <select value={form.fournisseur_id || ''} onChange={(e) => setForm({ ...form, fournisseur_id: e.target.value })}>
                    <option value="">-- Sélectionner --</option>
                    {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
              </div>

              <div className="m-field">
                <label>Description</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, outline: 'none', resize: 'vertical', minHeight: 50, fontFamily: 'Inter, sans-serif', background: 'var(--panel-2)', color: 'var(--text)' }}
                />
              </div>

              {/* Prix — zone sensible */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: 12, marginBottom: 11 }}>
                <div style={{ fontSize: 9.5, color: '#92400E', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  ⚠️ Zone sensible — modification de prix
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="m-field" style={{ marginBottom: 0 }}>
                    <label>Prix d'achat (F)</label>
                    <input type="number" min="0" step="1" value={form.prix_achat} onChange={(e) => setForm({ ...form, prix_achat: e.target.value })} required />
                  </div>
                  <div className="m-field" style={{ marginBottom: 0 }}>
                    <label>Prix de vente (F)</label>
                    <input type="number" min="0" step="1" value={form.prix_vente} onChange={(e) => setForm({ ...form, prix_vente: e.target.value })} required />
                  </div>
                </div>
                {marge && (
                  <div style={{ fontSize: 11, color: parseFloat(marge) > 0 ? '#16A34A' : '#DC2626', marginTop: 6 }}>
                    Marge : {marge}% — Bénéfice/unité : {(parseFloat(form.prix_vente || 0) - parseFloat(form.prix_achat || 0)).toLocaleString('fr-FR')} F
                  </div>
                )}
              </div>

              {/* Stock — zone sensible */}
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: 12, marginBottom: 11 }}>
                <div style={{ fontSize: 9.5, color: '#DC2626', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  ⚠️ Zone sensible — modification du stock
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="m-field" style={{ marginBottom: 0 }}>
                    <label>Quantité</label>
                    <input type="number" min="0" step="1" value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} required />
                  </div>
                  <div className="m-field" style={{ marginBottom: 0 }}>
                    <label>Seuil d'alerte</label>
                    <input type="number" min="0" step="1" value={form.seuil_alerte} onChange={(e) => setForm({ ...form, seuil_alerte: e.target.value })} />
                  </div>
                </div>
              </div>

              <EmplacementField
                typeEtablissement={typeEtablissement}
                value={form.emplacement || {}}
                onChange={(e) => setForm({ ...form, emplacement: e })}
              />

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                <Icon.Edit />
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal confirmation mot de passe */}
      {confirmAction && (
        <ConfirmPassword
          gerant={gerant}
          titre={confirmConfig[confirmAction]?.titre}
          description={confirmConfig[confirmAction]?.description}
          onConfirm={enregistrer}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  )
}