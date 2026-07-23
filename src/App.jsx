import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient.js'

// Auth
import Login from './pages/login/Login.jsx'

// Super Admin
import SuperAdminLayout from './pages/super-admin/SuperAdminLayout.jsx'
import EtablissementsLayout from './pages/super-admin/etablissements/EtablissementsLayout.jsx'
import Creation from './pages/super-admin/etablissements/Creation.jsx'
import Modification from './pages/super-admin/etablissements/Modification.jsx'
import Suppression from './pages/super-admin/etablissements/Suppression.jsx'
import Activation from './pages/super-admin/etablissements/Activation.jsx'
import AbonnementsLayout from './pages/super-admin/abonnements/AbonnementsLayout.jsx'
import Formules from './pages/super-admin/abonnements/Formules.jsx'
import Statuts from './pages/super-admin/abonnements/Statuts.jsx'
import Expiration from './pages/super-admin/abonnements/Expiration.jsx'
import ParametresLayout from './pages/super-admin/parametres/ParametresLayout.jsx'
import MotsDePasse from './pages/super-admin/parametres/MotsDePasse.jsx'
import Comptes from './pages/super-admin/parametres/Comptes.jsx'
import HistoriqueAdmin from './pages/super-admin/parametres/Historique.jsx'
import Assistance from './pages/super-admin/parametres/Assistance.jsx'
import Journaux from './pages/super-admin/parametres/Journaux.jsx'
import Sauvegarde from './pages/super-admin/parametres/Sauvegarde.jsx'
import Maintenance from './pages/super-admin/parametres/Maintenance.jsx'

// Gérant
import GerantLayout from './pages/gerant/GerantLayout.jsx'
import Dashboard from './pages/gerant/dashboard/Dashboard.jsx'
import UtilisateursLayout from './pages/gerant/utilisateurs/UtilisateursLayout.jsx'
import ListeVendeurs from './pages/gerant/utilisateurs/ListeVendeurs.jsx'
import CreerVendeur from './pages/gerant/utilisateurs/CreerVendeur.jsx'
import ArticlesLayout from './pages/gerant/articles/ArticlesLayout.jsx'
import ListeArticles from './pages/gerant/articles/ListeArticles.jsx'
import AjouterArticle from './pages/gerant/articles/AjouterArticle.jsx'
import ModifierArticle from './pages/gerant/articles/ModifierArticle.jsx'
import Categories from './pages/gerant/articles/Categories.jsx'
import StockLayout from './pages/gerant/stock/StockLayout.jsx'
import EntreeStock from './pages/gerant/stock/EntreeStock.jsx'
import Inventaire from './pages/gerant/stock/Inventaire.jsx'
import Ajustements from './pages/gerant/stock/Ajustements.jsx'
import VentesLayout from './pages/gerant/ventes/VentesLayout.jsx'
import NouvelleVente from './pages/gerant/ventes/NouvelleVente.jsx'
import HistoriqueVentes from './pages/gerant/ventes/HistoriqueVentes.jsx'
import BeneficesLayout from './pages/gerant/benefices/BeneficesLayout.jsx'
import Journalier from './pages/gerant/benefices/Journalier.jsx'
import Hebdomadaire from './pages/gerant/benefices/Hebdomadaire.jsx'
import Mensuel from './pages/gerant/benefices/Mensuel.jsx'
import Annuel from './pages/gerant/benefices/Annuel.jsx'
import FournisseursLayout from './pages/gerant/fournisseurs/FournisseursLayout.jsx'
import ListeFournisseurs from './pages/gerant/fournisseurs/ListeFournisseurs.jsx'
import AjouterFournisseur from './pages/gerant/fournisseurs/AjouterFournisseur.jsx'
import StatistiquesLayout from './pages/gerant/statistiques/StatistiquesLayout.jsx'
import StatsVendeurs from './pages/gerant/statistiques/StatsVendeurs.jsx'
import VentesStats from './pages/gerant/statistiques/VentesStats.jsx'
import BeneficesStats from './pages/gerant/statistiques/BeneficesStats.jsx'
import Alertes from './pages/gerant/alertes/Alertes.jsx'
import HistoriqueGerant from './pages/gerant/historique/HistoriqueGerant.jsx'
import ParametresGerant from './pages/gerant/parametres/ParametresGerant.jsx'

// Vendeur
import VendeurLayout from './pages/vendeur/VendeurLayout.jsx'
import Caisse from './pages/vendeur/Caisse.jsx'
import RechercheArticle from './pages/vendeur/RechercheArticle.jsx'
import MesVentes from './pages/vendeur/MesVentes.jsx'

