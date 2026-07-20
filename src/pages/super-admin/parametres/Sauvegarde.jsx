import { Icon } from '../../../components/Icons.jsx'

export default function Sauvegarde() {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Sauvegarde et restauration</h2>
        <div className="cap-icon"><Icon.Database /></div>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 520 }}>
        Gère les sauvegardes automatiques des données de tous les établissements et permet de restaurer
        un établissement à un état antérieur en cas de besoin.
      </p>
    </div>
  )
}