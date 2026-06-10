import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MorningBrief from "./pages/MorningBrief";
import AskLifeOps from "./pages/AskLifeOps";
import WeeklyReview from "./pages/WeeklyReview";
import Placeholder from "./pages/Placeholder";
import ConnectSources from "./components/ConnectSources";
import { LoadingState, EmptyState, ErrorState } from "./pages/SystemStates";
import DesignSystem from "./pages/DesignSystem";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("lifeops_token");
  if (!token) return <Navigate to="/auth?tab=login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/morning-brief" element={<ProtectedRoute><MorningBrief /></ProtectedRoute>} />
          <Route path="/ask-lifeops" element={<ProtectedRoute><AskLifeOps /></ProtectedRoute>} />
          <Route path="/weekly-review" element={<ProtectedRoute><WeeklyReview /></ProtectedRoute>} />
          <Route path="/connect-sources" element={<ProtectedRoute><ConnectSources /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/system/loading" element={<ProtectedRoute><LoadingState /></ProtectedRoute>} />
          <Route path="/system/empty" element={<ProtectedRoute><EmptyState /></ProtectedRoute>} />
          <Route path="/system/error" element={<ProtectedRoute><ErrorState /></ProtectedRoute>} />
          <Route path="/design-system" element={<ProtectedRoute><DesignSystem /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Placeholder section="Tasks & Actions" /></ProtectedRoute>} />
          <Route path="/domain/:domain" element={<ProtectedRoute><Placeholder section="Domain View" /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Placeholder section="Calendar" /></ProtectedRoute>} />
          <Route path="/intelligence" element={<ProtectedRoute><Placeholder section="Intelligence Hub" /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
