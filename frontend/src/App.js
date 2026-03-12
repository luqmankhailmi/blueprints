import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import GitHubCallback from './pages/GitHubCallback';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import FlowVisualization from './pages/FlowVisualization';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
      color: '#fff'
    }}>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
      color: '#fff'
    }}>Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route 
            path="/settings/github/callback" 
            element={
              <ProtectedRoute>
                <GitHubCallback />
              </ProtectedRoute>
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
            path="/project/:id" 
            element={
              <ProtectedRoute>
                <Project />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/flow/:id" 
            element={
              <ProtectedRoute>
                <FlowVisualization />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
