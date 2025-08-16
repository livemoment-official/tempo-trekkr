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
import MomentiEventi from "./pages/MomentiEventi";
import MomentDetail from "./pages/MomentDetail";
import Profilo from "./pages/Profilo";
import Crea from "./pages/Crea";
import Esplora from "./pages/Esplora";
import CreaMomento from "./pages/CreaMomento";
import CreaEvento from "./pages/CreaEvento";
import CreaInvito from "./pages/CreaInvito";
import Agenda from "./pages/Agenda";
import UserProfile from "./pages/UserProfile";

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
                <Route path="/momenti" element={<MomentiEventi />} />
                <Route path="/momenti/:id" element={<MomentDetail />} />
                <Route path="/esplora" element={<Esplora />} />
                <Route path="/profilo" element={<Profilo />} />
                <Route path="/crea" element={<Crea />} />
                <Route path="/crea/momento" element={<CreaMomento />} />
                <Route path="/crea/evento" element={<CreaEvento />} />
                <Route path="/crea/invito" element={<CreaInvito />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/profilo/:username" element={<UserProfile />} />
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
