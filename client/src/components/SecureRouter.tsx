
import { useEffect, useState, useRef } from 'react';
import { Router, Route, Switch, useLocation, useRouter } from 'wouter';
import { transformToSecurePath, extractOriginalPath, securityManager } from '@/lib/security';
import { useQuery } from '@tanstack/react-query';

interface SecureRouterProps {
  children: React.ReactNode;
}

// Custom hook for secure navigation
export function useSecureNavigation() {
  const [, setLocation] = useLocation();
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      if (!response.ok) return null;
      return response.json();
    },
  });

  const navigateSecure = (path: string) => {
    const securePath = transformToSecurePath(path, user?.id);
    setLocation(securePath);
  };

  return { navigateSecure };
}

// Security validation middleware - FIXED infinite loop
function SecurityValidator({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [transformationAttempted, setTransformationAttempted] = useState(false);
  const transformationRef = useRef(false);

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      if (!response.ok) return null;
      return response.json();
    },
  });

  useEffect(() => {
    // Prevent multiple transformation attempts with ref
    if (transformationRef.current) {
      return;
    }

    // Skip transformation if already on secure path
    if (location.startsWith('/v2/')) {
      transformationRef.current = true;
      return;
    }

    // Skip transformation for certain paths
    const skipTransform = [
      '/auth', 
      '/login', 
      '/register', 
      '/api/', 
      '/favicon.ico', 
      '/uploads/',
      '/static/',
      '/_vite/'
    ].some(path => location.startsWith(path));

    if (skipTransform) {
      transformationRef.current = true;
      return;
    }

    // Only transform once per location change
    if (!transformationRef.current && location !== '/v2/') {
      console.log(`🔄 Secure URL transformation: ${location}`);
      transformationRef.current = true;

      // Generate secure path and navigate with debouncing
      const securePath = transformToSecurePath(location, user?.id);

      // Use replace to avoid adding to history
      setTimeout(() => {
        window.history.replaceState(null, '', securePath);
      }, 50); // 50ms debounce
    }
  }, [location, user?.id]);

  // Reset transformation flag when location changes
  useEffect(() => {
    transformationRef.current = false;
    setTransformationAttempted(false);
  }, [location]);

  return <>{children}</>;
}

// Custom route component that handles secure paths
export function SecureRoute({ path, children }: { path: string; children: React.ReactNode }) {
  const [location] = useLocation();

  // Extract the original path from secure URL
  const extracted = extractOriginalPath(location);
  const currentPath = extracted ? extracted.path : location;

  // Check if current path matches the route pattern
  const isMatch = currentPath === path || 
                  (path.includes(':') && matchPathWithParams(currentPath, path));

  if (!isMatch) return null;

  return <SecurityValidator>{children}</SecurityValidator>;
}

// Helper function to match paths with parameters
function matchPathWithParams(currentPath: string, routePath: string): boolean {
  const currentSegments = currentPath.split('/').filter(Boolean);
  const routeSegments = routePath.split('/').filter(Boolean);

  if (currentSegments.length !== routeSegments.length) return false;

  return routeSegments.every((segment, index) => {
    return segment.startsWith(':') || segment === currentSegments[index];
  });
}

// Enhanced Link component with automatic security transformation
export function SecureLink({ 
  href, 
  children, 
  className,
  ...props 
}: { 
  href: string; 
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const [, setLocation] = useLocation();
  const clickRef = useRef(false);
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      if (!response.ok) return null;
      return response.json();
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Prevent double clicks
    if (clickRef.current) return;
    clickRef.current = true;

    // Generate a secure path for navigation
    const securePath = transformToSecurePath(href, user?.id);
    console.log(`🔗 SecureLink navigation: ${href} -> ${securePath}`);

    // Use window.location.href to ensure proper navigation
    window.location.href = securePath;

    // Reset click ref after delay
    setTimeout(() => {
      clickRef.current = false;
    }, 1000);
  };

  return (
    <a 
      href={href} 
      onClick={handleClick} 
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}

// Main secure router wrapper
export function SecureRouter({ children }: SecureRouterProps) {
  return (
    <Router>
      <SecurityValidator>
        {children}
      </SecurityValidator>
    </Router>
  );
}

// Hook to get current secure path information
export function useSecurePath() {
  const [location] = useLocation();
  const extracted = extractOriginalPath(location);

  return {
    securePath: location,
    originalPath: extracted?.path || location,
    securityCode: extracted?.code,
    isSecure: !!extracted,
  };
}

// Debounce cache to prevent excessive transformations - ENHANCED
const transformCache = new Map<string, { path: string; timestamp: number }>();
const TRANSFORM_DEBOUNCE_MS = 200; // Increased debounce time
