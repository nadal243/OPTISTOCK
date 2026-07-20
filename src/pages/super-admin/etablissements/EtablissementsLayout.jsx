import { NavLink, Outlet } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'

const tabs = [
  { to: 'creation', label: 'Création' },
  { to: 'modification', label: 'Modification' },
  { to: 'suppression', label: 'Suppression' },
  { to: 'activation', label: 'Activation / désactivation' },
]

export default function EtablissementsLayout() {
  const ctx = useOutletContext()

  return (
    <>
      <style>{`
        .sub-tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
        .sub-tab { padding: 8px 14px; border-radius: 20px; font-size: 12.5px; font-weight: 600; color: var(--muted); background: var(--panel); border: 1px solid var(--border); text-decoration: none; }
        .sub-tab:hover { color: var(--text); border-color: var(--accent); }
        .sub-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
      `}</style>
      <div className="sub-tabs">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `sub-tab ${isActive ? 'active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet context={ctx} />
    </>
  )
}