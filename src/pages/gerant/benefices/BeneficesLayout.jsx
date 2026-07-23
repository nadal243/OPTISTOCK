import { NavLink, Outlet, useOutletContext } from 'react-router-dom'

const tabs = [
  { to: 'journalier', label: 'Journalier' },
  { to: 'hebdomadaire', label: 'Hebdomadaire' },
  { to: 'mensuel', label: 'Mensuel' },
  { to: 'annuel', label: 'Annuel' },
]

export default function BeneficesLayout() {
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