import { useState } from 'react'
import { supabase, telephoneVersEmail } from '../lib/supabaseClient.js'

export default function ConfirmPassword({ gerant, titre, description, onConfirm, onCancel }) {
  const [mdp, setMdp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const confirmer = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: telephoneVersEmail(gerant.telephone),
      password: mdp,
    })

    setLoading(false)

    if (authError) {
      setError('Mot de passe incorrect.')
      return
    }

    onConfirm()
  }

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div className="modal-head">
          <h3>🔐 {titre || 'Confirmation requise'}</h3>
        </div>

        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 12.5, color: '#92400E', lineHeight: 1.5 }}>
          {description || 'Cette action est sensible. Confirmez avec votre mot de passe gérant.'}
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '8px 11px', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={confirmer}>
          <div className="m-field">
            <label>Votre mot de passe</label>
            <input
              type="password"
              value={mdp}
              onChange={(e) => setMdp(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onCancel}>Annuler</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Vérification...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}