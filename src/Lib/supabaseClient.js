import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

/**
 * Convertit un numéro en email professionnel
 * 0831511015 → 0831511015@stellarbrightsoftware.com
 */
export function telephoneVersEmail(telephone) {
  return `${telephone.replace(/\s+/g, '')}@stellarbrightsoftware.com`
}

/**
 * Génère le numéro de téléphone d'un GÉRANT
 * - prefixe : 3 chiffres saisis par le Super Admin
 * - reste   : 7 chiffres générés par le système
 * Exemple : prefixe "077" → "0771234567"
 */
export function genererNumeroGerant(prefixe) {
  const clean = prefixe.replace(/\s+/g, '').slice(0, 3)
  const suffixe = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('')
  return `${clean}${suffixe}`
}

/**
 * Génère le numéro de téléphone d'un VENDEUR
 * - 6 premiers chiffres du numéro du gérant
 * - 2 derniers chiffres du numéro Super Admin
 * - 2 chiffres générés par le système
 * Exemple : gérant "0770948321", SA "0831511015"
 *   → "077094" + "15" + "42" = "0770941542"
 */
export function genererNumeroVendeur(numeroGerant, numeroSuperAdmin) {
  const partGerant = numeroGerant.replace(/\s+/g, '').slice(0, 6)
  const partSA = numeroSuperAdmin.replace(/\s+/g, '').slice(-2)
  const partSysteme = Array.from({ length: 2 }, () => Math.floor(Math.random() * 10)).join('')
  return `${partGerant}${partSA}${partSysteme}`
}

/**
 * Génère un mot de passe sécurisé de 10 caractères
 * Lettres + chiffres, sans caractères ambigus (0, O, l, I)
 */
export function genererMotDePasse() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}