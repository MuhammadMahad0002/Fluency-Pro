import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import PracticePage from './pages/PracticePage';
import './App.css';

// Session Timeout Modal Component
const SessionTimeoutModal = () => {
  const { sessionExpired, timeoutMessage, clearSessionExpired } = useAuth();
  const navigate = useNavigate();

  if (!sessionExpired) return null;

  const handleLoginRedirect = () => {
    clearSessionExpired();
    navigate('/login');
  };

  return (
    <div className="timeout-overlay">
      <div className="timeout-modal">
        <div className="timeout-icon">⏰</div>
        <h2>Session Expired</h2>
        <p>{timeoutMessage}</p>
        <button className="btn btn-primary" onClick={handleLoginRedirect}>
          Login Again
        </button>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route - redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function AppContent() {
  return (
    <div className="app">
      <SessionTimeoutModal />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/practice" 
          element={
            <ProtectedRoute>
              <PracticePage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Analytics />
      </Router>
    </AuthProvider>
  );
}

export default App;
