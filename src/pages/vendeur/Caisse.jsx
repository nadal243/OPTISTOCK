import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../components/Icons.jsx'
import { supabase } from '../../lib/supabaseClient.js'

export default function Caisse() {
  const { vendeur, etablissement } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [recherche, setRecherche] = useState('')
  const [panier, setPanier] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')
  const [filtreCategorie, setFiltreCategorie] = useState('tous')
  const [categories, setCategories] = useState([])
  const searchRef = useRef(null)

  useEffect(() => {
    if (etablissement) {
      chargerArticles()
      chargerCategories()
    }
    // Focus automatique sur la recherche
    searchRef.current?.focus()
  }, [etablissement])

  const chargerArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*, categories(nom)')
      .eq('etablissement_id', etablissement.id)
      .order('nom')
    setArticles(data || [])
  }

  const chargerCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('etablissement_id', etablissement.id)
      .order('nom')
    setCategories(data || [])
  }

  /* ---- Filtrage articles ---- */
  const articlesFiltres = articles.filter((a) => {
    const texteOk =
      a.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      a.reference.toLowerCase().includes(recherche.toLowerCase()) ||
      (a.code_barres && a.code_barres.includes(recherche))
    const catOk = filtreCategorie === 'tous' || a.categorie_id === filtreCategorie
    return texteOk && catOk
  })

  /* ---- Emplacement lisible ---- */
  const formatEmp = (emplacement) => {
    if (!emplacement || Object.keys(emplacement).length === 0) return null
    return Object.entries(emplacement)
      .filter(([, v]) => v)
      .map(([k, v]) => v)
      .join(' › ')
  }

  /* ---- Panier ---- */
  const ajouterAuPanier = (article) => {
    if (article.quantite === 0) {
      setError(`"${article.nom}" est en rupture de stock.`)
      return
    }
    const existant = panier.find(p => p.id === article.id)
    if (existant) {
      if (existant.quantite >= article.quantite) {
        setError(`Stock insuffisant pour "${article.nom}". Max : ${article.quantite}`)
        return
      }
      setPanier(p => p.map(x => x.id === article.id ? { ...x, quantite: x.quantite + 1 } : x))
    } else {
      setPanier(p => [...p, { ...article, quantite: 1 }])
    }
    setError('')
    setSuccess(null)
  }

  const modifierQte = (id, nouvQte) => {
    const art = articles.find(a => a.id === id)
    if (nouvQte < 1) { retirerDuPanier(id); return }
    if (nouvQte > art.quantite) { setError(`Stock max pour "${art.nom}" : ${art.quantite}`); return }
    setPanier(p => p.map(x => x.id === id ? { ...x, quantite: nouvQte } : x))
    setError('')
  }

  const retirerDuPanier = (id) => setPanier(p => p.filter(x => x.id !== id))

  /* ---- Totaux ---- */
  const totalCA = panier.reduce((s, p) => s + p.prix_vente * p.quantite, 0)
  const totalBenefice = panier.reduce((s, p) => s + (p.prix_vente - p.prix_achat) * p.quantite, 0)
  const nbArticlesPanier = panier.reduce((s, p) => s + p.quantite, 0)

  /* ---- Validation vente ---- */
  const validerVente = async () => {
    if (panier.length === 0) return
    setLoading(true)
    setError('')

    // Vérification finale des stocks
    for (const item of panier) {
      const { data: art } = await supabase.from('articles').select('quantite, nom').eq('id', item.id).single()
      if (!art || art.quantite < item.quantite) {
        setError(`Stock insuffisant pour "${item.nom}". Disponible : ${art?.quantite || 0}`)
        setLoading(false)
        return
      }
    }

    // Créer la vente
    const { data: vente, error: venteErr } = await supabase
      .from('ventes')
      .insert({
        etablissement_id: etablissement.id,
        vendeur_id: vendeur.id,
        montant_total: totalCA,
        benefice_total: totalBenefice,
      })
      .select().single()

    if (venteErr) { setError(venteErr.message); setLoading(false); return }

    // Items + mise à jour stock
    for (const item of panier) {
      await supabase.from('vente_items').insert({
        vente_id: vente.id,
        article_id: item.id,
        nom_article: item.nom,
        quantite: item.quantite,
        prix_achat: item.prix_achat,
        prix_vente: item.prix_vente,
        benefice: (item.prix_vente - item.prix_achat) * item.quantite,
      })

      const { data: art } = await supabase.from('articles').select('quantite').eq('id', item.id).single()
      const qtApres = art.quantite - item.quantite
      await supabase.from('articles').update({ quantite: qtApres }).eq('id', item.id)

      await supabase.from('stock_mouvements').insert({
        etablissement_id: etablissement.id,
        article_id: item.id,
        nom_article: item.nom,
        type: 'sortie',
        quantite: item.quantite,
        quantite_avant: art.quantite,
        quantite_apres: qtApres,
        note: `Vente — ${vendeur.nom_complet}`,
      })

      // Alerte rupture après vente
      if (qtApres === 0) {
        await supabase.from('alertes').insert({
          etablissement_id: etablissement.id,
          type: 'rupture',
          message: `"${item.nom}" est en rupture de stock.`,
          article_id: item.id,
        })
      } else if (qtApres <= item.seuil_alerte) {
        await supabase.from('alertes').insert({
          etablissement_id: etablissement.id,
          type: 'stock_faible',
          message: `"${item.nom}" — stock faible (${qtApres} restant${qtApres > 1 ? 's' : ''}).`,
          article_id: item.id,
        })
      }
    }

    const panierSnapshot = [...panier]
    setSuccess({ total: totalCA, nb: nbArticlesPanier, items: panierSnapshot })
    setPanier([])
    chargerArticles() // Rafraîchir les stocks
    setLoading(false)
    searchRef.current?.focus()
  }

  const f = (n) => parseInt(n).toLocaleString('fr-FR') + ' F'

  return (
    <div className="caisse-grid">
      {/* ---- GAUCHE : Articles ---- */}
      <div>
        {error && <div className="alert-error">⚠️ {error}</div>}
        {success && (
          <div className="alert-success">
            ✓ Vente validée — {success.nb} article(s) · Total : <strong>{f(success.total)}</strong>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="panel" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--panel-2)', border: '2px solid var(--accent)', borderRadius: 10, padding: '10px 14px' }}>
              <Icon.Search style={{ width: 16, height: 16, color: 'var(--accent)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Nom du produit, référence ou code-barres..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--text)', width: '100%', fontFamily: 'Inter, sans-serif' }}
              />
              {recherche && (
                <button onClick={() => setRecherche('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', fontSize: 16 }}>×</button>
              )}
            </div>

            {/* Filtre catégorie */}
            <select
              value={filtreCategorie}
              onChange={(e) => setFiltreCategorie(e.target.value)}
              style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '9px 11px', fontSize: 12.5, color: 'var(--text)', background: 'var(--panel-2)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            >
              <option value="tous">Toutes catégories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>

          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
            {articlesFiltres.length} article(s) trouvé(s)
            {recherche && <span> pour "<strong>{recherche}</strong>"</span>}
          </div>
        </div>

        {/* Grille articles */}
        {articlesFiltres.length === 0 ? (
          <div className="panel">
            <div className="empty-state">
              <div className="empty-icon"><Icon.Search /></div>
              <h3>Aucun article trouvé</h3>
              <p>Essaie un autre nom, référence ou code-barres.</p>
            </div>
          </div>
        ) : (
          <div className="articles-grid">
            {articlesFiltres.map((a) => {
              const enRupture = a.quantite === 0
              const stockFaible = a.quantite > 0 && a.quantite <= a.seuil_alerte
              const empText = formatEmp(a.emplacement)
              return (
                <div
                  key={a.id}
                  className={`article-card ${enRupture ? 'rupture' : ''} ${!enRupture && stockFaible ? 'stock-faible' : ''}`}
                  onClick={() => !enRupture && ajouterAuPanier(a)}
                >
                  {enRupture && <span className="rupture-badge">RUPTURE</span>}
                  {!enRupture && stockFaible && <span className="stock-faible-badge">STOCK FAIBLE</span>}

                  <div className="article-nom">{a.nom}</div>
                  <div className="article-ref">{a.reference}</div>

                  <div className="article-prix">{f(a.prix_vente)}</div>

                  <div className="article-stock" style={{ color: enRupture ? 'var(--danger)' : stockFaible ? 'var(--warning)' : 'var(--muted)' }}>
                    {enRupture ? '⛔ Rupture' : stockFaible ? `⚠️ ${a.quantite} restant${a.quantite > 1 ? 's' : ''}` : `✓ ${a.quantite} en stock`}
                  </div>

                  {empText && (
                    <div className="article-emplacement">
                      📍 {empText}
                    </div>
                  )}

                  {a.categories?.nom && (
                    <div style={{ fontSize: 9.5, color: 'var(--muted)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                      {a.categories.nom}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ---- DROITE : Panier ---- */}
      <div className="panier">
        <div className="panier-head">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>Panier</h2>
            {panier.length > 0 && (
              <span style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {nbArticlesPanier} article(s)
              </span>
            )}
          </div>
        </div>

        <div className="panier-body">
          {panier.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🛒</div>
              Cliquez sur un article pour l'ajouter.
            </div>
          ) : (
            panier.map((p) => (
              <div key={p.id} className="panier-item">
                <div style={{ flex: 1 }}>
                  <div className="panier-nom">{p.nom}</div>
                  <div className="panier-prix-unit">{f(p.prix_vente)} / unité</div>
                </div>
                <div className="qte-ctrl">
                  <button className="qte-btn" onClick={() => modifierQte(p.id, p.quantite - 1)}>−</button>
                  <span className="qte-val">{p.quantite}</span>
                  <button className="qte-btn" onClick={() => modifierQte(p.id, p.quantite + 1)}>+</button>
                </div>
                <div className="panier-sous-total">{f(p.prix_vente * p.quantite)}</div>
                <button className="retirer-btn" onClick={() => retirerDuPanier(p.id)}>×</button>
              </div>
            ))
          )}
        </div>

        {panier.length > 0 && (
          <div className="panier-footer">
            {/* Ticket récapitulatif */}
            <div className="ticket-box">
              <div className="ticket-titre">Récapitulatif</div>
              {panier.map((p) => (
                <div key={p.id} className="ticket-ligne">
                  <span>{p.nom} × {p.quantite}</span>
                  <span>{f(p.prix_vente * p.quantite)}</span>
                </div>
              ))}
              <div className="ticket-ligne total">
                <span>TOTAL</span>
                <span>{f(totalCA)}</span>
              </div>
            </div>

            {/* Boutons action */}
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 10, padding: '12px', fontSize: 13 }}
              onClick={validerVente}
              disabled={loading}
            >
              <Icon.Card />
              {loading ? 'Validation...' : `Valider — ${f(totalCA)}`}
            </button>

            <button
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
              onClick={() => { setPanier([]); setError(''); setSuccess(null) }}
            >
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </div>
  )
}