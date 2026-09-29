import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hirerecall_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data.success && res.data.recruiter) {
            setUser(res.data.recruiter);
          } else {
            handleDemoFallback();
          }
        } catch (err) {
          console.warn('Token validation notice, applying default recruiter:', err.message);
          handleDemoFallback();
        }
      } else {
        // Auto-seed default recruiter for instant hackathon review
        handleDemoFallback();
      }
      setLoading(false);
    }

    loadUser();
  }, [token]);

  const handleDemoFallback = () => {
    const demoUser = {
      id: 'rec_priya_01',
      name: 'Priya Sharma',
      email: 'priya.sharma@hirerecall.ai',
      role: 'Senior Tech Recruiter & Bar Raiser',
      preferences: {
        focus: 'Practical coding, System Design, Communication',
        style: 'Scenario-based, Real-world architecture problems'
      }
    };
    setUser(demoUser);
  };

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('hirerecall_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.recruiter);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const demoLogin = async () => {
    try {
      const res = await authApi.demoLogin();
      if (res.data.success) {
        localStorage.setItem('hirerecall_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.recruiter);
        return res.data;
      }
    } catch (err) {
      handleDemoFallback();
    }
  };

  const logout = () => {
    localStorage.removeItem('hirerecall_token');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (prefs) => {
    try {
      const res = await authApi.updatePreferences(prefs);
      if (res.data.success) {
        setUser(res.data.recruiter);
        return res.data.recruiter;
      }
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
