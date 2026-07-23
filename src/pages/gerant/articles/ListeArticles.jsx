import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

export default function ListeArticles() {
  const { etablissement, typeEtablissement } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (etablissement) charger()
  }, [etablissement])

  const charger = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('articles')
      .select('*, categories(nom), fournisseurs(nom)')
      .eq('etablissement_id', etablissement.id)
      .order('nom')
    setArticles(data || [])
    setLoading(false)
  }

  const supprimer = async (id) => {
    await supabase.from('articles').delete().eq('id', id)
    setArticles(a => a.filter(x => x.id !== id))
    setConfirmId(null)
    setSuccess('Article supprimé.')
    setTimeout(() => setSuccess(''), 3000)
  }

  const filtres = articles.filter(a =>
    a.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    a.reference.toLowerCase().includes(recherche.toLowerCase())
  )

  const formatEmp = (emplacement) => {
    if (!emplacement || Object.keys(emplacement).length === 0) return '-'
    return Object.values(emplacement).filter(Boolean).join(' › ')
  }

  const statutStock = (a) => {
    if (a.quantite === 0) return { label: 'Rupture', color: '#DC2626', bg: '#FEF2F2' }
    if (a.quantite <= a.seuil_alerte) return { label: 'Stock faible', color: '#D97706', bg: '#FFFBEB' }
    return { label: 'En stock', color: '#16A34A', bg: '#F0FDF4' }
  }

  return (
    <>
      {success && <div className="alert-success">✓ {success}</div>}

      <div className="panel">
        <div className="panel-head">
          <h2>Articles ({filtres.length})</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="search-box" style={{ width: 200 }}>
              <Icon.Search />
              <input
                type="text"
                placeholder="Rechercher..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={charger}><Icon.Search /></button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 12 }}>Chargement...</div>
        ) : filtres.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon.FilePlus /></div>
            <h3>Aucun article</h3>
            <p>Ajoute ton premier article depuis l'onglet "Ajouter un article".</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Catégorie</th>
                <th>Prix vente</th>
                <th>Stock</th>
                <th>Emplacement</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((a) => {
                const statut = statutStock(a)
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="name-cell">{a.nom}</div>
                      <div className="sub-cell" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{a.reference}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{a.categories?.nom || '-'}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                      {parseInt(a.prix_vente).toLocaleString('fr-FR')} F
                    </td>
                    <td>
                      <div className="name-cell">{a.quantite}</div>
                      <div className="sub-cell">min. {a.seuil_alerte}</div>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 140 }}>
                      {formatEmp(a.emplacement)}
                    </td>
                    <td>
                      <span className="badge" style={{ color: statut.color, background: statut.bg }}>
                        {statut.label}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button title="Modifier"><Icon.Edit /></button>
                        <button className="danger" title="Supprimer" onClick={() => setConfirmId(a.id)}><Icon.Trash /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {confirmId && (
        <div className="overlay" onClick={() => setConfirmId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-head">
              <h3>Supprimer l'article ?</h3>
              <button className="modal-close" onClick={() => setConfirmId(null)}><Icon.X /></button>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>
              Cette action est irréversible. L'article sera supprimé définitivement.
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmId(null)}>Annuler</button>
              <button className="btn-danger" onClick={() => supprimer(confirmId)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}