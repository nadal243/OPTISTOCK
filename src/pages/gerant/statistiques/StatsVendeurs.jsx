import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

export default function StatsVendeurs() {
  const { etablissement } = useOutletContext()
  const [vendeurs, setVendeurs] = useState([])
  const [vendeurSelectionne, setVendeurSelectionne] = useState('tous')
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().slice(0, 10))
  const [dateFin, setDateFin] = useState(new Date().toISOString().slice(0, 10))
  const [stats, setStats] = useState([])
  const [detail, setDetail] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (etablissement) {
      chargerVendeurs()
      chargerStats()
    }
  }, [etablissement])

  useEffect(() => {
    if (etablissement) chargerStats()
  }, [vendeurSelectionne, dateDebut, dateFin])

  const chargerVendeurs = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, nom_complet, telephone')
      .eq('etablissement_id', etablissement.id)
      .eq('role', 'vendeur')
      .order('nom_complet')
    setVendeurs(data || [])
  }

  const chargerStats = async () => {
    setLoading(true)

    // Requête de base
    let query = supabase
      .from('ventes')
      .select('*, profiles(id, nom_complet, telephone), vente_items(*)')
      .eq('etablissement_id', etablissement.id)
      .gte('created_at', `${dateDebut}T00:00:00`)
      .lte('created_at', `${dateFin}T23:59:59`)
      .order('created_at', { ascending: false })

    if (vendeurSelectionne !== 'tous') {
      query = query.eq('vendeur_id', vendeurSelectionne)
    }

    const { data: ventes } = await query
    const ventesData = ventes || []

    // Grouper par vendeur
    const parVendeur = {}
    ventesData.forEach((v) => {
      const vid = v.vendeur_id
      const nom = v.profiles?.nom_complet || 'Inconnu'
      const tel = v.profiles?.telephone || '-'

      if (!parVendeur[vid]) {
        parVendeur[vid] = {
          id: vid,
          nom,
          telephone: tel,
          nbVentes: 0,
          totalCA: 0,
          totalBenefice: 0,
          nbArticles: 0,
          joursActifs: new Set(),
        }
      }
      parVendeur[vid].nbVentes++
      parVendeur[vid].totalCA += v.montant_total
      parVendeur[vid].totalBenefice += v.benefice_total
      parVendeur[vid].nbArticles += v.vente_items?.reduce((s, i) => s + i.quantite, 0) || 0
      parVendeur[vid].joursActifs.add(v.created_at.slice(0, 10))
    })

    const statsFinales = Object.values(parVendeur).map(s => ({
      ...s,
      joursActifs: s.joursActifs.size,
    })).sort((a, b) => b.totalCA - a.totalCA)

    setStats(statsFinales)

    // Détail par jour pour le vendeur sélectionné
    if (vendeurSelectionne !== 'tous') {
      const parJour = {}
      ventesData.forEach((v) => {
        const jour = v.created_at.slice(0, 10)
        if (!parJour[jour]) parJour[jour] = { jour, nbVentes: 0, ca: 0, benefice: 0 }
        parJour[jour].nbVentes++
        parJour[jour].ca += v.montant_total
        parJour[jour].benefice += v.benefice_total
      })
      setDetail(Object.values(parJour).sort((a, b) => b.jour.localeCompare(a.jour)))
    } else {
      setDetail([])
    }

    setLoading(false)
  }

  const f = (n) => parseInt(n).toLocaleString('fr-FR') + ' F'

  const periodeLabel = () => {
    if (dateDebut === dateFin) return "Aujourd'hui"
    return `Du ${new Date(dateDebut).toLocaleDateString('fr-FR')} au ${new Date(dateFin).toLocaleDateString('fr-FR')}`
  }

  const raccourcis = [
    {
      label: "Aujourd'hui",
      action: () => {
        const t = new Date().toISOString().slice(0, 10)
        setDateDebut(t); setDateFin(t)
      }
    },
    {
      label: 'Cette semaine',
      action: () => {
        const now = new Date()
        const lundi = new Date(now)
        lundi.setDate(now.getDate() - now.getDay() + 1)
        setDateDebut(lundi.toISOString().slice(0, 10))
        setDateFin(now.toISOString().slice(0, 10))
      }
    },
    {
      label: 'Ce mois',
      action: () => {
        const now = new Date()
        setDateDebut(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
        setDateFin(now.toISOString().slice(0, 10))
      }
    },
  ]

  return (
    <>
      {/* Filtres */}
      <div className="panel">
        <div className="panel-head"><h2>Statistiques par vendeur</h2></div>

        {/* Raccourcis période */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {raccourcis.map((r) => (
            <button
              key={r.label}
              onClick={r.action}
              className="btn-ghost"
              style={{ fontSize: 11.5, padding: '5px 12px' }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div className="m-field" style={{ marginBottom: 0 }}>
            <label>Date de début</label>
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          </div>
          <div className="m-field" style={{ marginBottom: 0 }}>
            <label>Date de fin</label>
            <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          </div>
          <div className="m-field" style={{ marginBottom: 0 }}>
            <label>Vendeur</label>
            <select value={vendeurSelectionne} onChange={(e) => setVendeurSelectionne(e.target.value)}>
              <option value="tous">Tous les vendeurs</option>
              {vendeurs.map((v) => (
                <option key={v.id} value={v.id}>{v.nom_complet}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
          📅 Période : <strong>{periodeLabel()}</strong>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>
          Chargement...
        </div>
      ) : (
        <>
          {/* Résumé total */}
          {stats.length > 0 && (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-label">Ventes totales</div>
                  <div className="stat-icon"><Icon.Card /></div>
                </div>
                <div className="stat-value">{stats.reduce((s, v) => s + v.nbVentes, 0)}</div>
                <div className="stat-delta">{periodeLabel()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-label">Chiffre d'affaires</div>
                  <div className="stat-icon"><Icon.TrendingUp /></div>
                </div>
                <div className="stat-value" style={{ fontSize: 16 }}>{f(stats.reduce((s, v) => s + v.totalCA, 0))}</div>
                <div className="stat-delta">{periodeLabel()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-label">Bénéfice total</div>
                  <div className="stat-icon"><Icon.FilePlus /></div>
                </div>
                <div className="stat-value" style={{ fontSize: 16 }}>{f(stats.reduce((s, v) => s + v.totalBenefice, 0))}</div>
                <div className="stat-delta" style={{ color: 'var(--success)' }}>Marge nette</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-label">Vendeurs actifs</div>
                  <div className="stat-icon"><Icon.Users /></div>
                </div>
                <div className="stat-value">{stats.length}</div>
                <div className="stat-delta">{periodeLabel()}</div>
              </div>
            </div>
          )}

          {/* Tableau par vendeur */}
          <div className="panel">
            <div className="panel-head">
              <h2>Performance par vendeur</h2>
            </div>

            {stats.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Icon.Users /></div>
                <h3>Aucune vente sur cette période</h3>
                <p>Modifiez la période ou le filtre vendeur pour voir les données.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Vendeur</th>
                    <th>Ventes</th>
                    <th>Articles vendus</th>
                    <th>Chiffre d'affaires</th>
                    <th>Bénéfice</th>
                    <th>Jours actifs</th>
                    <th>Moy. / vente</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((v, i) => (
                    <tr
                      key={v.id}
                      style={{ cursor: 'pointer', background: vendeurSelectionne === v.id ? 'var(--accent-pale)' : '' }}
                      onClick={() => setVendeurSelectionne(vendeurSelectionne === v.id ? 'tous' : v.id)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: 6, background: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : 'var(--accent-pale)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: i < 3 ? '#fff' : 'var(--accent)', flexShrink: 0
                          }}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="name-cell">{v.nom}</div>
                            <div className="sub-cell" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{v.telephone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>{v.nbVentes}</td>
                      <td style={{ color: 'var(--muted)' }}>{v.nbArticles} unités</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{f(v.totalCA)}</td>
                      <td style={{ color: 'var(--success)' }}>{f(v.totalBenefice)}</td>
                      <td style={{ color: 'var(--muted)' }}>{v.joursActifs} jour(s)</td>
                      <td style={{ color: 'var(--muted)' }}>{v.nbVentes > 0 ? f(v.totalCA / v.nbVentes) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Détail par jour si un vendeur est sélectionné */}
          {vendeurSelectionne !== 'tous' && detail.length > 0 && (
            <div className="panel">
              <div className="panel-head">
                <h2>
                  Détail par jour — {vendeurs.find(v => v.id === vendeurSelectionne)?.nom_complet}
                </h2>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Nombre de ventes</th>
                    <th>Chiffre d'affaires</th>
                    <th>Bénéfice</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.map((j) => (
                    <tr key={j.jour}>
                      <td style={{ fontWeight: 600 }}>
                        {new Date(j.jour).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td>{j.nbVentes} vente(s)</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{f(j.ca)}</td>
                      <td style={{ color: 'var(--success)' }}>{f(j.benefice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}