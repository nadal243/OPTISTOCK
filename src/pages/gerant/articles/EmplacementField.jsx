// Système d'emplacement adapté au type d'établissement
const CONFIG_EMPLACEMENT = {
  Pharmacie: {
    label: 'Emplacement dans la pharmacie',
    champs: [
      { key: 'rayon', label: 'Rayon', type: 'select', options: ['Médicaments', 'Parapharmacie', 'Matériel médical', 'Vitamines & compléments', 'Hygiène & beauté', 'Bébé & maternité', 'Optique', 'Vétérinaire'] },
      { key: 'etagere', label: 'Étagère', type: 'text', placeholder: 'Ex : A, B, C...' },
      { key: 'position', label: 'Position', type: 'text', placeholder: 'Ex : 1, 2, 3...' },
      { key: 'armoire', label: 'Armoire / Tiroir (si applicable)', type: 'text', placeholder: 'Ex : Tiroir 2' },
    ]
  },
  'Mini-supermarché': {
    label: 'Emplacement dans le supermarché',
    champs: [
      { key: 'allee', label: 'Allée', type: 'text', placeholder: 'Ex : Allée 1, 2, 3...' },
      { key: 'rayon', label: 'Rayon', type: 'select', options: ['Alimentation générale', 'Boissons', 'Produits laitiers', 'Viandes & poissons', 'Fruits & légumes', 'Surgelés', 'Hygiène', 'Nettoyage', 'Épicerie sèche'] },
      { key: 'etagere', label: 'Étagère', type: 'text', placeholder: 'Ex : Haut, Milieu, Bas' },
      { key: 'colonne', label: 'Colonne', type: 'text', placeholder: 'Ex : 1, 2, 3...' },
    ]
  },
  Boutique: {
    label: 'Emplacement dans la boutique',
    champs: [
      { key: 'section', label: 'Section', type: 'text', placeholder: 'Ex : Entrée, Fond, Vitrine...' },
      { key: 'etagere', label: 'Étagère / Rayon', type: 'text', placeholder: 'Ex : Étagère 1' },
      { key: 'position', label: 'Position', type: 'text', placeholder: 'Ex : Gauche, Centre, Droite' },
    ]
  },
  Dépôt: {
    label: 'Emplacement dans le dépôt',
    champs: [
      { key: 'zone', label: 'Zone', type: 'text', placeholder: 'Ex : Zone A, B, C...' },
      { key: 'rangee', label: 'Rangée', type: 'text', placeholder: 'Ex : R1, R2...' },
      { key: 'case', label: 'Case / Palette', type: 'text', placeholder: 'Ex : Case 01' },
      { key: 'niveau', label: 'Niveau', type: 'select', options: ['Sol', 'Niveau 1', 'Niveau 2', 'Niveau 3'] },
    ]
  },
  Magasin: {
    label: 'Emplacement dans le magasin',
    champs: [
      { key: 'departement', label: 'Département', type: 'text', placeholder: 'Ex : Électronique, Mode...' },
      { key: 'rayon', label: 'Rayon', type: 'text', placeholder: 'Ex : Rayon 3' },
      { key: 'etagere', label: 'Étagère', type: 'text', placeholder: 'Ex : Étagère B' },
      { key: 'ref_interne', label: 'Référence interne', type: 'text', placeholder: 'Ex : MAG-001' },
    ]
  },
  Alimentation: {
    label: 'Emplacement dans l\'alimentation',
    champs: [
      { key: 'rayon', label: 'Rayon', type: 'select', options: ['Épicerie', 'Boissons', 'Produits frais', 'Condiments', 'Céréales', 'Conserves', 'Hygiène'] },
      { key: 'etagere', label: 'Étagère', type: 'text', placeholder: 'Ex : 1, 2, 3...' },
      { key: 'position', label: 'Position', type: 'text', placeholder: 'Ex : Gauche, Centre, Droite' },
    ]
  },
  Entrepôt: {
    label: 'Emplacement dans l\'entrepôt',
    champs: [
      { key: 'hall', label: 'Hall / Secteur', type: 'text', placeholder: 'Ex : Hall A, Secteur 2' },
      { key: 'rangee', label: 'Rangée', type: 'text', placeholder: 'Ex : R01, R02...' },
      { key: 'case', label: 'Case', type: 'text', placeholder: 'Ex : C001' },
      { key: 'niveau', label: 'Niveau', type: 'select', options: ['Sol', 'Niveau 1', 'Niveau 2', 'Niveau 3', 'Niveau 4'] },
    ]
  },
}

const DEFAULT_CONFIG = {
  label: 'Emplacement',
  champs: [
    { key: 'etagere', label: 'Étagère / Rayon', type: 'text', placeholder: 'Ex : Étagère 1' },
    { key: 'position', label: 'Position', type: 'text', placeholder: 'Ex : 1, 2, 3...' },
  ]
}

export default function EmplacementField({ typeEtablissement, value = {}, onChange }) {
  const config = CONFIG_EMPLACEMENT[typeEtablissement] || DEFAULT_CONFIG

  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="emplacement-box">
      <div className="emplacement-title">📍 {config.label}</div>
      <div className="m-row-3" style={{ gridTemplateColumns: config.champs.length <= 2 ? '1fr 1fr' : `repeat(${Math.min(config.champs.length, 2)}, 1fr)` }}>
        {config.champs.map((champ) => (
          <div key={champ.key} style={{ marginBottom: 0 }}>
            <label style={{ display: 'block', fontSize: '9.5px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>
              {champ.label}
            </label>
            {champ.type === 'select' ? (
              <select
                value={value[champ.key] || ''}
                onChange={(e) => handleChange(champ.key, e.target.value)}
                style={{ width: '100%', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 7, padding: '7px 9px', color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'Inter, sans-serif' }}
              >
                <option value="">-- Sélectionner --</option>
                {champ.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value={value[champ.key] || ''}
                onChange={(e) => handleChange(champ.key, e.target.value)}
                placeholder={champ.placeholder}
                style={{ width: '100%', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 7, padding: '7px 9px', color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'Inter, sans-serif' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}