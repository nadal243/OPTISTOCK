import { useState, useEffect } from 'react'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

// Historique simulé en mémoire (sera remplacé par Supabase quand la table sera créée)
const historiqueLocal = [
  {
    id: 1,
    type: 'connexion',
    description: 'Connexion réussie — Super Admin OptiStock',
    cible_telephone: '0831511015',
    created_at: new Date().toISOString(),
  },
]

export default function Historique() {
  const [historique, setHistorique] = useState(historiqueLocal)
  const [loading, setLoading] = useState(true)
  const [filtreType, setFiltreType] = useState('tous')
  const [filtreMois, setFiltreMois] = useState('')

  useEffect(() => {
    chargerHistorique()
  }, [])

  const chargerHistorique = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('historique')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!error && data) {
        setHistorique([...data, ...historiqueLocal])
      }
    } catch {
      // Table pas encore créée — on garde les données locales
    }
    setLoading(false)
  }

  const typeConfig = {
    connexion: { label: 'Connexion', color: '#1A7A50', bg: '#E8F5EE' },
    modification_mdp: { label: 'Mot de passe', color: '#D97706', bg: '#FEF3C7' },
    creation_etablissement: { label: 'Création', color: '#2563EB', bg: '#EFF6FF' },
    suppression: { label: 'Suppression', color: '#DC2626', bg: '#FEF2F2' },
    modification: { label: 'Modification', color: '#7C3AED', bg: '#F5F3FF' },
    tous: { label: 'Tous', color: '#6B7280', bg: '#F3F4F6' },
  }

  const types = ['tous', 'connexion', 'modification_mdp', 'creation_etablissement', 'suppression', 'modification']

  const filtres = historique.filter((h) => {
    const typeOk = filtreType === 'tous' || h.type === filtreType
    const moisOk = !filtreMois || h.created_at.startsWith(filtreMois)
    return typeOk && moisOk
  })

  // Grouper par date
  const groupes = {}
  filtres.forEach((h) => {
    const d = new Date(h.created_at)
    const annee = d.getFullYear()
    const mois = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const jour = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

    if (!groupes[annee]) groupes[annee] = {}
    if (!groupes[annee][mois]) groupes[annee][mois] = {}
    if (!groupes[annee][mois][jour]) groupes[annee][mois][jour] = []
    groupes[annee][mois][jour].push(h)
  })

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Historique des actions</h2>
        <button className="btn-primary" onClick={chargerHistorique}>
          <Icon.Search />Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {types.map((t) => {
          const cfg = typeConfig[t] || typeConfig.tous
          return (
            <button
              key={t}
              onClick={() => setFiltreType(t)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                border: `1px solid ${filtreType === t ? cfg.color : 'var(--border)'}`,
                background: filtreType === t ? cfg.bg : 'transparent',
                color: filtreType === t ? cfg.color : 'var(--muted)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              {typeConfig[t]?.label || t}
            </button>
          )
        })}
        <input
          type="month"
          value={filtreMois}
          onChange={(e) => setFiltreMois(e.target.value)}
          style={{
            border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px',
            fontSize: 12, color: 'var(--text)', background: 'var(--panel-2)', outline: 'none',
            fontFamily: 'Inter, sans-serif', marginLeft: 'auto',
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>
          Chargement...
        </div>
      ) : filtres.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Icon.Terminal /></div>
          <h3>Aucune action trouvée</h3>
          <p>L'historique s'enrichira au fil des actions effectuées sur la plateforme.</p>
        </div>
      ) : (
        Object.entries(groupes).map(([annee, moisObj]) => (
          <div key={annee}>
            {/* Année */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 10px',
            }}>
              <div style={{
                background: 'var(--accent)', color: '#fff', borderRadius: 6,
                padding: '2px 10px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
              }}>
                {annee}
              </div>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
            </div>

            {Object.entries(moisObj).map(([mois, joursObj]) => (
              <div key={mois} style={{ marginBottom: 12 }}>
                {/* Mois */}
                <div style={{
                  fontSize: 11, color: 'var(--muted)', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '.06em',
                  fontFamily: 'JetBrains Mono, monospace', marginBottom: 8,
                }}>
                  {mois}
                </div>

                {Object.entries(joursObj).map(([jour, actions]) => (
                  <div key={jour} style={{ marginBottom: 10 }}>
                    {/* Jour */}
                    <div style={{
                      fontSize: 11.5, color: 'var(--text)', fontWeight: 600,
                      marginBottom: 6, paddingLeft: 4,
                    }}>
                      {jour}
                    </div>

                    {/* Actions du jour */}
                    {actions.map((h, i) => {
                      const cfg = typeConfig[h.type] || typeConfig.tous
                      const heure = new Date(h.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '8px 10px', borderRadius: 8, background: 'var(--panel-2)',
                          border: '1px solid var(--border)', marginBottom: 5,
                        }}>
                          {/* Heure */}
                          <div style={{
                            fontSize: 10.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace',
                            whiteSpace: 'nowrap', marginTop: 2, minWidth: 58,
                          }}>
                            {heure}
                          </div>

                          {/* Badge type */}
                          <span style={{
                            padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                            background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', marginTop: 1,
                          }}>
                            {cfg.label}
                          </span>

                          {/* Description */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.4 }}>
                              {h.description}
                            </div>
                            {h.cible_telephone && (
                              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                                {h.cible_telephone}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}