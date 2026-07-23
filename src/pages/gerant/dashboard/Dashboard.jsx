import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#1A7A50', '#22A06B', '#34D399', '#6EE7B7', '#A7F3D0']

export default function Dashboard() {
  const { etablissement } = useOutletContext()
  const [stats, setStats] = useState({ ca: 0, benefice: 0, ventes: 0, articles: 0, stockTotal: 0, ruptures: 0, stockFaible: 0 })
  const [topArticles, setTopArticles] = useState([])
  const [flopArticles, setFlopArticles] = useState([])
      const [rupturesArticles, setRupturesArticles] = useState([])
  const [ventesJour, setVentesJour] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (etablissement) chargerTout()
  }, [etablissement])

  const chargerTout = async () => {
    setLoading(true)
    const etabId = etablissement.id
    const today = new Date().toISOString().slice(0, 10)

    // Ventes du jour
    const { data: ventes } = await supabase
      .from('ventes')
      .select('montant_total, benefice_total, created_at')
      .eq('etablissement_id', etabId)
      .gte('created_at', `${today}T00:00:00`)

    const ca = ventes?.reduce((s, v) => s + v.montant_total, 0) || 0
    const ben = ventes?.reduce((s, v) => s + v.benefice_total, 0) || 0

    // Articles
    const { data: articles } = await supabase
      .from('articles')
      .select('id, nom, quantite, seuil_alerte')
      .eq('etablissement_id', etabId)

    const ruptures = articles?.filter(a => a.quantite === 0) || []
    const faibles = articles?.filter(a => a.quantite > 0 && a.quantite <= a.seuil_alerte) || []

    setStats({
      ca, benefice: ben, ventes: ventes?.length || 0,
      articles: articles?.length || 0,
      stockTotal: articles?.reduce((s, a) => s + a.quantite, 0) || 0,
      ruptures: ruptures.length, stockFaible: faibles.length,
    })
    setRupturesArticles(ruptures.slice(0, 5))

    // Ventes par heure pour graphique
    const parHeure = {}
    ventes?.forEach(v => {
      const h = `${String(new Date(v.created_at).getHours()).padStart(2, '0')}h`
      if (!parHeure[h]) parHeure[h] = { heure: h, ca: 0 }
      parHeure[h].ca += v.montant_total
    })
    setVentesJour(Object.values(parHeure).sort((a, b) => a.heure.localeCompare(b.heure)))

    // Top articles vendus (7 derniers jours)
    const il7j = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: items } = await supabase
      .from('vente_items')
      .select('nom_article, quantite, article_id')
      .gte('created_at', il7j)

    // Filtrer par établissement via les ventes
    const { data: ventesEtab } = await supabase
      .from('ventes')
      .select('id')
      .eq('etablissement_id', etabId)
      .gte('created_at', il7j)

    const ventesIds = new Set(ventesEtab?.map(v => v.id) || [])
    const { data: itemsFiltres } = await supabase
      .from('vente_items')
      .select('nom_article, quantite, vente_id')
      .in('vente_id', [...ventesIds].slice(0, 1000))

    const parArticle = {}
    itemsFiltres?.forEach(i => {
      const k = i.nom_article
      if (!parArticle[k]) parArticle[k] = { nom: k, quantite: 0 }
      parArticle[k].quantite += i.quantite
    })

    const classement = Object.values(parArticle).sort((a, b) => b.quantite - a.quantite)
    setTopArticles(classement.slice(0, 5))
    setFlopArticles(classement.slice(-5).reverse())

    setLoading(false)
  }

  const f = (n) => parseInt(n).toLocaleString('fr-FR') + ' F'

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>Chargement du tableau de bord...</div>

  return (
    <>
      {/* Stats principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'CA aujourd\'hui', value: f(stats.ca), icon: 'Card', color: 'var(--accent)' },
          { label: 'Bénéfice du jour', value: f(stats.benefice), icon: 'TrendingUp', color: '#16A34A' },
          { label: 'Ventes du jour', value: stats.ventes, icon: 'FilePlus', color: 'var(--text)' },
          { label: 'Stock total', value: `${stats.stockTotal} unités`, icon: 'Database', color: 'var(--text)' },
        ].map((s) => {
          const IconComp = Icon[s.icon]
          return (
            <div key={s.label} className="panel" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent-pale)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp style={{ width: 13, height: 13 }} />
                </div>
              </div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Alertes stock */}
      {(stats.ruptures > 0 || stats.stockFaible > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {stats.ruptures > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>⛔ Ruptures de stock ({stats.ruptures})</div>
              {rupturesArticles.map((a) => (
                <div key={a.id} style={{ fontSize: 12, color: '#DC2626', marginBottom: 3 }}>• {a.nom}</div>
              ))}
              {stats.ruptures > 5 && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>+ {stats.ruptures - 5} autre(s)</div>}
            </div>
          )}
          {stats.stockFaible > 0 && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706', marginBottom: 6 }}>⚠️ Stock faible ({stats.stockFaible})</div>
              <div style={{ fontSize: 12, color: '#D97706' }}>Réapprovisionnement recommandé.</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 14 }}>
        {/* Graphique ventes du jour */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-head"><h2>CA par heure — aujourd'hui</h2></div>
          {ventesJour.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 12 }}>Aucune vente aujourd'hui.</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ventesJour} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="heure" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`${parseInt(v).toLocaleString('fr-FR')} F`, 'CA']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 11 }} />
                <Bar dataKey="ca" fill="#1A7A50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Répartition stock */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-head"><h2>État du stock</h2></div>
          <PieChart width={200} height={180}>
            <Pie
              data={[
                { name: 'Normal', value: stats.articles - stats.ruptures - stats.stockFaible },
                { name: 'Stock faible', value: stats.stockFaible },
                { name: 'Rupture', value: stats.ruptures },
              ].filter(d => d.value > 0)}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
            >
              <Cell fill="#22A06B" />
              <Cell fill="#D97706" />
              <Cell fill="#DC2626" />
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </div>
      </div>

      {/* Top et flop articles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-head"><h2>🏆 Produits les plus vendus (7j)</h2></div>
          {topArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 12 }}>Aucune donnée disponible.</div>
          ) : topArticles.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < topArticles.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: COLORS[i] || '#6EE7B7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{a.nom}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>{a.quantite} vendus</div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-head"><h2>🐢 Produits les moins vendus (7j)</h2></div>
          {flopArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)', fontSize: 12 }}>Aucune donnée disponible.</div>
          ) : flopArticles.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < flopArticles.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{a.nom}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{a.quantite} vendus</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}