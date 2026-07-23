import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { Icon } from '../../components/Icons.jsx'
import { supabase } from '../../lib/supabaseClient.js'

export default function VendeurLayout() {
  const navigate = useNavigate()
  const [vendeur, setVendeur] = useState(null)
  const [etablissement, setEtablissement] = useState(null)

  useEffect(() => { chargerProfil() }, [])

  const chargerProfil = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: profil } = await supabase
      .from('profiles')
      .select('*, etablissements(*)')
      .eq('id', session.user.id)
      .single()
    if (profil) { setVendeur(profil); setEtablissement(profil.etablissements) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const navItems = [
    { to: '/vendeur/caisse', label: 'Caisse', icon: 'Card' },
    { to: '/vendeur/articles', label: 'Rechercher un article', icon: 'Search' },
    { to: '/vendeur/historique', label: 'Mes ventes', icon: 'Clock' },
  ]

  return (
    <div className="vd">
      <style>{`
        :root {
          --bg: #F0F4F2; --bg-2: #FFFFFF; --panel: #FFFFFF; --panel-2: #F6F9F7;
          --accent: #1A7A50; --accent-light: #22A06B; --accent-pale: #E8F5EE;
          --text: #0D1F16; --text-2: #374151; --muted: #6B7A72;
          --border: #E3EBE6; --danger: #DC2626; --warning: #D97706; --success: #16A34A;
          --shadow: 0 1px 3px rgba(0,0,0,0.07); --shadow-md: 0 4px 12px rgba(26,122,80,0.10);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); margin: 0; }
        .vd { display: flex; height: 100vh; overflow: hidden; background: var(--bg); font-family: 'Inter', sans-serif; color: var(--text); }

        /* SIDEBAR */
        .sidebar { width: 200px; flex-shrink: 0; background: var(--bg-2); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
        .sidebar-top { padding: 14px 12px 0; flex: 1; }
        .vd-brand { display: flex; align-items: center; gap: 8px; padding: 4px 6px 14px; }
        .vd-brand img { width: 26px; height: 26px; border-radius: 6px; }
        .vd-brand-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; color: var(--text); }
        .vd-brand-name span { color: var(--accent); }
        .etab-card { background: var(--accent-pale); border: 1px solid rgba(26,122,80,.15); border-radius: 8px; padding: 8px 10px; margin-bottom: 12px; }
        .etab-type { font-size: 9px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
        .etab-nom { font-size: 12px; font-weight: 700; color: var(--text); }
        .nav-divider { height: 1px; background: var(--border); margin: 0 6px 8px; }
        .nav-item { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 8px; color: var(--muted); cursor: pointer; font-size: 12.5px; font-weight: 500; margin-bottom: 2px; text-decoration: none; transition: background .15s, color .15s; position: relative; }
        .nav-item svg { width: 15px; height: 15px; flex-shrink: 0; }
        .nav-item:hover { background: var(--accent-pale); color: var(--accent); }
        .nav-item.active { background: var(--accent-pale); color: var(--accent); font-weight: 600; }
        .nav-item.active::before { content: ""; position: absolute; left: 0; top: 6px; bottom: 6px; width: 3px; border-radius: 0 3px 3px 0; background: var(--accent); }
        .sidebar-footer { padding: 10px 12px; border-top: 1px solid var(--border); }
        .vendeur-card { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--accent-pale); border-radius: 8px; margin-bottom: 6px; border: 1px solid rgba(26,122,80,.15); }
        .vendeur-avatar { width: 28px; height: 28px; border-radius: 7px; background: var(--accent); display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; color: #fff; flex-shrink: 0; }
        .vendeur-name { font-size: 11.5px; font-weight: 600; color: var(--text); }
        .vendeur-role { font-size: 9px; color: var(--accent); font-family: 'JetBrains Mono', monospace; font-weight: 600; }
        .logout-btn { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 12px; background: transparent; border: none; cursor: pointer; padding: 7px 10px; width: 100%; border-radius: 8px; transition: all .15s; font-family: 'Inter', sans-serif; }
        .logout-btn:hover { color: var(--danger); background: rgba(220,38,38,.06); }
        .logout-btn svg { width: 14px; height: 14px; }

        /* MAIN */
        .main { flex: 1; overflow-y: auto; padding: 16px 20px; }
        .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
        .topbar-left h1 { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; color: var(--text); }
        .topbar-left p { font-size: 11px; color: var(--muted); margin-top: 2px; }

        /* PANELS */
        .panel { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 14px; margin-bottom: 12px; box-shadow: var(--shadow); }
        .panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .panel-head h2 { font-family: 'Space Grotesk', sans-serif; font-size: 13.5px; font-weight: 700; color: var(--text); }

        /* BOUTONS */
        .btn-primary { display: flex; align-items: center; gap: 6px; background: var(--accent); color: #fff; border: none; padding: 8px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: filter .15s; box-shadow: 0 2px 6px rgba(26,122,80,0.2); }
        .btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .btn-primary svg { width: 14px; height: 14px; }
        .btn-ghost { background: transparent; border: 1.5px solid var(--border); color: var(--muted); padding: 7px 13px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all .15s; }
        .btn-ghost:hover:not(:disabled) { color: var(--text); border-color: var(--text); }
        .btn-danger { background: var(--danger); color: #fff; border: none; padding: 7px 13px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }

        /* TABLE */
        table { width: 100%; border-collapse: collapse; }
        thead th { text-align: left; font-size: 9.5px; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); font-weight: 600; padding: 0 10px 10px; font-family: 'JetBrains Mono', monospace; }
        tbody tr { border-top: 1px solid var(--border); transition: background .1s; }
        tbody tr:hover { background: var(--panel-2); }
        tbody td { padding: 10px; font-size: 12.5px; color: var(--text-2); }
        .name-cell { font-weight: 600; color: var(--text); }
        .sub-cell { color: var(--muted); font-size: 11px; margin-top: 1px; }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 600; white-space: nowrap; }
        .badge::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

        /* ALERTES */
        .alert-success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; padding: 9px 12px; border-radius: 8px; font-size: 11.5px; margin-bottom: 12px; }
        .alert-error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 9px 12px; border-radius: 8px; font-size: 11.5px; margin-bottom: 12px; }
        .alert-warning { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; padding: 9px 12px; border-radius: 8px; font-size: 11.5px; margin-bottom: 12px; }

        /* EMPTY */
        .empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 36px 16px; }
        .empty-icon { width: 44px; height: 44px; border-radius: 11px; background: var(--accent-pale); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .empty-icon svg { width: 20px; height: 20px; color: var(--accent); }
        .empty-state h3 { color: var(--text); font-family: 'Space Grotesk', sans-serif; font-size: 13.5px; font-weight: 600; margin-bottom: 4px; }
        .empty-state p { font-size: 11.5px; color: var(--muted); max-width: 240px; margin-bottom: 12px; line-height: 1.5; }

        /* MODAL */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.2); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 14px; }
        .modal { width: 100%; max-width: 420px; background: var(--panel); border: 1px solid var(--border); border-radius: 14px; padding: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .modal-head h3 { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: var(--text); }
        .modal-close { width: 26px; height: 26px; border-radius: 7px; background: var(--panel-2); border: 1px solid var(--border); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .modal-close:hover { color: var(--danger); border-color: var(--danger); }
        .modal-close svg { width: 13px; height: 13px; }
        .m-field { margin-bottom: 11px; }
        .m-field label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 9.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; font-weight: 600; }
        .m-field input, .m-field select { width: 100%; background: var(--panel-2); border: 1.5px solid var(--border); border-radius: 8px; padding: 8px 10px; color: var(--text); font-size: 12.5px; outline: none; font-family: 'Inter', sans-serif; transition: border-color .15s; }
        .m-field input:focus, .m-field select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(26,122,80,0.08); }
        .modal-actions { display: flex; gap: 8px; margin-top: 14px; }

        /* CAISSE SPÉCIFIQUE */
        .caisse-grid { display: grid; grid-template-columns: 1fr 320px; gap: 14px; align-items: start; }
        .article-card {
          background: var(--panel-2); border: 1.5px solid var(--border); border-radius: 10px;
          padding: 12px; cursor: pointer; transition: all .15s; position: relative;
        }
        .article-card:hover { border-color: var(--accent); transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .article-card.rupture { opacity: .6; cursor: not-allowed; border-color: var(--danger); background: #FEF2F2; }
        .article-card.stock-faible { border-color: var(--warning); }
        .article-nom { font-size: 12.5px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
        .article-ref { font-size: 10px; color: var(--muted); font-family: 'JetBrains Mono', monospace; margin-bottom: 6px; }
        .article-prix { font-size: 14px; font-weight: 800; color: var(--accent); }
        .article-stock { font-size: 10.5px; margin-top: 4px; }
        .article-emplacement { font-size: 10px; color: var(--muted); margin-top: 3px; display: flex; align-items: center; gap: 4px; }
        .rupture-badge { position: absolute; top: 6px; right: 6px; background: var(--danger); color: #fff; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px; font-family: 'JetBrains Mono', monospace; }
        .stock-faible-badge { position: absolute; top: 6px; right: 6px; background: var(--warning); color: #fff; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 10px; font-family: 'JetBrains Mono', monospace; }
        .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }

        /* PANIER */
        .panier { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); position: sticky; top: 0; }
        .panier-head { padding: 14px 14px 10px; border-bottom: 1px solid var(--border); }
        .panier-head h2 { font-family: 'Space Grotesk', sans-serif; font-size: 13.5px; font-weight: 700; }
        .panier-body { padding: 10px 14px; max-height: 340px; overflow-y: auto; }
        .panier-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border); }
        .panier-item:last-child { border-bottom: none; }
        .panier-nom { font-size: 12px; font-weight: 600; color: var(--text); flex: 1; }
        .panier-prix-unit { font-size: 10.5px; color: var(--muted); }
        .qte-ctrl { display: flex; align-items: center; gap: 4px; }
        .qte-btn { width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--border); background: var(--panel-2); cursor: pointer; font-size: 13px; line-height: 1; display: flex; align-items: center; justify-content: center; color: var(--text); transition: all .1s; }
        .qte-btn:hover { border-color: var(--accent); color: var(--accent); }
        .qte-val { font-size: 12px; font-weight: 700; min-width: 18px; text-align: center; }
        .panier-sous-total { font-size: 12px; font-weight: 700; color: var(--accent); min-width: 60px; text-align: right; }
        .retirer-btn { width: 18px; height: 18px; border-radius: 4px; border: none; background: transparent; cursor: pointer; color: var(--muted); font-size: 15px; display: flex; align-items: center; justify-content: center; }
        .retirer-btn:hover { color: var(--danger); }
        .panier-footer { padding: 12px 14px; border-top: 1px solid var(--border); }
        .total-ligne { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-bottom: 5px; }
        .total-ligne.principal { font-size: 14px; font-weight: 800; color: var(--text); margin-bottom: 10px; }
        .total-ligne.principal span:last-child { color: var(--accent); }
        .ticket-box { background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-top: 10px; }
        .ticket-titre { font-size: 10px; font-weight: 700; color: var(--muted); font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
        .ticket-ligne { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-2); margin-bottom: 4px; }
        .ticket-ligne.total { font-weight: 800; color: var(--accent); font-size: 13px; border-top: 1px dashed var(--border); padding-top: 6px; margin-top: 4px; }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="vd-brand">
            <img src={logo} alt="OptiStock" />
            <div className="vd-brand-name">Opti<span>Stock</span></div>
          </div>

          {etablissement && (
            <div className="etab-card">
              <div className="etab-type">{etablissement.type}</div>
              <div className="etab-nom">{etablissement.nom}</div>
            </div>
          )}

          <div className="nav-divider"></div>

          {navItems.map((item) => {
            const IconComp = Icon[item.icon]
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <IconComp />{item.label}
              </NavLink>
            )
          })}
        </div>

        <div className="sidebar-footer">
          <div className="vendeur-card">
            <div className="vendeur-avatar">{vendeur?.nom_complet?.slice(0, 2).toUpperCase() || 'VD'}</div>
            <div>
              <div className="vendeur-name">{vendeur?.nom_complet || 'Vendeur'}</div>
              <div className="vendeur-role">Vendeur</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}><Icon.Logout />Déconnexion</button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <h1>{etablissement?.nom || 'Mon espace'}</h1>
            <p>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <Outlet context={{ vendeur, etablissement }} />
      </main>
    </div>
  )
}