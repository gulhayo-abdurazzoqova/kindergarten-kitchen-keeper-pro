
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

// Default values for local development (should be replaced with actual values in production)
const DEFAULT_SUPABASE_URL = 'https://your-supabase-project.supabase.co';
const DEFAULT_SUPABASE_KEY = 'your-public-anon-key';

// Initialize Supabase client with proper fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

// Check if the URL is valid and warn if using defaults
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('No Supabase URL found in environment variables. Using default URL for development.');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('No Supabase Anon Key found in environment variables. Using default key for development.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Base URL for our API
const API_URL = `${supabaseUrl}/functions/v1/api`;

// Helper function for API requests
const apiFetch = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Set default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add authorization if logged in
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    // Make the API request
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Something went wrong');
    }
    
    // Parse and return the response data
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    toast.error(error.message || 'API request failed');
    throw error;
  }
};

// API client
export const api = {
  // Ingredients
  ingredients: {
    getAll: () => apiFetch('/ingredients'),
    create: (data: any) => apiFetch('/ingredients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiFetch(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiFetch(`/ingredients/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // Meals
  meals: {
    getAll: () => apiFetch('/meals'),
    create: (data: any) => apiFetch('/meals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiFetch(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiFetch(`/meals/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // Serving
  serve: {
    serveMeal: (data: any) => apiFetch('/serve', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  // Settings
  settings: {
    get: () => apiFetch('/settings'),
    update: (data: any) => apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },
  
  // Reports
  reports: {
    getMonthly: (year: number, month: number) => 
      apiFetch(`/reports/monthly?year=${year}&month=${month}`),
  },
};
