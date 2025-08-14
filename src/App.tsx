import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import Chat from "./pages/Chat";
import Inviti from "./pages/Inviti";
import MomentiEventi from "./pages/MomentiEventi";
import Profilo from "./pages/Profilo";
import Crea from "./pages/Crea";
import Esplora from "./pages/Esplora";
import CreaMomento from "./pages/CreaMomento";
import CreaEvento from "./pages/CreaEvento";
import CreaInvito from "./pages/CreaInvito";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Chat />} />
              <Route path="/inviti" element={<Inviti />} />
              <Route path="/momenti" element={<MomentiEventi />} />
              <Route path="/esplora" element={<Esplora />} />
              <Route path="/profilo" element={<Profilo />} />
              <Route path="/crea" element={<Crea />} />
              <Route path="/crea/momento" element={<CreaMomento />} />
              <Route path="/crea/evento" element={<CreaEvento />} />
              <Route path="/crea/invito" element={<CreaInvito />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
