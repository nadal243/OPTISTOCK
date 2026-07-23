import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

const PLAN_LIMITES = {
  'Essai gratuit': 1, 'Essentiel': 2, 'Pro': 6, 'Entreprise': Infinity
}

export default function ListeVendeurs() {
  const { etablissement } = useOutletContext()
  const [vendeurs, setVendeurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState(null)
  const [success, setSuccess] = useState('')

  const limite = PLAN_LIMITES[etablissement?.plan] || 1

  useEffect(() => {
    if (etablissement) charger()
  }, [etablissement])

  const charger = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('etablissement_id', etablissement.id)
      .eq('role', 'vendeur')
      .order('created_at', { ascending: false })
    setVendeurs(data || [])
    setLoading(false)
  }

  const desactiver = async (id) => {
    await supabase.from('profiles').update({ actif: false }).eq('id', id)
    setVendeurs(v => v.map(x => x.id === id ? { ...x, actif: false } : x))
  }

  const activer = async (id) => {
    await supabase.from('profiles').update({ actif: true }).eq('id', id)
    setVendeurs(v => v.map(x => x.id === id ? { ...x, actif: true } : x))
  }

  return (
    <>
      {success && <div className="alert-success">✓ {success}</div>}

      <div className="plan-limit">
        <div className="plan-limit-text">
          Vendeurs : <strong>{vendeurs.length}</strong> / <strong>{limite === Infinity ? '∞' : limite}</strong>
          <span style={{ fontSize: 10.5, color: 'var(--muted)', marginLeft: 8 }}>Plan {etablissement?.plan}</span>
        </div>
        {limite !== Infinity && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="plan-limit-bar">
              <div className="plan-limit-fill" style={{ width: `${Math.min((vendeurs.length / limite) * 100, 100)}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Vendeurs de l'établissement</h2>
          <button className="btn-primary" onClick={charger}><Icon.Search />Actualiser</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 12 }}>Chargement...</div>
        ) : vendeurs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon.Users /></div>
            <h3>Aucun vendeur</h3>
            <p>Crée le premier vendeur depuis l'onglet "Créer un vendeur".</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vendeur</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Depuis</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendeurs.map((v) => (
                <tr key={v.id}>
                  <td className="name-cell">{v.nom_complet}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v.telephone}</td>
                  <td>
                    <span className="badge" style={{ color: v.actif ? '#16A34A' : '#DC2626', background: v.actif ? '#F0FDF4' : '#FEF2F2' }}>
                      {v.actif ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(v.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="row-actions">
                      {v.actif
                        ? <button title="Désactiver" onClick={() => desactiver(v.id)}><Icon.Power /></button>
                        : <button title="Activer" onClick={() => activer(v.id)} style={{ color: 'var(--success)' }}><Icon.Power /></button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}