function RouteProtegee({ role, children }) {
  const [statut, setStatut] = useState('chargement')

  useEffect(() => {
    const verifier = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return setStatut('refuse')
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (Array.isArray(role) ? role.includes(profile?.role) : profile?.role === role) setStatut('autorise')
      else setStatut('refuse')
    }
    verifier()
  }, [role])

  if (statut === 'chargement') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F4F2', color: '#1A7A50', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
      Chargement...
    </div>
  )
  if (statut === 'refuse') return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* ===== SUPER ADMIN ===== */}
        <Route path="/super-admin" element={<RouteProtegee role="super_admin"><SuperAdminLayout /></RouteProtegee>}>
          <Route index element={<Navigate to="etablissements" replace />} />
          <Route path="etablissements" element={<EtablissementsLayout />}>
            <Route index element={<Navigate to="creation" replace />} />
            <Route path="creation" element={<Creation />} />
            <Route path="modification" element={<Modification />} />
            <Route path="suppression" element={<Suppression />} />
            <Route path="activation" element={<Activation />} />
          </Route>
          <Route path="abonnements" element={<AbonnementsLayout />}>
            <Route index element={<Navigate to="formules" replace />} />
            <Route path="formules" element={<Formules />} />
            <Route path="statuts" element={<Statuts />} />
            <Route path="expiration" element={<Expiration />} />
          </Route>
          <Route path="parametres" element={<ParametresLayout />}>
            <Route index element={<Navigate to="mots-de-passe" replace />} />
            <Route path="mots-de-passe" element={<MotsDePasse />} />
            <Route path="comptes" element={<Comptes />} />
            <Route path="historique" element={<HistoriqueAdmin />} />
            <Route path="assistance" element={<Assistance />} />
            <Route path="journaux" element={<Journaux />} />
            <Route path="sauvegarde" element={<Sauvegarde />} />
            <Route path="maintenance" element={<Maintenance />} />
          </Route>
        </Route>

        {/* ===== GÉRANT ===== */}
        <Route path="/gerant" element={<RouteProtegee role={['gerant', 'super_admin']}><GerantLayout /></RouteProtegee>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="utilisateurs" element={<UtilisateursLayout />}>
            <Route index element={<Navigate to="liste" replace />} />
            <Route path="liste" element={<ListeVendeurs />} />
            <Route path="creer" element={<CreerVendeur />} />
          </Route>

          <Route path="articles" element={<ArticlesLayout />}>
            <Route index element={<Navigate to="liste" replace />} />
            <Route path="liste" element={<ListeArticles />} />
            <Route path="ajouter" element={<AjouterArticle />} />
            <Route path="modifier" element={<ModifierArticle />} />
            <Route path="categories" element={<Categories />} />
          </Route>

          <Route path="stock" element={<StockLayout />}>
            <Route index element={<Navigate to="entree" replace />} />
            <Route path="entree" element={<EntreeStock />} />
            <Route path="inventaire" element={<Inventaire />} />
            <Route path="ajustements" element={<Ajustements />} />
          </Route>

          <Route path="ventes" element={<VentesLayout />}>
            <Route index element={<Navigate to="nouvelle" replace />} />
            <Route path="nouvelle" element={<NouvelleVente />} />
            <Route path="historique" element={<HistoriqueVentes />} />
          </Route>

          <Route path="benefices" element={<BeneficesLayout />}>
            <Route index element={<Navigate to="journalier" replace />} />
            <Route path="journalier" element={<Journalier />} />
            <Route path="hebdomadaire" element={<Hebdomadaire />} />
            <Route path="mensuel" element={<Mensuel />} />
            <Route path="annuel" element={<Annuel />} />
          </Route>

          <Route path="fournisseurs" element={<FournisseursLayout />}>
            <Route index element={<Navigate to="liste" replace />} />
            <Route path="liste" element={<ListeFournisseurs />} />
            <Route path="ajouter" element={<AjouterFournisseur />} />
          </Route>

          <Route path="statistiques" element={<StatistiquesLayout />}>
            <Route index element={<Navigate to="vendeurs" replace />} />
            <Route path="vendeurs" element={<StatsVendeurs />} />
            <Route path="ventes" element={<VentesStats />} />
            <Route path="benefices" element={<BeneficesStats />} />
          </Route>

          <Route path="alertes" element={<Alertes />} />
          <Route path="historique" element={<HistoriqueGerant />} />
          <Route path="parametres" element={<ParametresGerant />} />
        </Route>

        {/* ===== VENDEUR ===== */}
        <Route path="/vendeur" element={<RouteProtegee role={['vendeur', 'gerant', 'super_admin']}><VendeurLayout /></RouteProtegee>}>
          <Route index element={<Navigate to="caisse" replace />} />
          <Route path="caisse" element={<Caisse />} />
          <Route path="articles" element={<RechercheArticle />} />
          <Route path="historique" element={<MesVentes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App