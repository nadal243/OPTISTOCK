import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../components/Icons.jsx'
import { supabase } from '../../lib/supabaseClient.js'

export default function RechercheArticle() {
  const { etablissement } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)
  const [articleDetail, setArticleDetail] = useState(null)

  useEffect(() => { if (etablissement) charger() }, [etablissement])

  const charger = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*, categories(nom), fournisseurs(nom)')
      .eq('etablissement_id', etablissement.id)
      .order('nom')
    setArticles(data || [])
    setLoading(false)
  }

  const filtres = articles.filter(a =>
    a.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    a.reference.toLowerCase().includes(recherche.toLowerCase()) ||
    (a.code_barres && a.code_barres.includes(recherche))
  )

  const formatEmp = (emplacement) => {
    if (!emplacement || Object.keys(emplacement).length === 0) return 'Non renseigné'
    return Object.entries(emplacement).filter(([, v]) => v).map(([k, v]) => `${v}`).join(' › ')
  }

  const statutStock = (a) => {
    if (a.quantite === 0) return { label: 'Rupture de stock', color: '#DC2626', bg: '#FEF2F2' }
    if (a.quantite <= a.seuil_alerte) return { label: 'Stock faible', color: '#D97706', bg: '#FFFBEB' }
    return { label: 'En stock', color: '#16A34A', bg: '#F0FDF4' }
  }

  const f = (n) => parseInt(n).toLocaleString('fr-FR') + ' F'

  return (
    <>
      <div className="panel">
        <div className="panel-head"><h2>Rechercher un article</h2></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--panel-2)', border: '2px solid var(--accent)', borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
          <Icon.Search style={{ width: 16, height: 16, color: 'var(--accent)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Nom, référence ou code-barres..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--text)', width: '100%', fontFamily: 'Inter, sans-serif' }}
            autoFocus
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{filtres.length} article(s)</div>
      </div>

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: articleDetail ? '1fr 1fr' : '1fr', gap: 12 }}>
          <div className="panel">
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Emplacement</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((a) => {
                  const s = statutStock(a)
                  const emp = formatEmp(a.emplacement)
                  return (
                    <tr
                      key={a.id}
                      style={{ cursor: 'pointer', background: articleDetail?.id === a.id ? 'var(--accent-pale)' : '' }}
                      onClick={() => setArticleDetail(articleDetail?.id === a.id ? null : a)}
                    >
                      <td>
                        <div className="name-cell">{a.nom}</div>
                        <div className="sub-cell" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{a.reference}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{f(a.prix_vente)}</td>
                      <td style={{ fontWeight: 700 }}>{a.quantite}</td>
                      <td style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 120 }}>📍 {emp}</td>
                      <td><span className="badge" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Détail article */}
          {articleDetail && (
            <div className="panel" style={{ position: 'sticky', top: 0 }}>
              <div className="panel-head">
                <h2>{articleDetail.nom}</h2>
                <button className="modal-close" onClick={() => setArticleDetail(null)}><Icon.X /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[
                  { label: 'Prix de vente', value: f(articleDetail.prix_vente), color: 'var(--accent)' },
                  { label: 'Stock disponible', value: `${articleDetail.quantite} unité(s)`, color: articleDetail.quantite === 0 ? 'var(--danger)' : 'var(--success)' },
                  { label: 'Référence', value: articleDetail.reference },
                  { label: 'Catégorie', value: articleDetail.categories?.nom || '-' },
                ].map((item) => (
                  <div key={item.label} style={{ background: 'var(--panel-2)', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 9.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: item.color || 'var(--text)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Emplacement */}
              <div style={{ background: 'var(--accent-pale)', border: '1px solid rgba(26,122,80,.2)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 9.5, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>📍 EMPLACEMENT</div>
                {articleDetail.emplacement && Object.keys(articleDetail.emplacement).length > 0 ? (
                  Object.entries(articleDetail.emplacement).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Emplacement non renseigné.</div>
                )}
              </div>

              {articleDetail.description && (
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{articleDetail.description}</div>
              )}

              {/* Alerte rupture */}
              {articleDetail.quantite === 0 && (
                <div className="alert-error" style={{ marginTop: 10 }}>⛔ Cet article est en rupture de stock. La vente est impossible.</div>
              )}
              {articleDetail.quantite > 0 && articleDetail.quantite <= articleDetail.seuil_alerte && (
                <div className="alert-warning" style={{ marginTop: 10 }}>⚠️ Stock faible — seulement {articleDetail.quantite} unité(s) restante(s).</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}