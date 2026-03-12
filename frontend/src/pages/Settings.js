import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { githubAPI } from '../services/api';
import { ArrowLeft, LogOut, Github, Palette, CheckCircle } from 'lucide-react';
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [githubStatus, setGithubStatus] = useState({ connected: false, github_username: null });

  useEffect(() => {
    checkGitHubStatus();
  }, []);

  const checkGitHubStatus = async () => {
    try {
      const response = await githubAPI.getStatus();
      setGithubStatus(response.data);
    } catch (error) {
      console.error('Failed to check GitHub status:', error);
    }
  };

  const handleGitHubConnect = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
    const redirectUri = `${window.location.origin}/settings/github/callback`;
    const scope = 'repo read:user';
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const handleGitHubDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect GitHub?')) {
      try {
        await githubAPI.disconnect();
        setGithubStatus({ connected: false, github_username: null });
      } catch (error) {
        console.error('Failed to disconnect GitHub:', error);
        alert('Failed to disconnect GitHub');
      }
    }
  };

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
            <div className="settings-item" onClick={githubStatus.connected ? null : handleGitHubConnect} style={{ cursor: githubStatus.connected ? 'default' : 'pointer' }}>
              <div className="item-left">
                <Github size={20} />
                <div>
                  <h3>Connect GitHub</h3>
                  <p>
                    {githubStatus.connected 
                      ? `Connected as ${githubStatus.github_username}`
                      : 'Import projects directly from GitHub'}
                  </p>
                </div>
              </div>
              {githubStatus.connected ? (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <CheckCircle size={20} color="#00ff87" />
                  <button 
                    className="btn-disconnect" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGitHubDisconnect();
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <span className="badge badge-action">Connect</span>
              )}
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
