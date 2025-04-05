
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
  googleAuth: () => Promise<void>;
  logout: () => void;
}

// Define interfaces for API responses
interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
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
      // Fix the API path - remove the '/api' prefix since it's already in API_BASE_URL
      const response = await apiPost<AuthResponse>('auth/login', { email, password }, { requiresAuth: false });
      
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
      // Fix the API path - remove the '/api' prefix since it's already in API_BASE_URL
      const response = await apiPost<AuthResponse>('auth/register', 
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

  const googleAuth = async () => {
    setIsLoading(true);
    try {
      // Create a Google OAuth popup
      const googleWindow = window.open(`${api}/auth/google`, '_blank', 'width=500,height=600');
      
      // Listen for messages from the popup window
      window.addEventListener('message', async (event) => {
        // Check if the message is from our popup and contains auth data
        if (event.data && event.data.type === 'google-auth-success') {
          const { user, token } = event.data;
          
          // Store user data and token in session storage
          sessionStorage.setItem('user', JSON.stringify(user));
          sessionStorage.setItem('token', token);
          
          // Update auth state
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          toast({
            title: "Google Login Successful",
            description: `Welcome, ${user.name}!`,
          });
          
          setIsLoading(false);
          
          // Close the popup
          if (googleWindow) googleWindow.close();
        }
      });
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
      throw error;
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
    googleAuth,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
