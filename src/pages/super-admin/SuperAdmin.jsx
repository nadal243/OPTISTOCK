import { useState } from 'react'
import logo from '../../assets/logo.png'

/* ================= ICÔNES SVG ================= */
const Icon = {
  Building: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 21V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v15"/><path d="M14 9h5a1 1 0 0 1 1 1v11"/><path d="M8 8v.01M8 12v.01M8 16v.01M11 8v.01M11 12v.01M11 16v.01"/><path d="M4 21h16"/></svg>),
  Card: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M2.5 10h19"/><path d="M6 15h4"/></svg>),
  Settings: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.9 7.9 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.9 7.9 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.9 7.9 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.9 7.9 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9c.76.65 1.65 1.16 2.6 1.5l.5 2.5h4l.5-2.5a7.9 7.9 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.5Z"/></svg>),
  Search: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>),
  Bell: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 14 18 8Z"/><path d="M10.5 19a1.7 1.7 0 0 0 3 0"/></svg>),
  Edit: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>),
  Power: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2v9"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/></svg>),
  Trash: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7h16"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/><path d="M6 7l1 13.2A2 2 0 0 0 9 22h6a2 2 0 0 0 2-1.8L18 7"/><path d="M10 11v6M14 11v6"/></svg>),
  Plus: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>),
  X: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>),
  Key: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="15" r="4.5"/><path d="M11.5 11.5 20 3M16.5 7.5 19 5M19 5l2 2"/></svg>),
  Headset: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 13a9 9 0 0 1 18 0"/><path d="M21 13v4a2 2 0 0 1-2 2h-1"/><rect x="3" y="13" width="4" height="6" rx="1.3"/><rect x="17" y="13" width="4" height="6" rx="1.3"/></svg>),
  Terminal: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M13 15h4"/></svg>),
  Database: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/><path d="M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>),
  Wrench: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14.7 6.3a4 4 0 0 0-5.4 4.9L3 17.5V21h3.5l6.3-6.3a4 4 0 0 0 4.9-5.4l-2.6 2.6-2.4-2.4Z"/></svg>),
  Logout: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>),
  Inbox: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.4 5.3 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.7A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.3Z"/></svg>),
  Gift: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M3 9h18M12 9v12"/><path d="M12 9c-2.5 0-4-1.4-4-3.2S9 3 10.5 3 12 5 12 6.5M12 9c2.5 0 4-1.4 4-3.2S15 3 13.5 3 12 5 12 6.5"/></svg>),
  Clock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>),
  FilePlus: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6"/><path d="M12 12v6M9 15h6"/></svg>),
  FileEdit: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8"/><path d="M14 2v6h6"/><path d="m20.4 13.5-4.9 4.9-2.6.7.7-2.6 4.9-4.9a1.4 1.4 0 0 1 2 0l-.1-.1a1.4 1.4 0 0 1 0 2Z"/></svg>),
  FileMinus: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6"/><path d="M9 15h6"/></svg>),
  ToggleLeft: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="1" y="6" width="22" height="12" rx="6"/><circle cx="8" cy="12" r="3.2"/></svg>),
}

const emptyForm = { nom: '', type: 'Boutique', emailGerant: '', telephone: '', dateFin: '' }
const TYPES = ['Boutique', 'Pharmacie', 'Alimentation', 'Mini-supermarché', 'Dépôt', 'Magasin', 'Entrepôt']

/* Les 4 capacités de "Gestion d'établissement" énumérées dans le cahier des charges */
const capacitesEtablissement = [
  { icon: 'FilePlus', titre: 'Création des établissements', desc: "Enregistrer un nouvel établissement et son compte gérant.", action: 'add' },
  { icon: 'FileEdit', titre: "Modification des informations", desc: "Mettre à jour le nom, le type ou les coordonnées d'un établissement.", action: 'edit' },
  { icon: 'FileMinus', titre: "Suppression d'un établissement", desc: "Retirer définitivement un établissement de la plateforme.", action: 'delete' },
  { icon: 'ToggleLeft', titre: 'Activation / désactivation', desc: "Suspendre ou réactiver l'accès d'un compte établissement.", action: 'toggle' },
]

