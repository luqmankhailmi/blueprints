import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { githubAPI } from '../services/api';

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('GitHub authentication was cancelled or failed');
        setTimeout(() => navigate('/settings'), 3000);
        return;
      }

      if (code) {
        try {
          await githubAPI.connect(code);
          navigate('/settings');
        } catch (error) {
          console.error('GitHub connection failed:', error);
          setError('Failed to connect GitHub account');
          setTimeout(() => navigate('/settings'), 3000);
        }
      } else {
        setError('No authorization code received');
        setTimeout(() => navigate('/settings'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
      color: '#fff',
      fontSize: '18px',
      gap: '16px'
    }}>
      {error ? (
        <>
          <div style={{ color: '#ff556c' }}>{error}</div>
          <div style={{ fontSize: '14px', opacity: 0.6 }}>Redirecting to settings...</div>
        </>
      ) : (
        <>
          <div>Connecting GitHub...</div>
          <div style={{ fontSize: '14px', opacity: 0.6 }}>Please wait</div>
        </>
      )}
    </div>
  );
};

export default GitHubCallback;
