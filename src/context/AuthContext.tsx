
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/vendor';
import { useToast } from '@/hooks/use-toast';
import { api, apiPost } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in (from session storage)
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Use apiPost from our lib/api helper
      const response = await apiPost('/api/auth/login', { email, password }, { requiresAuth: false });
      
      // Store user data and token in session storage
      sessionStorage.setItem('user', JSON.stringify(response.user));
      sessionStorage.setItem('token', response.token);
      
      // Update auth state
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'vendor') => {
    setIsLoading(true);
    try {
      // Use apiPost from our lib/api helper
      const response = await apiPost('/api/auth/register', 
        { name, email, password, role }, 
        { requiresAuth: false }
      );
      
      // Store user data and token in session storage
      sessionStorage.setItem('user', JSON.stringify(response.user));
      sessionStorage.setItem('token', response.token);
      
      // Update auth state
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${response.user.name}!`,
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Remove user data from session storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    // Update auth state
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
