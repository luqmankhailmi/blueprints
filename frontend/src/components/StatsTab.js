import React from 'react';
import { BarChart3, PieChart, FileText } from 'lucide-react';

const StatsTab = ({ architecture }) => {
  if (!architecture?.directory?.stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <BarChart3 size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>Calculating statistics...</p>
      </div>
    );
  }

  const stats = architecture.directory.stats;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>Project Statistics</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Detailed metrics and insights about your project
        </p>
      </div>

      {/* File Types */}
      <div
        style={{
          background: 'rgba(26, 31, 53, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 217, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <FileText size={20} style={{ color: '#00d9ff' }} />
          <h3 style={{ fontSize: '18px', color: '#fff' }}>Files by Extension</h3>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(stats.filesByExtension || {})
            .sort((a, b) => b[1] - a[1])
            .map(([ext, count]) => {
              const percentage = ((count / stats.totalFiles) * 100).toFixed(1);
              return (
                <div key={ext} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '60px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontFamily: 'Monaco, monospace' }}>
                    {ext || 'none'}
                  </div>
                  <div style={{ flex: 1, height: '24px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #00d9ff, #0088cc)',
                        borderRadius: '12px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ width: '80px', textAlign: 'right', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                    {count} ({percentage}%)
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Largest Files */}
      {stats.largestFiles && stats.largestFiles.length > 0 && (
        <div
          style={{
            background: 'rgba(26, 31, 53, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 217, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <BarChart3 size={20} style={{ color: '#ff9f43' }} />
            <h3 style={{ fontSize: '18px', color: '#fff' }}>Largest Files</h3>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {stats.largestFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                }}
              >
                <span style={{ color: '#fff', fontSize: '13px', fontFamily: 'Monaco, monospace', flex: 1 }}>
                  {file.name}
                </span>
                <span style={{ color: '#ff9f43', fontSize: '13px', fontWeight: '600', marginLeft: '16px' }}>
                  {formatBytes(file.size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsTab;
