import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { FiltersProvider } from './contexts/FiltersContext'
import { Toaster } from './components/ui/toaster'
import { PushNotificationService } from './components/notifications/PushNotificationService'

// Layout Components
import AppLayout from './components/layout/AppLayout'
import MinimalLayoutWrapper from './components/layout/MinimalLayoutWrapper'

// Pages
import Inviti from './pages/Inviti'
import TrovaAmici from './pages/TrovaAmici'
import Esplora from './pages/Esplora'
import EsploraChat from './pages/EsploraChat'
import Gruppi from './pages/Gruppi'
import MomentiEventi from './pages/MomentiEventi'
import Agenda from './pages/Agenda'
import Profilo from './pages/Profilo'
import UserDetailById from './pages/UserDetailById'
import EventDetail from './pages/EventDetail'
import ArtistDetail from './pages/ArtistDetail'
import Crea from './pages/Crea'
import CreaInvito from './pages/CreaInvito'
import CreaMomento from './pages/CreaMomento'
import CreaEvento from './pages/CreaEvento'
import CreaGruppo from './pages/CreaGruppo'
import MomentDetail from './pages/MomentDetail'
import Chat from './pages/Chat'
import ChatFullscreen from './pages/ChatFullscreen'
import Abbonamento from './pages/Abbonamento'
import NotFound from './pages/NotFound'
import UnifiedChatPage from './pages/UnifiedChatPage'
import Profili from './pages/Profili'

import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FiltersProvider>
          <BrowserRouter>
            <Routes>
            {/* Routes with App Layout (bottom nav + header) */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<MomentiEventi />} />
              <Route path="inviti" element={<Inviti />} />
              <Route path="trova-amici" element={<TrovaAmici />} />
              <Route path="esplora" element={<Esplora />} />
              <Route path="esplora/chat" element={<EsploraChat />} />
              <Route path="gruppi" element={<Gruppi />} />
              <Route path="momenti" element={<MomentiEventi />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="profilo" element={<Profilo />} />
              <Route path="profili" element={<Profili />} />
              <Route path="profilo/:userId" element={<UserDetailById />} />
              <Route path="abbonamento" element={<Abbonamento />} />
              <Route path="crea" element={<Crea />} />
              <Route path="chat" element={<Chat />} />
            </Route>

            {/* Routes with Minimal Layout (only back button) */}
            <Route path="crea/invito" element={<CreaInvito />} />
            <Route path="crea/momento" element={<MinimalLayoutWrapper title="Crea Momento"><CreaMomento /></MinimalLayoutWrapper>} />
            <Route path="crea/gruppo" element={<MinimalLayoutWrapper title="Crea Gruppo"><CreaGruppo /></MinimalLayoutWrapper>} />
            <Route path="crea/evento" element={<CreaEvento />} />
            {/* Profile route unified to ID-based */}
            <Route path="user/:id" element={<MinimalLayoutWrapper title="Profilo"><UserDetailById /></MinimalLayoutWrapper>} />
            <Route path="moment/:id" element={<MinimalLayoutWrapper title="Momento"><MomentDetail /></MinimalLayoutWrapper>} />
            <Route path="event/:id" element={<MinimalLayoutWrapper title="Evento"><EventDetail /></MinimalLayoutWrapper>} />
            <Route path="artist/:id" element={<MinimalLayoutWrapper title="Artista"><ArtistDetail /></MinimalLayoutWrapper>} />
            <Route path="momenti/:id" element={<MinimalLayoutWrapper title="Momento"><MomentDetail /></MinimalLayoutWrapper>} />
            {/* Unified chat dynamic route */}
            <Route path="chat/:type/:id" element={<UnifiedChatPage />} />
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <PushNotificationService />
          </BrowserRouter>
        </FiltersProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
