import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

export default function NouvelleVente() {
  const { etablissement, gerant } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [panier, setPanier] = useState([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { if (etablissement) chargerArticles() }, [etablissement])

  const chargerArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('id, nom, reference, prix_vente, prix_achat, quantite')
      .eq('etablissement_id', etablissement.id)
      .gt('quantite', 0)
      .order('nom')
    setArticles(data || [])
  }

  const ajouterAuPanier = (article) => {
    const existant = panier.find(p => p.id === article.id)
    if (existant) {
      if (existant.quantite >= article.quantite) {
        setError(`Stock insuffisant pour "${article.nom}". Maximum : ${article.quantite}`)
        return
      }
      setPanier(p => p.map(x => x.id === article.id ? { ...x, quantite: x.quantite + 1 } : x))
    } else {
      setPanier(p => [...p, { ...article, quantite: 1 }])
    }
    setError('')
  }

  const modifierQte = (id, qte) => {
    const article = articles.find(a => a.id === id)
    if (qte < 1) return
    if (qte > article.quantite) { setError(`Stock max : ${article.quantite}`); return }
    setPanier(p => p.map(x => x.id === id ? { ...x, quantite: qte } : x))
  }

  const retirerDuPanier = (id) => {
    setPanier(p => p.filter(x => x.id !== id))
  }

  const totalVente = panier.reduce((s, p) => s + p.prix_vente * p.quantite, 0)
  const totalBenefice = panier.reduce((s, p) => s + (p.prix_vente - p.prix_achat) * p.quantite, 0)

  const validerVente = async () => {
    if (panier.length === 0) return
    setLoading(true)
    setError('')

    // Re-vérifier les stocks
    for (const item of panier) {
      const { data: art } = await supabase.from('articles').select('quantite').eq('id', item.id).single()
      if (!art || art.quantite < item.quantite) {
        setError(`Stock insuffisant pour "${item.nom}".`)
        setLoading(false)
        return
      }
    }

    // Créer la vente
    const { data: vente, error: venteErr } = await supabase.from('ventes').insert({
      etablissement_id: etablissement.id,
      vendeur_id: gerant.id,
      montant_total: totalVente,
      benefice_total: totalBenefice,
    }).select().single()

    if (venteErr) { setError(venteErr.message); setLoading(false); return }

    // Créer les items et déduire le stock
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
        note: `Vente #${vente.id.slice(-6)}`,
      })
    }

    setSuccess({ total: totalVente, benefice: totalBenefice, nb: panier.length })
    setPanier([])
    chargerArticles()
    setLoading(false)
  }

  const filtres = articles.filter(a =>
    a.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    a.reference.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 12, alignItems: 'start' }}>
      {/* Articles */}
      <div>
        {success && (
          <div className="alert-success" style={{ marginBottom: 10 }}>
            ✓ Vente validée — {success.nb} article(s) · Total : {parseInt(success.total).toLocaleString('fr-FR')} F · Bénéfice : {parseInt(success.benefice).toLocaleString('fr-FR')} F
          </div>
        )}
        {error && <div className="alert-error" style={{ marginBottom: 10 }}>{error}</div>}

        <div className="panel">
          <div className="panel-head">
            <h2>Articles disponibles ({filtres.length})</h2>
            <div className="search-box" style={{ width: 180 }}>
              <Icon.Search />
              <input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {filtres.map((a) => (
              <div
                key={a.id}
                onClick={() => ajouterAuPanier(a)}
                style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, cursor: 'pointer', transition: 'border-color .15s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{a.nom}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>{a.reference}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{parseInt(a.prix_vente).toLocaleString('fr-FR')} F</span>
                  <span style={{ fontSize: 10.5, color: a.quantite <= 5 ? 'var(--warning)' : 'var(--muted)' }}>Stock : {a.quantite}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panier */}
      <div className="panel" style={{ position: 'sticky', top: 0 }}>
        <div className="panel-head"><h2>Panier</h2></div>

        {panier.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 12 }}>
            Cliquez sur un article pour l'ajouter.
          </div>
        ) : (
          <>
            {panier.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{p.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{parseInt(p.prix_vente).toLocaleString('fr-FR')} F × {p.quantite}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--panel-2)', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => modifierQte(p.id, p.quantite - 1)}>-</button>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{p.quantite}</span>
                  <button style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--panel-2)', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => modifierQte(p.id, p.quantite + 1)}>+</button>
                  <button style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--panel-2)', cursor: 'pointer', color: 'var(--danger)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => retirerDuPanier(p.id)}>×</button>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', minWidth: 60, textAlign: 'right' }}>
                  {(parseInt(p.prix_vente) * p.quantite).toLocaleString('fr-FR')} F
                </div>
              </div>
            ))}

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                <span>Total</span>
                <strong style={{ color: 'var(--text)' }}>{parseInt(totalVente).toLocaleString('fr-FR')} F</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
                <span>Bénéfice estimé</span>
                <span style={{ color: 'var(--success)' }}>{parseInt(totalBenefice).toLocaleString('fr-FR')} F</span>
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={validerVente} disabled={loading}>
                <Icon.Card />
                {loading ? 'Validation...' : 'Valider la vente'}
              </button>
              <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} onClick={() => setPanier([])}>
                Vider le panier
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}