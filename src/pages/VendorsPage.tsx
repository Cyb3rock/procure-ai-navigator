
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VendorLogin from '@/components/vendors/VendorLogin';
import VendorDashboard from '@/components/vendors/VendorDashboard';
import { useToast } from '@/hooks/use-toast';

const VendorsPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<null | { id: string; name: string }>(null);
  const { toast } = useToast();

  const handleLogin = (vendor: { id: string; name: string }) => {
    setIsAuthenticated(true);
    setCurrentVendor(vendor);
    toast({
      title: "Login Successful",
      description: `Welcome back, ${vendor.name}!`,
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentVendor(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
          <div className="grid gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
              <p className="text-muted-foreground">
                Track and manage vendor profiles, credit tracking, and customer relationships.
              </p>
            </div>
            
            {!isAuthenticated ? (
              <VendorLogin onLogin={handleLogin} />
            ) : (
              <VendorDashboard vendor={currentVendor} onLogout={handleLogout} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorsPage;
