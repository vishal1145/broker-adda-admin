'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token in localStorage on mount
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('adminToken');
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
          // Also set cookie for server-side middleware
          document.cookie = `adminToken=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (newToken: string) => {
    try {
      localStorage.setItem('adminToken', newToken);
      setToken(newToken);
      setIsAuthenticated(true);
      // Also set cookie for server-side middleware
      document.cookie = `adminToken=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('adminToken');
      setToken(null);
      setIsAuthenticated(false);
      // Also clear cookie
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/login');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
