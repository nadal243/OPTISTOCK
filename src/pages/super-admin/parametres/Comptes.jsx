import { useState, useEffect } from 'react'
import { Icon } from '../../../components/Icons.jsx'
import { supabase } from '../../../lib/supabaseClient.js'

export default function Comptes() {
  const [comptes, setComptes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCompte, setModalCompte] = useState(null)
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showMdp, setShowMdp] = useState({})

  useEffect(() => {
    chargerComptes()
  }, [])

  const chargerComptes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nom_complet, telephone, role, actif, etablissement_id, created_at')
      .order('created_at', { ascending: false })
    if (!error) setComptes(data || [])
    setLoading(false)
  }

  const ouvrirModal = (compte) => {
    setModalCompte(compte)
    setNouveauMdp('')
    setSuccess('')
    setError('')
  }

  const fermerModal = () => {
    setModalCompte(null)
    setNouveauMdp('')
  }

  const changerMotDePasse = async (e) => {
    e.preventDefault()
    if (nouveauMdp.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    setSaving(true)
    setError('')

    const { error: err } = await supabase.auth.admin.updateUserById(modalCompte.id, {
      password: nouveauMdp,
    })

    setSaving(false)

    if (err) {
      setError(`Erreur : ${err.message}`)
      return
    }

    // Enregistrer dans l'historique
    await supabase.from('historique').insert({
      type: 'modification_mdp',
      description: `Mot de passe modifié pour le compte ${modalCompte.telephone} (${modalCompte.nom_complet})`,
      cible_id: modalCompte.id,
      cible_telephone: modalCompte.telephone,
    }).catch(() => {}) // silencieux si la table n'existe pas encore

    setSuccess(`Mot de passe de ${modalCompte.nom_complet} modifié avec succès.`)
    fermerModal()
  }

  const roleLabel = (role) => {
    if (role === 'super_admin') return { label: 'Super Admin', color: '#7C3AED' }
    if (role === 'gerant') return { label: 'Gérant', color: '#1A7A50' }
    if (role === 'vendeur') return { label: 'Vendeur', color: '#D97706' }
    return { label: role, color: '#6B7280' }
  }

  return (
    <>
      {success && <div className="alert-success">✓ {success}</div>}

      <div className="panel">
        <div className="panel-head">
          <h2>Comptes & mots de passe</h2>
          <button className="btn-primary" onClick={chargerComptes}>
            <Icon.Search />
            Actualiser
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>
            Chargement des comptes...
          </div>
        ) : comptes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon.Users /></div>
            <h3>Aucun compte trouvé</h3>
            <p>Les comptes gérants et vendeurs apparaîtront ici.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Compte</th>
                <th>Rôle</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Mot de passe</th>
              </tr>
            </thead>
            <tbody>
              {comptes.map((c) => {
                const r = roleLabel(c.role)
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="name-cell">{c.nom_complet}</div>
                      <div className="type-cell">Créé le {new Date(c.created_at).toLocaleDateString('fr-FR')}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ color: r.color, background: `${r.color}1a` }}>
                        {r.label}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5 }}>{c.telephone}</td>
                    <td>
                      <span className="badge" style={{
                        color: c.actif ? '#16A34A' : '#DC2626',
                        background: c.actif ? '#F0FDF4' : '#FEF2F2'
                      }}>
                        {c.actif ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          title="Modifier le mot de passe"
                          onClick={() => ouvrirModal(c)}
                          style={{ width: 'auto', padding: '0 10px', gap: 5, fontSize: 11.5, color: 'var(--accent)', borderColor: 'var(--accent)' }}
                        >
                          <Icon.Key style={{ width: 13, height: 13 }} />
                          Modifier
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalCompte && (
        <div className="overlay" onClick={fermerModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Modifier le mot de passe</h3>
              <button className="modal-close" onClick={fermerModal}><Icon.X /></button>
            </div>

            <div style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 13px', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>COMPTE</div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{modalCompte.nom_complet}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{modalCompte.telephone}</div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={changerMotDePasse}>
              <div className="m-field">
                <label>Nouveau mot de passe</label>
                <input
                  type="text"
                  value={nouveauMdp}
                  onChange={(e) => setNouveauMdp(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                />
                <div className="hint">Le compte pourra se connecter avec ce nouveau mot de passe dès maintenant.</div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={fermerModal}>Annuler</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Modifier le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}