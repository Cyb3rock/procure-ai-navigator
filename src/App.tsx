
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
