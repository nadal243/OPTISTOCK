import { NavLink, Outlet, useOutletContext } from 'react-router-dom'

const tabs = [
  { to: 'vendeurs', label: 'Vendeurs' },
  { to: 'ventes', label: 'Ventes' },
  { to: 'benefices', label: 'Bénéfices' },
]

export default function StatistiquesLayout() {
  const ctx = useOutletContext()
  return (
    <>
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