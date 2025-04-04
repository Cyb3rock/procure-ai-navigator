
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RfpsPage from "./pages/RfpsPage";
import VendorsPage from "./pages/VendorsPage";
import EvaluationsPage from "./pages/EvaluationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ContractsPage from "./pages/ContractsPage";
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import SettingsPage from "./pages/SettingsPage";
import DocumentationPage from "./pages/DocumentationPage";
import React from "react";

const App = () => {
  // Create a client
  const queryClient = new QueryClient();
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/rfps" element={<RfpsPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/evaluations" element={<EvaluationsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/documentation" element={<DocumentationPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
