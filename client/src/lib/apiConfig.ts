// API Configuration for different deployment environments

export const API_CONFIG = {
  // Development (local)
  development: {
    BASE_URL: 'http://localhost:3000',
    API_BASE: 'http://localhost:3000/api'
  },
  
  // Production - Vercel (fullstack)
  vercel: {
    BASE_URL: 'https://queit.site',
    API_BASE: 'https://queit.site/api'
  },
  
  // Production - Hostinger (frontend only)
  hostinger: {
    BASE_URL: 'https://queit.site',
    API_BASE: 'https://queit-api.vercel.app/api' // Separate backend
  }
};

// Detect environment
export function getEnvironment(): 'development' | 'vercel' | 'hostinger' {
  if (typeof window === 'undefined') return 'development';
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('vercel.app')) {
    return 'vercel';
  } else if (hostname.includes('queit.site')) {
    // Check if this is a static-only deployment (no /api endpoints)
    return 'hostinger';
  }
  
  return 'vercel'; // Default fallback
}

// Get current API configuration
export function getApiConfig() {
  const env = getEnvironment();
  return API_CONFIG[env];
}

// Helper function to build API URLs
export function buildApiUrl(endpoint: string): string {
  const config = getApiConfig();
  
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  return `${config.API_BASE}/${cleanEndpoint}`;
}

// Export for use in components
export const { API_BASE } = getApiConfig();