import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient.js'

const typeConfig = {
  connexion: { label: 'Connexion', color: '#1A7A50', bg: '#E8F5EE' },
  deconnexion: { label: 'Déconnexion', color: '#6B7A72', bg: '#F3F4F6' },
  modification_article: { label: 'Modification article', color: '#7C3AED', bg: '#F5F3FF' },
  changement_prix: { label: 'Changement de prix', color: '#D97706', bg: '#FFFBEB' },
  modification_stock: { label: 'Modification stock', color: '#DC2626', bg: '#FEF2F2' },
  ajout_article: { label: 'Ajout article', color: '#2563EB', bg: '#EFF6FF' },
  suppression_article: { label: 'Suppression', color: '#DC2626', bg: '#FEF2F2' },
  vente: { label: 'Vente', color: '#1A7A50', bg: '#E8F5EE' },
  entree_stock: { label: 'Entrée stock', color: '#2563EB', bg: '#EFF6FF' },
  inventaire: { label: 'Inventaire', color: '#7C3AED', bg: '#F5F3FF' },
}

export default function HistoriqueGerant() {
  const { etablissement } = useOutletContext()
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreType, setFiltreType] = useState('tous')
  const [filtreMois, setFiltreMois] = useState('')
  const [filtreUser, setFiltreUser] = useState('tous')
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (etablissement) { charger(); chargerUsers() }
  }, [etablissement])

  const charger = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('historique_gerant')
      .select('*')
      .eq('etablissement_id', etablissement.id)
      .order('created_at', { ascending: false })
      .limit(500)
    setHistorique(data || [])
    setLoading(false)
  }

  const chargerUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, nom_complet, role')
      .eq('etablissement_id', etablissement.id)
    setUsers(data || [])
  }

  const types = ['tous', ...Object.keys(typeConfig)]

  const filtres = historique.filter((h) => {
    const typeOk = filtreType === 'tous' || h.type === filtreType
    const moisOk = !filtreMois || h.created_at.startsWith(filtreMois)
    const userOk = filtreUser === 'tous' || h.user_id === filtreUser
    return typeOk && moisOk && userOk
  })

  // Grouper par date
  const groupes = {}
  filtres.forEach((h) => {
    const jour = new Date(h.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (!groupes[jour]) groupes[jour] = []
    groupes[jour].push(h)
  })

  return (
    <>
      {/* Filtres */}
      <div className="panel">
        <div className="panel-head"><h2>Historique & traçabilité</h2></div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--text)', background: 'var(--panel-2)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
          >
            <option value="tous">Tous les types</option>
            {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          <select
            value={filtreUser}
            onChange={(e) => setFiltreUser(e.target.value)}
            style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--text)', background: 'var(--panel-2)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
          >
            <option value="tous">Tous les utilisateurs</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.nom_complet} ({u.role})</option>)}
          </select>

          <input
            type="month"
            value={filtreMois}
            onChange={(e) => setFiltreMois(e.target.value)}
            style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--text)', background: 'var(--panel-2)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
          />

          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>{filtres.length} action(s)</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>Chargement...</div>
      ) : filtres.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" width="20" height="20"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M13 15h4"/></svg></div>
            <h3>Aucune action trouvée</h3>
            <p>L'historique s'enrichira au fil des actions sur la plateforme.</p>
          </div>
        </div>
      ) : (
        Object.entries(groupes).map(([jour, actions]) => (
          <div key={jour} className="panel" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'var(--accent)', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                {jour}
              </div>
              <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{actions.length} action(s)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {actions.map((h) => {
                const cfg = typeConfig[h.type] || { label: h.type, color: '#6B7A72', bg: '#F3F4F6' }
                const heure = new Date(h.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                return (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', minWidth: 60, marginTop: 1 }}>{heure}</div>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', marginTop: 1 }}>
                      {cfg.label}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.4 }}>{h.description}</div>
                      {h.user_nom && (
                        <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                          {h.user_nom}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </>
  )
}