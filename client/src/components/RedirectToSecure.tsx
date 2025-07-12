import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { transformToSecurePath } from '@/lib/security';
import { useQuery } from '@tanstack/react-query';

interface RedirectToSecureProps {
  path: string;
}

export function RedirectToSecure({ path }: RedirectToSecureProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log(`🔐 transformToSecurePath: ${path} -> ${transformToSecurePath(path)}`);
    console.log(`🔄 IMMEDIATE REDIRECT: ${path} -> ${transformToSecurePath(path)}`);
    setLocation(transformToSecurePath(path));
  }, [path, setLocation]);

  return null;
}