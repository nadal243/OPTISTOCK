import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: 'mots-de-passe', label: 'Mots de passe' },
  { to: 'comptes', label: 'Comptes & accès' },
  { to: 'historique', label: 'Historique' },
  { to: 'assistance', label: 'Assistance' },
  { to: 'journaux', label: 'Journaux système' },
  { to: 'sauvegarde', label: 'Sauvegarde' },
  { to: 'maintenance', label: 'Maintenance' },
]

export default function ParametresLayout() {
  return (
    <>
      <div className="sub-tabs">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => `sub-tab ${isActive ? 'active' : ''}`}
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </>
  )
}