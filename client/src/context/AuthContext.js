import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Inactivity timeout duration (5 minutes in milliseconds)
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [timeoutMessage, setTimeoutMessage] = useState('');
  
  const inactivityTimerRef = useRef(null);
  const isAuthenticatedRef = useRef(false);

  // Update ref when auth state changes
  useEffect(() => {
    isAuthenticatedRef.current = !!user;
  }, [user]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticatedRef.current) return;
    
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      if (isAuthenticatedRef.current) {
        // Logout due to inactivity
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setSessionExpired(true);
        setTimeoutMessage('Your session has expired due to 5 minutes of inactivity. Please login again to continue.');
      }
    }, INACTIVITY_TIMEOUT);
  }, []);

  // Set up activity listeners when authenticated
  useEffect(() => {
    if (user) {
      // Activity events to track
      const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
      
      // Throttle the reset to avoid too many calls
      let lastActivity = Date.now();
      const throttledReset = () => {
        const now = Date.now();
        if (now - lastActivity > 1000) { // Only reset if more than 1 second passed
          lastActivity = now;
          resetInactivityTimer();
        }
      };
      
      // Add event listeners
      activityEvents.forEach(event => {
        document.addEventListener(event, throttledReset, { passive: true });
      });
      
      // Start the timer
      resetInactivityTimer();
      
      // Cleanup
      return () => {
        activityEvents.forEach(event => {
          document.removeEventListener(event, throttledReset);
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    }
  }, [user, resetInactivityTimer]);

  // Clear session expired message
  const clearSessionExpired = () => {
    setSessionExpired(false);
    setTimeoutMessage('');
  };

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (firstName, lastName, email, password) => {
    try {
      const response = await axios.post('/api/auth/signup', { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    sessionExpired,
    timeoutMessage,
    login,
    signup,
    logout,
    clearSessionExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
