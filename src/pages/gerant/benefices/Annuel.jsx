import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function Annuel() {
  const { etablissement } = useOutletContext()
  const [annee, setAnnee] = useState(new Date().getFullYear())
  const [data, setData] = useState([])
  const [prevData, setPrevData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (etablissement) charger() }, [etablissement, annee])

  const charger = async () => {
    setLoading(true)

    const chargerAnnee = async (an) => {
      const { data: ventes } = await supabase
        .from('ventes')
        .select('montant_total, benefice_total, created_at')
        .eq('etablissement_id', etablissement.id)
        .gte('created_at', `${an}-01-01T00:00:00`)
        .lte('created_at', `${an}-12-31T23:59:59`)

      const parMois = Array.from({ length: 12 }, (_, i) => ({
        mois: MOIS[i], ca: 0, benefice: 0, ventes: 0
      }))

      ventes?.forEach(v => {
        const m = new Date(v.created_at).getMonth()
        parMois[m].ca += v.montant_total
        parMois[m].benefice += v.benefice_total
        parMois[m].ventes++
      })

      return parMois
    }

    const [curr, prev] = await Promise.all([chargerAnnee(annee), chargerAnnee(annee - 1)])
    setData(curr)
    setPrevData(prev)
    setLoading(false)
  }

  const totalCA = data.reduce((s, d) => s + d.ca, 0)
  const totalBen = data.reduce((s, d) => s + d.benefice, 0)
  const prevCA = prevData.reduce((s, d) => s + d.ca, 0)
  const f = (n) => parseInt(n).toLocaleString('fr-FR') + ' F'

  // Comparaison avec année précédente
  const diff = prevCA > 0 ? ((totalCA - prevCA) / prevCA * 100).toFixed(1) : null

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { label: `CA ${annee}`, value: f(totalCA), diff },
          { label: `Bénéfice ${annee}`, value: f(totalBen), diff: null, color: '#16A34A' },
          { label: `CA ${annee - 1}`, value: f(prevCA), diff: null, muted: true },
        ].map((s, i) => (
          <div key={i} className="panel" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: s.color || (s.muted ? 'var(--muted)' : 'var(--accent)') }}>{s.value}</div>
            {s.diff !== null && (
              <div style={{ fontSize: 11, marginTop: 4, color: parseFloat(s.diff) >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                {parseFloat(s.diff) >= 0 ? '▲' : '▼'} {Math.abs(s.diff)}% vs {annee - 1}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Bénéfices annuels — {annee}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => setAnnee(a => a - 1)}>◀ {annee - 1}</button>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => setAnnee(a => a + 1)} disabled={annee >= new Date().getFullYear()}>
              {annee + 1} ▶
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>Chargement...</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`${parseInt(v).toLocaleString('fr-FR')} F`]} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="ca" name="CA" fill="#1A7A50" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benefice" name="Bénéfice" fill="#22A06B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  )
}