const parametresData = [
  { icon: 'Key', titre: 'Réinitialisation des mots de passe', desc: "Générer un nouveau mot de passe pour un compte gérant." },
  { icon: 'Headset', titre: 'Assistance technique', desc: "Accéder aux demandes de support des établissements." },
  { icon: 'Terminal', titre: 'Consultation des journaux système', desc: "Historique des actions, connexions et erreurs." },
  { icon: 'Database', titre: 'Sauvegarde et restauration', desc: "Gérer les sauvegardes automatiques des données." },
  { icon: 'Wrench', titre: 'Maintenance de la plateforme', desc: "Activer le mode maintenance et planifier les mises à jour." },
]

const statutColor = { Actif: '#2FA36B', Suspendu: '#D9A441', Désactivé: '#C24B3F' }

function joursRestants(dateFin) {
  if (!dateFin) return null
  return Math.ceil((new Date(dateFin) - new Date()) / (1000 * 60 * 60 * 24))
}

function expirationBadge(dateFin) {
  const jours = joursRestants(dateFin)
  if (jours === null) return { label: 'Non définie', color: '#75897F' }
  if (jours < 0) return { label: 'Expiré', color: '#C24B3F' }
  if (jours <= 7) return { label: `Expire dans ${jours} j`, color: '#D9A441' }
  return { label: `Expire le ${new Date(dateFin).toLocaleDateString('fr-FR')}`, color: '#2FA36B' }
}

