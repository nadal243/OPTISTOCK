import { NavLink, Outlet, useOutletContext } from 'react-router-dom'

const tabs = [
  { to: 'liste', label: 'Liste des fournisseurs' },
  { to: 'ajouter', label: 'Ajouter un fournisseur' },
]

export default function FournisseursLayout() {
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