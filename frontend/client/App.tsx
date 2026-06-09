import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MorningBrief from "./pages/MorningBrief";
import AskLifeOps from "./pages/AskLifeOps";
import WeeklyReview from "./pages/WeeklyReview";
import Placeholder from "./pages/Placeholder";
import ConnectSources from "./components/ConnectSources";
import { LoadingState, EmptyState, ErrorState } from "./pages/SystemStates";
import DesignSystem from "./pages/DesignSystem";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/morning-brief" element={<MorningBrief />} />
          <Route path="/ask-lifeops" element={<AskLifeOps />} />
          <Route path="/weekly-review" element={<WeeklyReview />} />
          <Route path="/connect-sources" element={<ConnectSources />} />
          <Route path="/system/loading" element={<LoadingState />} />
          <Route path="/system/empty" element={<EmptyState />} />
          <Route path="/system/error" element={<ErrorState />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/tasks" element={<Placeholder section="Tasks & Actions" />} />
          <Route path="/domain/:domain" element={<Placeholder section="Domain View" />} />
          <Route path="/calendar" element={<Placeholder section="Calendar" />} />
          <Route path="/intelligence" element={<Placeholder section="Intelligence Hub" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
