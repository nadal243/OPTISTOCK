import { NavLink, Outlet, useOutletContext } from 'react-router-dom'

const tabs = [
  { to: 'nouvelle', label: 'Nouvelle vente' },
  { to: 'historique', label: 'Historique des ventes' },
]

export default function VentesLayout() {
  const ctx = useOutletContext()
  return (
    <>
      <div className="sub-tabs">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => `sub-tab ${isActive ? 'active' : ''}`}>{t.label}</NavLink>
        ))}
      </div>
      <Outlet context={ctx} />
    </>
  )
}