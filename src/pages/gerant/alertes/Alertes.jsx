import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

const typeConfig = {
  rupture: { label: 'Rupture de stock', color: '#DC2626', bg: '#FEF2F2', icon: '⛔' },
  stock_faible: { label: 'Stock faible', color: '#D97706', bg: '#FFFBEB', icon: '⚠️' },
  abonnement: { label: 'Abonnement', color: '#7C3AED', bg: '#F5F3FF', icon: '📋' },
  connexion: { label: 'Connexion suspecte', color: '#DC2626', bg: '#FEF2F2', icon: '🔐' },
}

export default function Alertes() {
  const { etablissement } = useOutletContext()
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreType, setFiltreType] = useState('tous')

  useEffect(() => { if (etablissement) charger() }, [etablissement])

  const charger = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('alertes')
      .select('*, articles(nom, quantite, seuil_alerte, emplacement)')
      .eq('etablissement_id', etablissement.id)
      .order('created_at', { ascending: false })
    setAlertes(data || [])
    setLoading(false)
  }

  const marquerLu = async (id) => {
    await supabase.from('alertes').update({ lu: true }).eq('id', id)
    setAlertes(prev => prev.map(a => a.id === id ? { ...a, lu: true } : a))
  }

  const marquerToutLu = async () => {
    await supabase.from('alertes').update({ lu: true }).eq('etablissement_id', etablissement.id)
    setAlertes(prev => prev.map(a => ({ ...a, lu: true })))
  }

  const supprimer = async (id) => {
    await supabase.from('alertes').delete().eq('id', id)
    setAlertes(prev => prev.filter(a => a.id !== id))
  }

  const filtres = alertes.filter(a => filtreType === 'tous' || a.type === filtreType)
  const nonLues = alertes.filter(a => !a.lu).length

  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <h2>
            Alertes intelligentes
            {nonLues > 0 && (
              <span style={{ marginLeft: 8, background: '#DC2626', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>
                {nonLues} non lue(s)
              </span>
            )}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {nonLues > 0 && (
              <button className="btn-ghost" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={marquerToutLu}>
                Tout marquer comme lu
              </button>
            )}
            <button className="btn-primary" onClick={charger}><Icon.Bell />Actualiser</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {['tous', ...Object.keys(typeConfig)].map((t) => (
            <button
              key={t}
              onClick={() => setFiltreType(t)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                border: `1px solid ${filtreType === t ? (typeConfig[t]?.color || 'var(--accent)') : 'var(--border)'}`,
                background: filtreType === t ? (typeConfig[t]?.bg || 'var(--accent-pale)') : 'transparent',
                color: filtreType === t ? (typeConfig[t]?.color || 'var(--accent)') : 'var(--muted)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              {t === 'tous' ? 'Toutes' : typeConfig[t]?.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>Chargement...</div>
        ) : filtres.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon.Bell /></div>
            <h3>Aucune alerte</h3>
            <p>Tout va bien ! Les alertes apparaîtront ici automatiquement.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtres.map((a) => {
              const cfg = typeConfig[a.type] || { label: a.type, color: '#6B7A72', bg: '#F3F4F6', icon: '📢' }
              return (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                    borderRadius: 10, background: a.lu ? 'var(--panel-2)' : cfg.bg,
                    border: `1px solid ${a.lu ? 'var(--border)' : cfg.color + '40'}`,
                    opacity: a.lu ? 0.7 : 1,
                  }}
                >
                  <span style={{ fontSize: 18, marginTop: 1 }}>{cfg.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '1px 7px', borderRadius: 10, border: `1px solid ${cfg.color}40` }}>
                        {cfg.label}
                      </span>
                      {!a.lu && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#DC2626', flexShrink: 0 }}></span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text)', marginBottom: 4 }}>{a.message}</div>

                    {/* Infos article si disponible */}
                    {a.articles && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', background: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '4px 8px', display: 'inline-flex', gap: 12 }}>
                        <span>Stock actuel : <strong>{a.articles.quantite}</strong></span>
                        <span>Seuil : <strong>{a.articles.seuil_alerte}</strong></span>
                        {a.articles.emplacement && Object.keys(a.articles.emplacement).length > 0 && (
                          <span>📍 {Object.values(a.articles.emplacement).filter(Boolean).join(' › ')}</span>
                        )}
                      </div>
                    )}

                    <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                      {new Date(a.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!a.lu && (
                      <button
                        onClick={() => marquerLu(a.id)}
                        style={{ padding: '4px 9px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', fontSize: 11, color: '#16A34A', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                      >
                        Marquer lu
                      </button>
                    )}
                    <button
                      onClick={() => supprimer(a.id)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon.X style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}