export default function SuperAdmin() {
  const [tab, setTab] = useState('etablissements')
  const [etablissements, setEtablissements] = useState([])
  const [plans, setPlans] = useState([
    { id: 1, nom: 'Essentiel', prix: '9 000 F / mois', vendeurs: 2, essaiGratuit: true },
    { id: 2, nom: 'Pro', prix: '19 000 F / mois', vendeurs: 6, essaiGratuit: true },
    { id: 3, nom: 'Entreprise', prix: '39 000 F / mois', vendeurs: 'Illimité', essaiGratuit: false },
  ])

  const [modal, setModal] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const navItems = [
    { key: 'etablissements', label: "Gestion d'établissement", icon: 'Building' },
    { key: 'abonnements', label: "Gestion d'abonnement", icon: 'Card' },
    { key: 'parametres', label: 'Paramètres', icon: 'Settings' },
  ]

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModal('etab') }
  const openEdit = (etab) => { setForm(etab); setEditingId(etab.id); setModal('etab') }
  const closeModal = () => { setModal(null); setEditingId(null) }

  const submitEtab = (e) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    if (editingId) {
      setEtablissements((list) => list.map((it) => (it.id === editingId ? { ...it, ...form } : it)))
    } else {
      const dateFinDefaut = new Date()
      dateFinDefaut.setDate(dateFinDefaut.getDate() + 30)
      setEtablissements((list) => [
        ...list,
        {
          id: Date.now(),
          ...form,
          dateFin: form.dateFin || dateFinDefaut.toISOString().slice(0, 10),
          statut: 'Actif',
          abonnement: 'Essai gratuit',
          date: new Date().toLocaleDateString('fr-FR'),
        },
      ])
    }
    closeModal()
  }

  const toggleStatut = (id) => {
    setEtablissements((list) =>
      list.map((it) => (it.id === id ? { ...it, statut: it.statut === 'Actif' ? 'Désactivé' : 'Actif' } : it))
    )
  }

  const deleteEtab = (id) => {
    setEtablissements((list) => list.filter((it) => it.id !== id))
    setConfirmDeleteId(null)
  }

  const setAbonnementStatut = (id, statut) => {
    setEtablissements((list) => list.map((it) => (it.id === id ? { ...it, statut } : it)))
  }

  /* Actions déclenchées depuis les cartes de capacités */
  const handleCapacite = (action) => {
    if (action === 'add') return openAdd()
    if (etablissements.length === 0) return openAdd()
    if (action === 'edit') return openEdit(etablissements[0])
    if (action === 'delete') return setConfirmDeleteId(etablissements[0].id)
    if (action === 'toggle') return toggleStatut(etablissements[0].id)
  }

  return (
    <div className="sa">
      <style>{`
        :root {
          --bg: #07110C;
          --bg-2: #0A1811;
          --panel: #0F1E16;
          --panel-2: #0B1710;
          --accent: #146C43;
          --accent-light: #1F9D63;
          --text: #EDF3EF;
          --muted: #75897F;
          --border: #1C2E23;
          --danger: #C24B3F;
          --warning: #D9A441;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sa { display: flex; min-height: 100vh; background: var(--bg); font-family: 'Inter', sans-serif; color: var(--text); }

        .sidebar { width: 240px; flex-shrink: 0; background: var(--bg-2); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 22px 16px; }
        .sa-brand { display: flex; align-items: center; gap: 10px; padding: 0 8px 26px; }
        .sa-brand img { width: 30px; height: 30px; }
        .sa-brand span { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; }
        .sa-brand b { color: var(--accent-light); font-weight: 700; }
        .sa-tag { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); padding: 0 8px 18px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px; color: var(--muted); cursor: pointer; font-size: 13.5px; font-weight: 500; margin-bottom: 4px; border: none; background: transparent; width: 100%; text-align: left; transition: background .15s, color .15s; }
        .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
        .nav-item:hover { background: rgba(20,108,67,.14); color: var(--text); }
        .nav-item.active { background: var(--accent); color: #fff; }
        .sidebar-footer { margin-top: auto; }
        .logout-btn { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 13px; background: transparent; border: none; cursor: pointer; padding: 10px 12px; width: 100%; border-radius: 10px; }
        .logout-btn:hover { color: var(--danger); background: rgba(194,75,63,.1); }
        .logout-btn svg { width: 17px; height: 17px; }

        .main { flex: 1; padding: 26px 34px; overflow-x: hidden; }
        .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 26px; flex-wrap: wrap; gap: 14px; }
        .topbar h1 { font-family: 'Space Grotesk', sans-serif; font-size: 21px; font-weight: 600; }
        .topbar p { font-size: 12.5px; color: var(--muted); margin-top: 3px; }
        .topbar-actions { display: flex; align-items: center; gap: 14px; }
        .search-box { display: flex; align-items: center; gap: 8px; background: var(--panel); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; width: 220px; }
        .search-box svg { width: 15px; height: 15px; color: var(--muted); }
        .search-box input { background: transparent; border: none; outline: none; color: var(--text); font-size: 13px; width: 100%; }
        .icon-btn { width: 38px; height: 38px; border-radius: 10px; background: var(--panel); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--muted); cursor: pointer; position: relative; }
        .icon-btn svg { width: 17px; height: 17px; }
        .dot { position: absolute; top: 7px; right: 7px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-light); }
        .avatar { width: 38px; height: 38px; border-radius: 10px; background: var(--accent); display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: var(--panel); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
        .stat-card .label { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
        .stat-card .value { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; }
        .stat-card .delta { font-size: 11.5px; color: var(--accent-light); margin-top: 6px; }

        .panel { background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 22px; margin-bottom: 22px; }
        .panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .panel-head h2 { font-family: 'Space Grotesk', sans-serif; font-size: 15.5px; font-weight: 600; }
        .btn-primary { display: flex; align-items: center; gap: 7px; background: var(--accent); color: #fff; border: none; padding: 9px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-primary:hover { filter: brightness(1.1); }
        .btn-primary svg { width: 15px; height: 15px; }

        /* Cartes de capacités (options énumérées) */
        .cap-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .cap-card { display: flex; flex-direction: column; gap: 12px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 14px; padding: 16px; cursor: pointer; transition: border-color .15s, transform .12s; text-align: left; }
        .cap-card:hover { border-color: var(--accent); transform: translateY(-1px); }
        .cap-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(31,157,99,.12); color: var(--accent-light); display: flex; align-items: center; justify-content: center; }
        .cap-icon svg { width: 18px; height: 18px; }
        .cap-card h4 { font-size: 13px; font-weight: 600; }
        .cap-card p { font-size: 11.5px; color: var(--muted); line-height: 1.4; }

        table { width: 100%; border-collapse: collapse; }
        thead th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 500; padding: 0 10px 10px; font-family: 'JetBrains Mono', monospace; }
        tbody tr { border-top: 1px solid var(--border); }
        tbody td { padding: 13px 10px; font-size: 13.5px; }
        .name-cell { font-weight: 600; }
        .type-cell { color: var(--muted); font-size: 12.5px; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
        .badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .row-actions { display: flex; gap: 6px; justify-content: flex-end; }
        .row-actions button { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border); background: var(--panel-2); color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .row-actions button svg { width: 14px; height: 14px; }
        .row-actions button:hover { color: var(--text); border-color: var(--accent); }
        .row-actions .danger:hover { color: var(--danger); border-color: var(--danger); }

        .empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 54px 20px; color: var(--muted); }
        .empty-state .empty-icon { width: 54px; height: 54px; border-radius: 14px; background: var(--panel-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .empty-state .empty-icon svg { width: 24px; height: 24px; color: var(--accent-light); }
        .empty-state h3 { color: var(--text); font-family: 'Space Grotesk', sans-serif; font-size: 15px; margin-bottom: 6px; }
        .empty-state p { font-size: 12.5px; max-width: 280px; margin-bottom: 18px; line-height: 1.5; }

        .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 22px; }
        .plan-card { background: var(--panel-2); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
        .plan-dot { width: 10px; height: 10px; border-radius: 50%; margin-bottom: 12px; background: var(--accent-light); }
        .plan-card h3 { font-family: 'Space Grotesk', sans-serif; font-size: 15px; margin-bottom: 4px; }
        .plan-card .price { font-size: 12.5px; color: var(--muted); margin-bottom: 14px; }
        .plan-card .meta { font-size: 12px; color: var(--muted); display: flex; justify-content: space-between; margin-top: 6px; }
        .plan-card .meta b { color: var(--text); }
        .plan-card .trial { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--accent-light); margin-top: 10px; }
        .plan-card .trial svg { width: 13px; height: 13px; }

        .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .setting-card { display: flex; gap: 14px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 14px; padding: 16px; cursor: pointer; transition: border-color .15s; }
        .setting-card:hover { border-color: var(--accent); }
        .setting-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(31,157,99,.12); color: var(--accent-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .setting-icon svg { width: 19px; height: 19px; }
        .setting-card h4 { font-size: 13.5px; font-weight: 600; margin-bottom: 4px; }
        .setting-card p { font-size: 12px; color: var(--muted); line-height: 1.4; }

        .overlay { position: fixed; inset: 0; background: rgba(4,10,7,.72); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
        .modal { width: 100%; max-width: 420px; background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
        .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .modal-head h3 { font-family: 'Space Grotesk', sans-serif; font-size: 16px; }
        .modal-close { width: 30px; height: 30px; border-radius: 8px; background: var(--panel-2); border: 1px solid var(--border); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .modal-close svg { width: 15px; height: 15px; }
        .m-field { margin-bottom: 14px; }
        .m-field label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
        .m-field input, .m-field select { width: 100%; background: var(--panel-2); border: 1.5px solid var(--border); border-radius: 9px; padding: 10px 12px; color: var(--text); font-size: 13.5px; outline: none; color-scheme: dark; }
        .m-field input:focus, .m-field select:focus { border-color: var(--accent); }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .btn-ghost { flex: 1; background: transparent; border: 1.5px solid var(--border); color: var(--muted); padding: 10px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-ghost:hover { color: var(--text); border-color: #33493D; }
        .btn-danger { background: var(--danger); color: #fff; border: none; padding: 10px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; flex: 1; }

        @media (max-width: 980px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .cap-grid { grid-template-columns: repeat(2, 1fr); }
          .plans-grid { grid-template-columns: 1fr; }
          .settings-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <aside className="sidebar">
        <div className="sa-brand">
          <img src={logo} alt="OptiStock" />
          <span>Opti<b>Stock</b></span>
        </div>
        <div className="sa-tag">Super Admin · SBS</div>

        {navItems.map((item) => {
          const IconComp = Icon[item.icon]
          return (
            <button key={item.key} className={`nav-item ${tab === item.key ? 'active' : ''}`} onClick={() => setTab(item.key)}>
              <IconComp />
              {item.label}
            </button>
          )
        })}

        <div className="sidebar-footer">
          <button className="logout-btn"><Icon.Logout />Déconnexion</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>
              {tab === 'etablissements' && "Gestion d'établissement"}
              {tab === 'abonnements' && "Gestion d'abonnement"}
              {tab === 'parametres' && 'Paramètres de la plateforme'}
            </h1>
            <p>Espace de contrôle StellarBrightSoftware.</p>
          </div>
          <div className="topbar-actions">
            <div className="search-box"><Icon.Search /><input type="text" placeholder="Rechercher..." /></div>
            <div className="icon-btn"><Icon.Bell /><span className="dot"></span></div>
            <div className="avatar">SA</div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="label">Établissements</div><div className="value">{etablissements.length}</div><div className="delta">Total enregistré</div></div>
          <div className="stat-card"><div className="label">Actifs</div><div className="value">{etablissements.filter(e => e.statut === 'Actif').length}</div><div className="delta">Comptes en service</div></div>
          <div className="stat-card"><div className="label">Désactivés</div><div className="value">{etablissements.filter(e => e.statut === 'Désactivé').length}</div><div className="delta" style={{ color: 'var(--warning)' }}>À surveiller</div></div>
          <div className="stat-card"><div className="label">Plans actifs</div><div className="value">{plans.length}</div><div className="delta">Formules disponibles</div></div>
        </div>

        {tab === 'etablissements' && (
          <>
            <div className="panel">
              <div className="panel-head"><h2>Options de gestion d'établissement</h2></div>
              <div className="cap-grid">
                {capacitesEtablissement.map((c, i) => {
                  const IconComp = Icon[c.icon]
                  return (
                    <button className="cap-card" key={i} onClick={() => handleCapacite(c.action)}>
                      <div className="cap-icon"><IconComp /></div>
                      <div>
                        <h4>{c.titre}</h4>
                        <p>{c.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Liste des établissements</h2>
                <button className="btn-primary" onClick={openAdd}><Icon.Plus />Créer un établissement</button>
              </div>

              {etablissements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Icon.Inbox /></div>
                  <h3>Aucun établissement pour le moment</h3>
                  <p>Commence par créer le premier établissement pour lui attribuer un compte gérant et un abonnement.</p>
                  <button className="btn-primary" onClick={openAdd}><Icon.Plus />Créer un établissement</button>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Établissement</th>
                      <th>Statut</th>
                      <th>Abonnement</th>
                      <th>Date de création</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etablissements.map((e) => (
                      <tr key={e.id}>
                        <td><div className="name-cell">{e.nom}</div><div className="type-cell">{e.type} · {e.emailGerant || 'sans email'}</div></td>
                        <td><span className="badge" style={{ color: statutColor[e.statut], background: `${statutColor[e.statut]}1a` }}>{e.statut}</span></td>
                        <td>{e.abonnement}</td>
                        <td>{e.date}</td>
                        <td>
                          <div className="row-actions">
                            <button title="Modifier les informations" onClick={() => openEdit(e)}><Icon.Edit /></button>
                            <button title="Activer / désactiver le compte" onClick={() => toggleStatut(e.id)}><Icon.Power /></button>
                            <button className="danger" title="Supprimer l'établissement" onClick={() => setConfirmDeleteId(e.id)}><Icon.Trash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {tab === 'abonnements' && (
          <>
            <div className="panel">
              <div className="panel-head"><h2>Formules d'abonnement</h2></div>
              <div className="plans-grid">
                {plans.map((p) => (
                  <div className="plan-card" key={p.id}>
                    <div className="plan-dot"></div>
                    <h3>{p.nom}</h3>
                    <div className="price">{p.prix}</div>
                    <div className="meta"><span>Vendeurs max</span><b>{p.vendeurs}</b></div>
                    {p.essaiGratuit && <div className="trial"><Icon.Gift />Période d'essai gratuite disponible</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head"><h2>Abonnements par établissement</h2></div>
              {etablissements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Icon.Card /></div>
                  <h3>Aucun abonnement à gérer</h3>
                  <p>Les abonnements apparaîtront ici dès qu'un établissement sera créé.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Établissement</th>
                      <th>Abonnement</th>
                      <th>Statut</th>
                      <th>Expiration</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etablissements.map((e) => {
                      const exp = expirationBadge(e.dateFin)
                      return (
                        <tr key={e.id}>
                          <td className="name-cell">{e.nom}</td>
                          <td>{e.abonnement}</td>
                          <td><span className="badge" style={{ color: statutColor[e.statut], background: `${statutColor[e.statut]}1a` }}>{e.statut}</span></td>
                          <td><span className="badge" style={{ color: exp.color, background: `${exp.color}1a` }}><Icon.Clock style={{ width: 11, height: 11 }} />{exp.label}</span></td>
                          <td>
                            <div className="row-actions">
                              {e.statut === 'Suspendu'
                                ? <button title="Réactiver l'abonnement" onClick={() => setAbonnementStatut(e.id, 'Actif')}><Icon.Power /></button>
                                : <button title="Suspendre l'abonnement" onClick={() => setAbonnementStatut(e.id, 'Suspendu')}><Icon.Power /></button>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {tab === 'parametres' && (
          <div className="panel">
            <div className="panel-head"><h2>Outils d'administration</h2></div>
            <div className="settings-grid">
              {parametresData.map((s, i) => {
                const IconComp = Icon[s.icon]
                return (
                  <div className="setting-card" key={i}>
                    <div className="setting-icon"><IconComp /></div>
                    <div><h4>{s.titre}</h4><p>{s.desc}</p></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {modal === 'etab' && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editingId ? "Modifier l'établissement" : 'Créer un établissement'}</h3>
              <button className="modal-close" onClick={closeModal}><Icon.X /></button>
            </div>
            <form onSubmit={submitEtab}>
              <div className="m-field">
                <label>Nom de l'établissement</label>
                <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex : Pharmacie Al Amane" required />
              </div>
              <div className="m-field">
                <label>Type d'établissement</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="m-field">
                <label>E-mail du gérant</label>
                <input type="email" value={form.emailGerant} onChange={(e) => setForm({ ...form, emailGerant: e.target.value })} placeholder="gerant@exemple.com" />
              </div>
              <div className="m-field">
                <label>Téléphone</label>
                <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+221 77 000 00 00" />
              </div>
              <div className="m-field">
                <label>Date de fin d'abonnement</label>
                <input type="date" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingId ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Supprimer l'établissement</h3>
              <button className="modal-close" onClick={() => setConfirmDeleteId(null)}><Icon.X /></button>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>
              Cette action est irréversible. Toutes les données liées à cet établissement seront supprimées.
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmDeleteId(null)}>Annuler</button>
              <button className="btn-danger" onClick={() => deleteEtab(confirmDeleteId)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}