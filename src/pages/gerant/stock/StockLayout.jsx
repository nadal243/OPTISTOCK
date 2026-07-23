import { NavLink, Outlet, useOutletContext } from 'react-router-dom'

const tabs = [
  { to: 'entree', label: 'Entrée de stock' },
  { to: 'inventaire', label: 'Inventaire' },
  { to: 'ajustements', label: 'Ajustements & corrections' },
]

export default function StockLayout() {
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