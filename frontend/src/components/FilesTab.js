import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

const FilesTab = ({ projectId, architecture }) => {
  const [expanded, setExpanded] = useState({});

  if (!architecture?.directory?.structure) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <Folder size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>Loading directory structure...</p>
      </div>
    );
  }

  const toggleExpand = (path) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i];
  };

  const renderNode = (node, level = 0) => {
    const isExpanded = expanded[node.path];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.path} style={{ marginLeft: `${level * 20}px` }}>
        <div
          onClick={() => hasChildren && toggleExpand(node.path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: hasChildren ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {hasChildren && (
            <div style={{ color: '#00d9ff' }}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
          {!hasChildren && <div style={{ width: '16px' }} />}
          {node.type === 'directory' ? (
            <Folder size={16} style={{ color: '#ff9f43' }} />
          ) : (
            <File size={16} style={{ color: '#a29bfe' }} />
          )}
          <span style={{ color: '#fff', fontSize: '14px', flex: 1 }}>{node.name}</span>
          {node.size && (
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              {formatBytes(node.size)}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>Directory Structure</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          {architecture.directory.stats.totalFiles} files • {architecture.directory.stats.totalDirectories} directories
        </p>
      </div>

      <div
        style={{
          background: 'rgba(26, 31, 53, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 217, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          maxHeight: '600px',
          overflowY: 'auto',
        }}
      >
        {architecture.directory.structure && renderNode(architecture.directory.structure)}
      </div>
    </div>
  );
};

export default FilesTab;
