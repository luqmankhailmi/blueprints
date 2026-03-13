import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AIAnalysisButton = ({ projectId, onAnalysisComplete }) => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [aiStatus, setAiStatus] = useState(null);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);

  const fetchAIStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/projects/${projectId}/ai-status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAiStatus(response.data);
    } catch (err) {
      console.error('Failed to fetch AI status:', err);
      // Set a safe default so the button still renders
      setAiStatus({ groqConfigured: false, aiAnalyzed: false });
    }
  }, [projectId]);

  useEffect(() => {
    fetchAIStatus();
  }, [fetchAIStatus]);

  const executeAIAnalysis = async () => {
    setStatus('loading');
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/projects/${projectId}/ai-analyze`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStatus('success');
      setInsights(response.data.insights);

      // Notify parent component to refresh data
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data.techStack);
      }

      // Update AI status
      await fetchAIStatus();

      // Auto-reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);

    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.error || 'AI analysis failed');

      // Auto-reset error after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setError(null);
      }, 5000);
    }
  };

  if (!aiStatus) {
    return null; // Loading status
  }

  if (!aiStatus.groqConfigured) {
    return (
      <div style={{
        padding: '12px 16px',
        background: 'rgba(255, 193, 7, 0.1)',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#ffc107'
      }}>
        <AlertCircle size={16} />
        <span>AI analysis not configured (GROQ_API_KEY missing)</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={executeAIAnalysis}
          disabled={status === 'loading'}
          style={{
            padding: '12px 24px',
            background: status === 'success'
              ? 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)'
              : status === 'error'
                ? 'linear-gradient(135deg, #d63031 0%, #ff7675 100%)'
                : 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            opacity: status === 'loading' ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
          }}
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing with AI...</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle size={18} />
              <span>Analysis Complete!</span>
            </>
          ) : status === 'error' ? (
            <>
              <AlertCircle size={18} />
              <span>Analysis Failed</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Execute AI Analysis</span>
            </>
          )}
        </button>

        {aiStatus.aiAnalyzed && (
          <div style={{
            padding: '8px 16px',
            background: 'rgba(0, 184, 148, 0.15)',
            border: '1px solid rgba(0, 184, 148, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#00b894'
          }}>
            <CheckCircle size={14} />
            <span>AI Enhanced</span>
          </div>
        )}
      </div>

      {/* Model Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
        <Sparkles size={14} style={{ color: '#a29bfe' }} />
        <span>Model: <strong style={{ color: '#a29bfe' }}>Llama 3.3 70B</strong> (via Groq)</span>
      </div>

      {/* Last Analysis Date */}
      {aiStatus.aiAnalyzed && aiStatus.aiAnalysisDate && (
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          Last analyzed: {new Date(aiStatus.aiAnalysisDate).toLocaleString()}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
          background: 'rgba(214, 48, 49, 0.1)',
          border: '1px solid rgba(214, 48, 49, 0.3)',
          borderRadius: '8px',
          color: '#ff7675',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {/* Insights */}
      {insights && (
        <div style={{
          marginTop: '12px',
          padding: '16px',
          background: 'rgba(162, 155, 254, 0.1)',
          border: '1px solid rgba(162, 155, 254, 0.2)',
          borderRadius: '12px',
        }}>
          <h4 style={{
            fontSize: '14px',
            color: '#a29bfe',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} />
            AI Insights
          </h4>

          {insights.architecture && (
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Architecture:</strong>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginTop: '4px' }}>
                {insights.architecture}
              </p>
            </div>
          )}

          {insights.patterns && insights.patterns.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Patterns Detected:</strong>
              <ul style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginTop: '4px', paddingLeft: '20px' }}>
                {insights.patterns.map((pattern, i) => (
                  <li key={i}>{pattern}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.recommendations && insights.recommendations.length > 0 && (
            <div>
              <strong style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Recommendations:</strong>
              <ul style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginTop: '4px', paddingLeft: '20px' }}>
                {insights.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AIAnalysisButton;