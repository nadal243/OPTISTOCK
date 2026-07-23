import { NavLink, Outlet, useOutletContext } from 'react-router-dom'

const tabs = [
  { to: 'liste', label: 'Liste des articles' },
  { to: 'ajouter', label: 'Ajouter' },
  { to: 'modifier', label: 'Modifier' },
  { to: 'categories', label: 'Catégories' },
]

export default function ArticlesLayout() {
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