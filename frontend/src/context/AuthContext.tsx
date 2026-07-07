import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  income: number;
  theme: 'light' | 'dark';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUserIncome: (income: number) => Promise<boolean>;
  toggleTheme: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('moneymap_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize theme based on user profile or default
  const applyTheme = (themeMode: 'light' | 'dark') => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/me');
      const profile = response.data;
      const formattedProfile: UserProfile = {
        id: profile._id || profile.id,
        name: profile.name,
        email: profile.email,
        income: profile.income,
        theme: profile.theme || 'light',
      };
      setUser(formattedProfile);
      applyTheme(formattedProfile.theme);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
      // Default theme if not logged in
      applyTheme('light');
    }
  }, [token]);

  const login = (newToken: string, loggedInUser: UserProfile) => {
    localStorage.setItem('moneymap_token', newToken);
    setToken(newToken);
    setUser(loggedInUser);
    applyTheme(loggedInUser.theme);
  };

  const logout = () => {
    localStorage.removeItem('moneymap_token');
    setToken(null);
    setUser(null);
    applyTheme('light'); // Reset theme to light on logout
  };

  const updateUserIncome = async (newIncome: number): Promise<boolean> => {
    try {
      const response = await api.put('/users/income', { income: newIncome });
      if (user) {
        setUser({ ...user, income: response.data.user.income });
      }
      return true;
    } catch (error) {
      console.error('Error updating income in DB:', error);
      return false;
    }
  };

  const toggleTheme = async () => {
    if (!user) return;
    const targetTheme = user.theme === 'light' ? 'dark' : 'light';
    try {
      // Optimistically apply
      applyTheme(targetTheme);
      setUser({ ...user, theme: targetTheme });
      
      // Update DB
      await api.put('/users/theme', { theme: targetTheme });
    } catch (error) {
      console.error('Error saving theme preference to database:', error);
      // Revert if API fails
      applyTheme(user.theme);
      setUser(user);
    }
  };

  const refreshUserProfile = async () => {
    if (token) {
      await fetchUserProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUserIncome,
        toggleTheme,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
