import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import AppRouter from "@/components/AppRouter";
import ProtectedRoute from "@/components/ProtectedRoute";

import PreparednessPage from "./components/PreparednessPage";
import WeatherPage from "./components/WeatherPage";
import ResourcesPage from "./components/ResourcesPage";
import AISearchPage from "./components/AISearchPage";
import ProfilePage from "./components/ProfilePage";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SelfAssessmentPage from "./components/SelfAssessmentPage";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AppRouter />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/preparedness" element={<ProtectedRoute><PreparednessPage /></ProtectedRoute>} />
            <Route path="/during" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
            <Route path="/after" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
            <Route path="/aisearch" element={<ProtectedRoute><AISearchPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/self-assessment" element={<ProtectedRoute><SelfAssessmentPage /></ProtectedRoute>} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
