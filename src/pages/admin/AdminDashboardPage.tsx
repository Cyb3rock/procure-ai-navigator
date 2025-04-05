
import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Users, Settings, LayoutDashboard } from 'lucide-react';
import UsersManagement from './UsersManagement';
import AdminSettings from './AdminSettings';
import AdminOverview from './AdminOverview';

const AdminDashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/settings')) return 'settings';
    return 'overview';
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'users':
        navigate('/admin/users');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      default:
        navigate('/admin');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {currentUser?.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="mt-6">
            <Routes>
              <Route path="/" element={<AdminOverview />} />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
