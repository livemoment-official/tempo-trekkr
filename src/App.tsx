import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import Chat from "./pages/Chat";
import Inviti from "./pages/Inviti";
import Gruppi from "./pages/Gruppi";
import MomentiEventi from "./pages/MomentiEventi";
import MomentDetail from "./pages/MomentDetail";
import Profilo from "./pages/Profilo";
import Crea from "./pages/Crea";
import Esplora from "./pages/Esplora";
import CreaMomento from "./pages/CreaMomento";
import CreaMomentoDaInvito from "./pages/CreaMomentoDaInvito";
import CreaEvento from "./pages/CreaEvento";
import CreaInvito from "./pages/CreaInvito";
import Agenda from "./pages/Agenda";
import UnifiedChatPage from "./pages/UnifiedChatPage";
import ChatFullscreen from "./pages/ChatFullscreen";
import TrovaAmici from "./pages/TrovaAmici";
import Profili from "./pages/Profili";
import Premi from "./pages/Premi";
import Abbonamento from "./pages/Abbonamento";
import GroupChat from "./pages/GroupChat";
import CityChat from "./pages/CityChat";
import MomentChat from "./pages/MomentChat";
import EsploraChat from "./pages/EsploraChat";
import EventDetail from "./pages/EventDetail";
import ArtistDetail from "./pages/ArtistDetail";
import VenueDetail from "./pages/VenueDetail";
import UserDetailById from "./pages/UserDetailById";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Esplora />} />
                <Route path="/inviti" element={<Inviti />} />
                <Route path="/gruppi" element={<Gruppi />} />
                <Route path="/momenti" element={<MomentiEventi />} />
                <Route path="/momenti/:id" element={<MomentDetail />} />
                <Route path="/esplora" element={<Esplora />} />
                <Route path="/profilo" element={<Profilo />} />
                <Route path="/crea" element={<Crea />} />
                <Route path="/crea/momento" element={<CreaMomento />} />
                <Route path="/crea/momento-da-invito/:inviteId" element={<CreaMomentoDaInvito />} />
                <Route path="/crea/evento" element={<CreaEvento />} />
                <Route path="/crea/invito" element={<CreaInvito />} />
                <Route path="/agenda" element={<Agenda />} />
                {/* Profile route unified to ID-based */}
                <Route path="/chat/:type/:id" element={<UnifiedChatPage />} />
                <Route path="/chat/conversation/:id" element={<ChatFullscreen />} />
                <Route path="/chat/group/:groupId" element={<GroupChat />} />
                <Route path="/chat/moment/:momentId" element={<MomentChat />} />
                <Route path="/chat/city/:cityName" element={<CityChat />} />
                <Route path="/esplora/chat" element={<EsploraChat />} />
                <Route path="/moment/:id" element={<MomentDetail />} />
                <Route path="/trova-amici" element={<TrovaAmici />} />
                <Route path="/profili" element={<Profili />} />
                <Route path="/premi" element={<Premi />} />
                <Route path="/abbonamento" element={<Abbonamento />} />
                <Route path="/evento/:id" element={<EventDetail />} />
                <Route path="/artist/:id" element={<ArtistDetail />} />
                <Route path="/location/:id" element={<VenueDetail />} />
                <Route path="/user/:id" element={<UserDetailById />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </HelmetProvider>
</QueryClientProvider>
);

export default App;
