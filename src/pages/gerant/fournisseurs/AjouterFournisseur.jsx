import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

const emptyForm = { nom: '', telephone: '', adresse: '', email: '', contact_personne: '' }

export default function AjouterFournisseur() {
  const { etablissement } = useOutletContext()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('fournisseurs').insert({ etablissement_id: etablissement.id, ...form })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess('Fournisseur ajouté avec succès.')
    setForm(emptyForm)
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="panel" style={{ maxWidth: 480 }}>
      <div className="panel-head"><h2>Ajouter un fournisseur</h2></div>
      {success && <div className="alert-success">✓ {success}</div>}
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="m-field"><label>Nom du fournisseur</label>
          <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex : Diallo & Fils Import" required /></div>
        <div className="m-row">
          <div className="m-field"><label>Téléphone</label>
            <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+221 77 000 00 00" /></div>
          <div className="m-field"><label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@fournisseur.com" /></div>
        </div>
        <div className="m-field"><label>Adresse</label>
          <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} placeholder="Ex : Rue 10 Dakar" /></div>
        <div className="m-field"><label>Personne de contact</label>
          <input value={form.contact_personne} onChange={(e) => setForm({ ...form, contact_personne: e.target.value })} placeholder="Ex : M. Moussa Diallo" /></div>
        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
          <Icon.Plus />{loading ? 'Enregistrement...' : 'Ajouter le fournisseur'}
        </button>
      </form>
    </div>
  )
}