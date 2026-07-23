import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function Hebdomadaire() {
  const { etablissement } = useOutletContext()
  const [semaine, setSemaine] = useState(0) // 0 = cette semaine, -1 = semaine précédente
  const [data, setData] = useState([])
  const [prevData, setPrevData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (etablissement) charger() }, [etablissement, semaine])

  const getDebut = (offset) => {
    const now = new Date()
    const lundi = new Date(now)
    lundi.setDate(now.getDate() - now.getDay() + 1 + offset * 7)
    lundi.setHours(0, 0, 0, 0)
    return lundi
  }

  const charger = async () => {
    setLoading(true)

    const chargerSemaine = async (offset) => {
      const debut = getDebut(offset)
      const fin = new Date(debut)
      fin.setDate(fin.getDate() + 6)
      fin.setHours(23, 59, 59)

      const { data: ventes } = await supabase
        .from('ventes')
        .select('montant_total, benefice_total, created_at')
        .eq('etablissement_id', etablissement.id)
        .gte('created_at', debut.toISOString())
        .lte('created_at', fin.toISOString())

      const parJour = Array.from({ length: 7 }, (_, i) => ({ jour: JOURS[i], ca: 0, benefice: 0 }))
      ventes?.forEach(v => {
        const j = new Date(v.created_at).getDay()
        const idx = j === 0 ? 6 : j - 1
        parJour[idx].ca += v.montant_total
        parJour[idx].benefice += v.benefice_total
      })
      return parJour
    }

    const [curr, prev] = await Promise.all([chargerSemaine(semaine), chargerSemaine(semaine - 1)])
    setData(curr)
    setPrevData(prev)
    setLoading(false)
  }

  const totalCA = data.reduce((s, d) => s + d.ca, 0)
  const prevCA = prevData.reduce((s, d) => s + d.ca, 0)
  const diff = prevCA > 0 ? ((totalCA - prevCA) / prevCA * 100).toFixed(1) : null
  const f = (n) => parseInt(n).toLocaleString('fr-FR') + ' F'

  const debutLabel = getDebut(semaine).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  const finLabel = new Date(getDebut(semaine).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        <div className="panel" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>CA cette semaine</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{f(totalCA)}</div>
          {diff !== null && (
            <div style={{ fontSize: 11, marginTop: 4, color: parseFloat(diff) >= 0 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
              {parseFloat(diff) >= 0 ? '▲' : '▼'} {Math.abs(diff)}% vs semaine préc.
            </div>
          )}
        </div>
        <div className="panel" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Bénéfice cette semaine</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#16A34A' }}>{f(data.reduce((s, d) => s + d.benefice, 0))}</div>
        </div>
        <div className="panel" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>CA semaine précédente</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--muted)' }}>{f(prevCA)}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>{debutLabel} – {finLabel}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => setSemaine(s => s - 1)}>◀ Précédente</button>
            <button className="btn-ghost" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => setSemaine(s => s + 1)} disabled={semaine >= 0}>Suivante ▶</button>
            {semaine !== 0 && <button className="btn-primary" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => setSemaine(0)}>Cette semaine</button>}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)' }}>Chargement...</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="jour" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
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