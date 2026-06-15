import { createContext, useState, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('esrms_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        sessionStorage.removeItem('esrms_user');
      }
    }
    return null;
  });

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const userData = response.data;
    setUser(userData);
    sessionStorage.setItem('esrms_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('esrms_user');
  };

  const value = {
    user,
    login,
    logout,
    loading: false,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
