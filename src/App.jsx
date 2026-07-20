import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient.js'

import Login from './pages/login/Login.jsx'
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
import Historique from './pages/super-admin/parametres/Historique.jsx'
import Assistance from './pages/super-admin/parametres/Assistance.jsx'
import Journaux from './pages/super-admin/parametres/Journaux.jsx'
import Sauvegarde from './pages/super-admin/parametres/Sauvegarde.jsx'
import Maintenance from './pages/super-admin/parametres/Maintenance.jsx'

function RouteProtegee({ role, children }) {
  const [statut, setStatut] = useState('chargement')

  useEffect(() => {
    const verifier = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return setStatut('refuse')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role === role) setStatut('autorise')
      else setStatut('refuse')
    }
    verifier()
  }, [role])

  if (statut === 'chargement') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07110C', color: '#1F9D63', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
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

        <Route path="/super-admin" element={
          <RouteProtegee role="super_admin">
            <SuperAdminLayout />
          </RouteProtegee>
        }>
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
<Route path="historique" element={<Historique />} />
<Route path="assistance" element={<Assistance />} />
<Route path="journaux" element={<Journaux />} />
<Route path="sauvegarde" element={<Sauvegarde />} />
<Route path="maintenance" element={<Maintenance />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App