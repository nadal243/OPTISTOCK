import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

export default function ListeFournisseurs() {
  const { etablissement } = useOutletContext()
  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (etablissement) charger() }, [etablissement])

  const charger = async () => {
    const { data } = await supabase.from('fournisseurs').select('*').eq('etablissement_id', etablissement.id).order('nom')
    setFournisseurs(data || [])
    setLoading(false)
  }

  return (
    <div className="panel">
      <div className="panel-head"><h2>Fournisseurs ({fournisseurs.length})</h2></div>
      {loading ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 12 }}>Chargement...</div>
        : fournisseurs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon.Users /></div>
            <h3>Aucun fournisseur</h3>
            <p>Ajoute ton premier fournisseur depuis l'onglet suivant.</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Fournisseur</th><th>Téléphone</th><th>Contact</th><th>Email</th></tr></thead>
            <tbody>
              {fournisseurs.map((f) => (
                <tr key={f.id}>
                  <td className="name-cell">{f.nom}</td>
                  <td style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{f.telephone || '-'}</td>
                  <td style={{ fontSize: 12 }}>{f.contact_personne || '-'}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{f.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  )
}