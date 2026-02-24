import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initialized, loading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === 'share';

    if (!user && !inAuthGroup && !inPublicGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect authenticated users away from auth screens
      // index.tsx will handle routing to onboarding vs tabs
      router.replace('/');
    }
  }, [user, initialized, loading, segments, router]);

  // Show loading spinner while initializing
  if (!initialized || loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return <>{children}</>;
};
