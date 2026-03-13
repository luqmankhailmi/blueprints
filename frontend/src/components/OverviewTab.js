import React from 'react';
import { Activity, FileCode, Package, Layers, GitBranch, Calendar, Sparkles } from 'lucide-react';
import AIAnalysisButton from './AIAnalysisButton';

const OverviewTab = ({ project, architecture, flows, projectId, onAnalysisComplete }) => {
  if (!architecture) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <Activity size={40} />
        <p style={{ marginTop: '16px' }}>Loading architecture overview...</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Files',
      value: architecture.directory?.stats?.totalFiles || 0,
      icon: <FileCode size={24} />,
      color: '#00d9ff'
    },
    {
      label: 'Dependencies',
      value: architecture.dependencies?.totalCount || 0,
      icon: <Package size={24} />,
      color: '#a29bfe'
    },
    {
      label: 'API Endpoints',
      value: flows.length,
      icon: <GitBranch size={24} />,
      color: '#00b894'
    },
    {
      label: 'Directories',
      value: architecture.directory?.stats?.totalDirectories || 0,
      icon: <Layers size={24} />,
      color: '#ff9f43'
    },
  ];

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>Project Overview</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          A comprehensive analysis of your project's architecture and structure
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(26, 31, 53, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 217, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>
              {stat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Tech Stack Quick View */}
      {architecture.techStack?.framework && (
        <div style={{
          background: 'rgba(26, 31, 53, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 217, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#fff' }}>Tech Stack</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {architecture.techStack.framework && (
              <div style={{
                padding: '8px 16px',
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '8px',
                color: '#00d9ff',
                fontSize: '14px'
              }}>
                {architecture.techStack.framework.name}
              </div>
            )}
            {architecture.techStack.language && (
              <div style={{
                padding: '8px 16px',
                background: 'rgba(162, 155, 254, 0.1)',
                border: '1px solid rgba(162, 155, 254, 0.3)',
                borderRadius: '8px',
                color: '#a29bfe',
                fontSize: '14px'
              }}>
                {architecture.techStack.language}
              </div>
            )}
            {architecture.techStack.database && architecture.techStack.database.map((db, i) => (
              <div key={i} style={{
                padding: '8px 16px',
                background: 'rgba(0, 184, 148, 0.1)',
                border: '1px solid rgba(0, 184, 148, 0.3)',
                borderRadius: '8px',
                color: '#00b894',
                fontSize: '14px'
              }}>
                {db}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Info */}
      <div style={{
        background: 'rgba(26, 31, 53, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 217, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#fff' }}>Project Information</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Total Size</span>
            <span style={{ color: '#fff', fontWeight: '500' }}>{formatBytes(architecture.directory?.stats?.totalSize)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Source Type</span>
            <span style={{ color: '#fff', fontWeight: '500' }}>{project.source_type === 'github' ? 'GitHub Repository' : 'Uploaded ZIP'}</span>
          </div>
          {project.uploaded_at && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Analyzed On</span>
              <span style={{ color: '#fff', fontWeight: '500' }}>{new Date(project.uploaded_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Section */}
      <div style={{
        background: 'rgba(26, 31, 53, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(162, 155, 254, 0.2)',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={20} style={{ color: '#a29bfe' }} />
          <h3 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>AI Analysis</h3>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
          Runs Llama 3.3 70B on your actual code files to detect technologies, architecture patterns, and improvement recommendations beyond what basic analysis can find.
        </p>
        <AIAnalysisButton projectId={projectId} onAnalysisComplete={onAnalysisComplete} />
      </div>
    </div>
  );
};

export default OverviewTab;