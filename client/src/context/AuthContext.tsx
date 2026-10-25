// ============================================================================
// AUTHENTICATION CONTEXT (React Context + Hooks)
// Manages global authentication state, token persistence, and login/logout flows
// ============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi, getAuthToken, setAuthToken, clearAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check existing session on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        setUser(response.user);
        setTokenState(storedToken);
      } catch (error) {
        console.warn('Existing session invalid or expired:', error);
        clearAuthToken();
        setUser(null);
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for unauthorized 401 events emitted by central API service
    const handleUnauthorized = () => {
      setUser(null);
      setTokenState(null);
    };

    window.addEventListener('taskora_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('taskora_unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      setAuthToken(response.token);
      setTokenState(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    clearAuthToken();
    setUser(null);
    setTokenState(null);
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.register({ name, email, password });
      setAuthToken(response.token);
      setTokenState(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
