
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import AuthPage from "@/pages/AuthPage";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import SendInterface from "@/pages/SendInterface";
import NotFound from "@/pages/NotFound";

// Import i18n initialization file
import "@/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

const queryClient = new QueryClient();

const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="login" element={<AuthPage />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="dashboard/send" element={<SendInterface />} />
                <Route path="dashboard/tab2" element={<div className="container mx-auto px-4">Tab 2 Content</div>} />
                <Route path="dashboard/tab3" element={<div className="container mx-auto px-4">Tab 3 Content</div>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;
