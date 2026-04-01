import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Auth initialization + global loading overlay only.
 * Do not call router.replace here — it fights React Navigation + segment subscriptions and can
 * reach maximum update depth. Use `<Redirect />` in group layouts (see `(auth)` / `(tabs)` / onboarding).
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { initialized, loading, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  return (
    <>
      {children}
      {(!initialized || loading) && <LoadingSpinner message="Loading..." />}
    </>
  );
};
