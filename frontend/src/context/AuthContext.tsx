import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, baseCurrency?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('finora_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('finora_auth_token');
      if (storedToken) {
        try {
          const response = await apiClient.get<UserProfile>('/auth/me');
          setUser(response.data);
          localStorage.setItem('finora_user_profile', JSON.stringify(response.data));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ token: string; user: UserProfile }>('/auth/login', {
      email,
      password,
    });

    const receivedToken = response.data.token;
    const receivedUser = response.data.user;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('finora_auth_token', receivedToken);
    localStorage.setItem('finora_user_profile', JSON.stringify(receivedUser));
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    baseCurrency: string = 'INR'
  ) => {
    const response = await apiClient.post<{ token: string; user: UserProfile }>('/auth/register', {
      email,
      password,
      fullName,
      baseCurrency,
    });

    const receivedToken = response.data.token;
    const receivedUser = response.data.user;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('finora_auth_token', receivedToken);
    localStorage.setItem('finora_user_profile', JSON.stringify(receivedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('finora_auth_token');
    localStorage.removeItem('finora_user_profile');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const response = await apiClient.get<UserProfile>('/auth/me');
      setUser(response.data);
      localStorage.setItem('finora_user_profile', JSON.stringify(response.data));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
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
