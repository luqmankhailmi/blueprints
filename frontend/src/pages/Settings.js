import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, LogOut, Github, Palette } from 'lucide-react';
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Account</h2>
          <div className="settings-card">
            <div className="user-profile">
              <div className="avatar-large">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Actions</h2>
          <div className="settings-card">
            <button className="settings-item" onClick={handleLogout}>
              <div className="item-left">
                <LogOut size={20} />
                <div>
                  <h3>Logout</h3>
                  <p>Sign out of your account</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Integrations</h2>
          <div className="settings-card">
            <div className="settings-item disabled">
              <div className="item-left">
                <Github size={20} />
                <div>
                  <h3>Connect GitHub</h3>
                  <p>Import projects directly from GitHub</p>
                </div>
              </div>
              <span className="badge">Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="settings-card">
            <div className="settings-item disabled">
              <div className="item-left">
                <Palette size={20} />
                <div>
                  <h3>Theme</h3>
                  <p>Customize the app appearance</p>
                </div>
              </div>
              <span className="badge">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
