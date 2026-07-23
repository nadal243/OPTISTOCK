import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'
import { logAction } from '../../../lib/historique.js'
import ConfirmPassword from '../../../components/ConfirmPassword.jsx'

export default function Inventaire() {
  const { etablissement, gerant } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [comptages, setComptages] = useState({})
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [success, setSuccess] = useState('')
  const [etape, setEtape] = useState('saisie') // saisie | validation

  useEffect(() => {
    if (etablissement) charger()
  }, [etablissement])

  const charger = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('articles')
      .select('*, categories(nom)')
      .eq('etablissement_id', etablissement.id)
      .order('nom')
    setArticles(data || [])
    const init = {}
    data?.forEach(a => { init[a.id] = '' })
    setComptages(init)
    setLoading(false)
  }

  const differences = articles.filter(a =>
    comptages[a.id] !== '' &&
    parseInt(comptages[a.id]) !== a.quantite
  )

  const validerInventaire = async () => {
    setConfirm(false)
    setValidating(true)

    for (const art of differences) {
      const nouvQte = parseInt(comptages[art.id])
      const diff = nouvQte - art.quantite
      const type = diff >= 0 ? 'inventaire' : 'correction'

      await supabase.from('articles').update({ quantite: nouvQte, updated_at: new Date() }).eq('id', art.id)
      await supabase.from('stock_mouvements').insert({
        etablissement_id: etablissement.id,
        article_id: art.id,
        nom_article: art.nom,
        type,
        quantite: Math.abs(diff),
        quantite_avant: art.quantite,
        quantite_apres: nouvQte,
        note: `Inventaire du ${new Date().toLocaleDateString('fr-FR')}`,
        user_id: gerant.id,
      })

      await logAction({
        etablissement_id: etablissement.id,
        user_id: gerant.id,
        user_nom: gerant.nom_complet,
        type: 'inventaire',
        description: `Inventaire : "${art.nom}" ${art.quantite} → ${nouvQte} (${diff >= 0 ? '+' : ''}${diff})`,
        meta: { article_id: art.id, ancien: art.quantite, nouveau: nouvQte, difference: diff },
      })
    }

    setSuccess(`Inventaire validé — ${differences.length} article(s) mis à jour.`)
    setValidating(false)
    setEtape('saisie')
    charger()
    setTimeout(() => setSuccess(''), 5000)
  }

  const formatEmp = (emp) => {
    if (!emp || Object.keys(emp).length === 0) return '-'
    return Object.values(emp).filter(Boolean).join(' › ')
  }

  return (
    <>
      {success && <div className="alert-success">✓ {success}</div>}

      {/* En-tête */}
      <div className="panel">
        <div className="panel-head">
          <h2>Inventaire physique</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={charger}>
              <Icon.Search />Actualiser
            </button>
            {differences.length > 0 && (
              <button className="btn-primary" onClick={() => setEtape('validation')}>
                <Icon.FilePlus />Valider l'inventaire ({differences.length} diff.)
              </button>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--accent-pale)', border: '1px solid rgba(26,122,80,.2)', borderRadius: 8, padding: '10px 13px', fontSize: 12.5, color: 'var(--text)', lineHeight: 1.5 }}>
          📋 Saisissez la quantité réelle comptée pour chaque article. Les différences seront enregistrées et tracées. Laissez vide pour ignorer un article.
        </div>
      </div>

      {/* Tableau inventaire */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>Chargement...</div>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Emplacement</th>
                <th>Stock système</th>
                <th>Qté comptée</th>
                <th>Différence</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => {
                const comptee = comptages[a.id]
                const diff = comptee !== '' ? parseInt(comptee) - a.quantite : null
                return (
                  <tr key={a.id} style={{ background: diff !== null && diff !== 0 ? (diff > 0 ? '#F0FDF4' : '#FEF2F2') : '' }}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{a.nom}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{a.reference}</div>
                      {a.categories?.nom && <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{a.categories.nom}</div>}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--muted)' }}>📍 {formatEmp(a.emplacement)}</td>
                    <td style={{ fontWeight: 700, textAlign: 'center', fontSize: 14 }}>{a.quantite}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={comptages[a.id]}
                        onChange={(e) => setComptages({ ...comptages, [a.id]: e.target.value })}
                        placeholder="-"
                        style={{
                          width: 80, border: '1.5px solid', borderColor: diff !== null && diff !== 0 ? (diff > 0 ? '#16A34A' : '#DC2626') : 'var(--border)',
                          borderRadius: 7, padding: '6px 8px', fontSize: 13, fontWeight: 700, textAlign: 'center',
                          outline: 'none', background: 'var(--panel-2)', color: 'var(--text)', fontFamily: 'Inter, sans-serif',
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {diff !== null && (
                        <span style={{
                          fontWeight: 700, fontSize: 13,
                          color: diff === 0 ? '#16A34A' : diff > 0 ? '#2563EB' : '#DC2626',
                        }}>
                          {diff > 0 ? `+${diff}` : diff === 0 ? '✓' : diff}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal résumé avant validation */}
      {etape === 'validation' && (
        <div className="overlay" onClick={() => setEtape('saisie')}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <h3>Résumé de l'inventaire</h3>
              <button className="modal-close" onClick={() => setEtape('saisie')}><Icon.X /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
                {differences.length} article(s) avec des différences :
              </div>
              <table>
                <thead><tr><th>Article</th><th>Avant</th><th>Après</th><th>Diff.</th></tr></thead>
                <tbody>
                  {differences.map((a) => {
                    const nouvQte = parseInt(comptages[a.id])
                    const diff = nouvQte - a.quantite
                    return (
                      <tr key={a.id}>
                        <td style={{ fontSize: 12, fontWeight: 600 }}>{a.nom}</td>
                        <td style={{ textAlign: 'center', fontSize: 12 }}>{a.quantite}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>{nouvQte}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 12, color: diff > 0 ? '#2563EB' : '#DC2626' }}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="alert-warning" style={{ marginBottom: 14 }}>
              ⚠️ Cette action est irréversible et sera tracée dans l'historique. Votre mot de passe est requis.
            </div>

            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setEtape('saisie')}>Annuler</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setConfirm(true)}>
                Confirmer l'inventaire
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmPassword
          gerant={gerant}
          titre="Valider l'inventaire"
          description="L'inventaire modifiera le stock de plusieurs articles. Confirmez avec votre mot de passe gérant."
          onConfirm={validerInventaire}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  )
}