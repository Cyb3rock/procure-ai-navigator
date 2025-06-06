
import { toast } from '@/hooks/use-toast';

// Update the API_BASE_URL to point to the correct server endpoint
const API_BASE_URL = '/api'; // This will append /api to all requests

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export const api = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = true,
  } = options;

  // Add auth token if required
  if (requiresAuth) {
    const token = sessionStorage.getItem('token');
    if (token) {
      headers['x-auth-token'] = token;
    }
  }

  // Set content type for JSON requests
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    // Fix the URL construction to ensure proper formatting
    let url = endpoint;
    if (!endpoint.startsWith('/')) {
      url = `/${endpoint}`;
    }
    
    // Log the request URL for debugging
    console.log(`API Request to: ${API_BASE_URL}${url}`);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Request failed with status ${response.status}`;
      
      // Display error toast
      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text() as any;
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Use relative paths for the API helper functions
export const apiGet = <T>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}) => {
  return api<T>(endpoint, { ...options, method: 'GET' });
};

export const apiPost = <T>(endpoint: string, data: any, options: Omit<ApiOptions, 'method' | 'body'> = {}) => {
  return api<T>(endpoint, { ...options, method: 'POST', body: data });
};

export const apiPut = <T>(endpoint: string, data: any, options: Omit<ApiOptions, 'method' | 'body'> = {}) => {
  return api<T>(endpoint, { ...options, method: 'PUT', body: data });
};

export const apiPatch = <T>(endpoint: string, data: any, options: Omit<ApiOptions, 'method' | 'body'> = {}) => {
  return api<T>(endpoint, { ...options, method: 'PATCH', body: data });
};

export const apiDelete = <T>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}) => {
  return api<T>(endpoint, { ...options, method: 'DELETE' });
};
