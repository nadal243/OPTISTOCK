import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: 'mots-de-passe', label: 'Mots de passe' },
  { to: 'assistance', label: 'Assistance' },
  { to: 'journaux', label: 'Journaux système' },
  { to: 'sauvegarde', label: 'Sauvegarde' },
  { to: 'maintenance', label: 'Maintenance' },
]

export default function ParametresLayout() {
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
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `sub-tab ${isActive ? 'active' : ''}`}>{t.label}</NavLink>
        ))}
      </div>
      <Outlet />
    </>
  )
}