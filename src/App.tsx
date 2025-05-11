
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RespondentDashboard from "./pages/RespondentDashboard";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import SurveyDetail from "./pages/SurveyDetail";
import SurveyResponses from "./pages/SurveyResponses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/respondent-dashboard" element={<RespondentDashboard />} />
            <Route path="/researcher-dashboard" element={<ResearcherDashboard />} />
            <Route path="/survey/:id" element={<SurveyDetail />} />
            <Route path="/researcher-dashboard/surveys/:id/responses" element={<SurveyResponses />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;