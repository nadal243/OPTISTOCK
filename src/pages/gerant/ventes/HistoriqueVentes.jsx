import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient.js'

export default function HistoriqueVentes() {
  const { etablissement } = useOutletContext()
  const [ventes, setVentes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (etablissement) charger() }, [etablissement])

  const charger = async () => {
    const { data } = await supabase
      .from('ventes')
      .select('*, profiles(nom_complet)')
      .eq('etablissement_id', etablissement.id)
      .order('created_at', { ascending: false })
      .limit(100)
    setVentes(data || [])
    setLoading(false)
  }

  return (
    <div className="panel">
      <div className="panel-head"><h2>Historique des ventes ({ventes.length})</h2></div>
      {loading ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 12 }}>Chargement...</div> : (
        <table>
          <thead><tr><th>Date</th><th>Vendeur</th><th>Total</th><th>Bénéfice</th></tr></thead>
          <tbody>
            {ventes.map((v) => (
              <tr key={v.id}>
                <td style={{ fontSize: 12 }}>{new Date(v.created_at).toLocaleString('fr-FR')}</td>
                <td>{v.profiles?.nom_complet || '-'}</td>
                <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{parseInt(v.montant_total).toLocaleString('fr-FR')} F</td>
                <td style={{ color: 'var(--success)', fontSize: 12 }}>{parseInt(v.benefice_total).toLocaleString('fr-FR')} F</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}