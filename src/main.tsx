import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'

// Layout Components
import AppLayout from './components/layout/AppLayout'
import MinimalLayout from './components/layout/MinimalLayout'

// Pages
import Index from './pages/Index'
import Inviti from './pages/Inviti'
import Esplora from './pages/Esplora'
import Gruppi from './pages/Gruppi'
import MomentiEventi from './pages/MomentiEventi'
import Agenda from './pages/Agenda'
import Profilo from './pages/Profilo'
import UserProfile from './pages/UserProfile'
import Crea from './pages/Crea'
import CreaInvito from './pages/CreaInvito'
import CreaMomento from './pages/CreaMomento'
import CreaEvento from './pages/CreaEvento'
import MomentDetail from './pages/MomentDetail'
import Chat from './pages/Chat'
import ChatFullscreen from './pages/ChatFullscreen'
import NotFound from './pages/NotFound'

import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Routes with App Layout (bottom nav + header) */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="inviti" element={<Inviti />} />
              <Route path="esplora" element={<Esplora />} />
              <Route path="gruppi" element={<Gruppi />} />
              <Route path="momenti" element={<MomentiEventi />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="profilo" element={<Profilo />} />
              <Route path="profilo/:userId" element={<UserProfile />} />
              <Route path="crea" element={<Crea />} />
              <Route path="chat" element={<Chat />} />
            </Route>

            {/* Routes with Minimal Layout (only back button) */}
            <Route path="/" element={<MinimalLayout />}>
              <Route path="crea-invito" element={<CreaInvito />} />
              <Route path="crea-momento" element={<CreaMomento />} />
              <Route path="crea-evento" element={<CreaEvento />} />
              <Route path="momenti/:id" element={<MomentDetail />} />
              <Route path="chat/:type/:id" element={<ChatFullscreen />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
