import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Mensuel() {
  const { etablissement } = useOutletContext()
  const now = new Date()
  const [mois, setMois] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [data, setData] = useState([])
  const [comparaison, setComparaison] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (etablissement) charger() }, [etablissement, mois])

  const charger = async () => {
    setLoading(true)
    const [year, month] = mois.split('-')
    const debut = `${year}-${month}-01`
    const fin = new Date(parseInt(year), parseInt(month), 0).toISOString().slice(0, 10)

    // Mois en cours
    const { data: ventes } = await supabase
      .from('ventes')
      .select('montant_total, benefice_total, created_at')
      .eq('etablissement_id', etablissement.id)
      .gte('created_at', `${debut}T00:00:00`)
      .lte('created_at', `${fin}T23:59:59`)
      .order('created_at')

    // Grouper par jour
    const parJour = {}
    ventes?.forEach(v => {
      const jour = v.created_at.slice(8, 10)
      const label = `${jour}/${month}`
      if (!parJour[label]) parJour[label] = { jour: label, ca: 0, benefice: 0, ventes: 0 }
      parJour[label].ca += v.montant_total
      parJour[label].benefice += v.benefice_total
      parJour[label].ventes++
    })
    setData(Object.values(parJour))

    // Mois précédent pour comparaison
    const prevMonth = new Date(parseInt(year), parseInt(month) - 2, 1)
    const prevDebut = prevMonth.toISOString().slice(0, 7) + '-01'
    const prevFin = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).toISOString().slice(0, 10)

    const { data: ventesPrev } = await supabase
      .from('ventes')
      .select('montant_total, benefice_total')
      .eq('etablissement_id', etablissement.id)
      .gte('created_at', `${prevDebut}T00:00:00`)
      .lte('created_at', `${prevFin}T23:59:59`)

    const prevCA = ventesPrev?.reduce((s, v) => s + v.montant_total, 0) || 0
    const prevBen = ventesPrev?.reduce((s, v) => s + v.benefice_total, 0) || 0
    const currCA = ventes?.reduce((s, v) => s + v.montant_total, 0) || 0
    const currBen = ventes?.reduce((s, v) => s + v.benefice_total, 0) || 0

    setComparaison({
      currCA, currBen, prevCA, prevBen,
      diffCA: prevCA > 0 ? ((currCA - prevCA) / prevCA * 100).toFixed(1) : null,
      diffBen: prevBen > 0 ? ((currBen - prevBen) / prevBen * 100).toFixed(1) : null,
    })

    setLoading(false)
  }

  const f = (n) => parseInt(n || 0).toLocaleString('fr-FR') + ' F'

  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <h2>Bénéfices mensuels</h2>
          <input
            type="month"
            value={mois}
            onChange={(e) => setMois(e.target.value)}
            style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--text)', background: 'var(--panel-2)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        {/* Comparaison avec mois précédent */}
        {comparaison && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'CA ce mois', value: f(comparaison.currCA), diff: comparaison.diffCA },
              { label: 'CA mois précédent', value: f(comparaison.prevCA), diff: null, muted: true },
              { label: 'Bénéfice ce mois', value: f(comparaison.currBen), diff: comparaison.diffBen },
              { label: 'Bénéfice mois préc.', value: f(comparaison.prevBen), diff: null, muted: true },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10.5, color: 'var(--muted)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 700, color: s.muted ? 'var(--muted)' : 'var(--accent)' }}>{s.value}</div>
                {s.diff !== null && (
                  <div style={{ fontSize: 11, marginTop: 4, color: parseFloat(s.diff) >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                    {parseFloat(s.diff) >= 0 ? '▲' : '▼'} {Math.abs(s.diff)}% vs mois préc.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>Chargement...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" width="20" height="20"><rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M2.5 10h19"/><path d="M6 15h4"/></svg>
            </div>
            <h3>Aucune donnée ce mois</h3>
            <p>Modifiez le mois pour voir d'autres données.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="jour" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`${parseInt(v).toLocaleString('fr-FR')} F`]} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="ca" name="CA" stroke="#1A7A50" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="benefice" name="Bénéfice" stroke="#22A06B" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  )
}