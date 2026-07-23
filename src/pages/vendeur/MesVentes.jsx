import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../components/Icons.jsx'
import { supabase } from '../../lib/supabaseClient.js'

export default function MesVentes() {
  const { vendeur, etablissement } = useOutletContext()
  const [ventes, setVentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 10))
  const [detail, setDetail] = useState(null)

  useEffect(() => { if (vendeur) charger() }, [vendeur, periode])

  const charger = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('ventes')
      .select('*, vente_items(*)')
      .eq('vendeur_id', vendeur.id)
      .gte('created_at', `${periode}T00:00:00`)
      .lte('created_at', `${periode}T23:59:59`)
      .order('created_at', { ascending: false })
    setVentes(data || [])
    setLoading(false)
  }

  const totalCA = ventes.reduce((s, v) => s + v.montant_total, 0)
  const totalBenefice = ventes.reduce((s, v) => s + v.benefice_total, 0)
  const f = (n) => parseInt(n).toLocaleString('fr-FR') + ' F'

  return (
    <>
      {/* Stats du jour */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Ventes', value: ventes.length, icon: 'Card', delta: 'Ce jour' },
          { label: 'Chiffre d\'affaires', value: f(totalCA), icon: 'TrendingUp', delta: 'Ce jour' },
          { label: 'Articles vendus', value: ventes.reduce((s, v) => s + (v.vente_items?.reduce((ss, i) => ss + i.quantite, 0) || 0), 0), icon: 'FilePlus', delta: 'Ce jour' },
        ].map((s) => {
          const IconComp = Icon[s.icon]
          return (
            <div key={s.label} className="panel" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent-pale)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp style={{ width: 13, height: 13 }} />
                </div>
              </div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 10.5, color: 'var(--success)', marginTop: 3 }}>{s.delta}</div>
            </div>
          )
        })}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Mes ventes</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="date"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--text)', background: 'var(--panel-2)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />
            <button className="btn-ghost" style={{ fontSize: 11.5, padding: '6px 12px' }} onClick={() => setPeriode(new Date().toISOString().slice(0, 10))}>
              Aujourd'hui
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 12 }}>Chargement...</div>
        ) : ventes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon.Card /></div>
            <h3>Aucune vente ce jour</h3>
            <p>Les ventes enregistrées apparaîtront ici.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Heure</th>
                <th>Articles</th>
                <th>Total</th>
                <th style={{ textAlign: 'right' }}>Détail</th>
              </tr>
            </thead>
            <tbody>
              {ventes.map((v) => (
                <tr key={v.id} style={{ cursor: 'pointer', background: detail?.id === v.id ? 'var(--accent-pale)' : '' }}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                    {new Date(v.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                    {v.vente_items?.length || 0} article(s) · {v.vente_items?.reduce((s, i) => s + i.quantite, 0) || 0} unité(s)
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{f(v.montant_total)}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setDetail(detail?.id === v.id ? null : v)}>
                        {detail?.id === v.id ? 'Fermer' : 'Voir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Ticket de vente détaillé */}
      {detail && (
        <div className="panel">
          <div className="panel-head">
            <h2>Ticket — {new Date(detail.created_at).toLocaleString('fr-FR')}</h2>
            <button className="modal-close" onClick={() => setDetail(null)}><Icon.X /></button>
          </div>
          <table>
            <thead><tr><th>Article</th><th>Qté</th><th>Prix unitaire</th><th>Total</th></tr></thead>
            <tbody>
              {detail.vente_items?.map((item, i) => (
                <tr key={i}>
                  <td className="name-cell">{item.nom_article}</td>
                  <td>{item.quantite}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{f(item.prix_vente)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{f(item.prix_vente * item.quantite)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', marginTop: 12, fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
            Total : {f(detail.montant_total)}
          </div>
        </div>
      )}
    </>
  )
}