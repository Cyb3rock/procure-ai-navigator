
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Index />} />
                
                {/* Protected routes */}
                <Route path="/rfps" element={<ProtectedRoute><RfpsPage /></ProtectedRoute>} />
                <Route path="/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
                <Route path="/evaluations" element={<ProtectedRoute><EvaluationsPage /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                <Route path="/contracts" element={<ProtectedRoute><ContractsPage /></ProtectedRoute>} />
                <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrdersPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/documentation" element={<ProtectedRoute><DocumentationPage /></ProtectedRoute>} />
                
                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
