import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

export default function Categories() {
  const { etablissement } = useOutletContext()
  const [categories, setCategories] = useState([])
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => { if (etablissement) charger() }, [etablissement])

  const charger = async () => {
    const { data } = await supabase.from('categories').select('*').eq('etablissement_id', etablissement.id).order('nom')
    setCategories(data || [])
  }

  const ajouter = async (e) => {
    e.preventDefault()
    if (!nom.trim()) return
    setLoading(true)
    await supabase.from('categories').insert({ etablissement_id: etablissement.id, nom: nom.trim() })
    setNom('')
    setSuccess('Catégorie ajoutée.')
    charger()
    setLoading(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const supprimer = async (id) => {
    await supabase.from('categories').delete().eq('id', id)
    setCategories(c => c.filter(x => x.id !== id))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div className="panel">
        <div className="panel-head"><h2>Catégories ({categories.length})</h2></div>
        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon.FilePlus /></div>
            <h3>Aucune catégorie</h3>
            <p>Crée ta première catégorie ci-contre.</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Nom</th><th style={{ textAlign: 'right' }}>Action</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="name-cell">{c.nom}</td>
                  <td>
                    <div className="row-actions">
                      <button className="danger" onClick={() => supprimer(c.id)}><Icon.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Nouvelle catégorie</h2></div>
        {success && <div className="alert-success">✓ {success}</div>}
        <form onSubmit={ajouter}>
          <div className="m-field">
            <label>Nom de la catégorie</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Médicaments, Boissons..." required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            <Icon.Plus />Ajouter
          </button>
        </form>
      </div>
    </div>
  )
}