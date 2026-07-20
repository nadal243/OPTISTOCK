import { useOutletContext } from 'react-router-dom'
import { Icon } from '../../../components/Icons.jsx'

export default function Formules() {
  const { plans } = useOutletContext()
  return (
    <div className="panel">
      <div className="panel-head"><h2>Formules d'abonnement</h2></div>
      <div className="plans-grid">
        {plans.map((p) => (
          <div className="plan-card" key={p.id}>
            <div className="plan-dot"></div>
            <h3>{p.nom}</h3>
            <div className="price">{p.prix}</div>
            <div className="meta"><span>Vendeurs max</span><b>{p.vendeurs}</b></div>
            {p.essaiGratuit && <div className="trial"><Icon.Gift />Période d'essai gratuite disponible</div>}
          </div>
        ))}
      </div>
    </div>
  )
}