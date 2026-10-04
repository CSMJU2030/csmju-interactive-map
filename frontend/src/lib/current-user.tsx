'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { CurrentUser } from '@/types/api';
import { renewSignIn } from './sign-in';
import { ApiError } from './api';

type CurrentUserContextValue = {
  user: CurrentUser | null;
  isAdmin: boolean;
  canManage: boolean;
  loading: boolean;
};

const CurrentUserContext = createContext<CurrentUserContextValue>({
  user: null,
  isAdmin: false,
  canManage: false,
  loading: true,
});

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void apiRequest<CurrentUser>('/api/v1/me')
      .then((response) => {
        if (active) {
          setUser(response.data);
          sessionStorage.setItem('csmju_signed_in', 'true');
          sessionStorage.removeItem('csmju_sso_attempt');
        }
      })
      .catch((error: unknown) => {
        if (active) setUser(null);
        if (error instanceof ApiError && error.status === 401 && sessionStorage.getItem('csmju_signed_in') && !window.location.pathname.startsWith('/signin-again')) renewSignIn();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin: user?.subsystemRole === 'ADMIN', canManage: user?.subsystemRole === 'ADMIN' || user?.subsystemRole === 'STAFF', loading }),
    [loading, user],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
