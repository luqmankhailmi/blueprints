import React from 'react';
import { 
  FileCode, Package, Code2, Database, Layers, 
  FolderTree, BarChart3, Zap, CheckCircle 
} from 'lucide-react';

const OverviewTab = ({ project, architecture, flows }) => {
  if (!architecture) {
    return (
      <div className="empty-state">
        <BarChart3 size={48} />
        <p>Loading architecture overview...</p>
      </div>
    );
  }

  const { directory, dependencies, techStack } = architecture;

  // Quick stats
  const stats = [
    {
      icon: <FileCode size={24} />,
      label: 'Total Files',
      value: directory?.stats?.totalFiles || 0,
      color: 'blue'
    },
    {
      icon: <BarChart3 size={24} />,
      label: 'Lines of Code',
      value: (directory?.stats?.totalLines || 0).toLocaleString(),
      color: 'green'
    },
    {
      icon: <Package size={24} />,
      label: 'Dependencies',
      value: dependencies?.totalCount || 0,
      color: 'purple'
    },
    {
      icon: <Zap size={24} />,
      label: 'API Endpoints',
      value: flows?.length || 0,
      color: 'orange'
    }
  ];

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="overview-tab">
      {/* Quick Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-grid">
        {/* Tech Stack Summary */}
        <div className="overview-section">
          <h3>
            <Code2 size={20} />
            Technology Stack
          </h3>
          <div className="tech-badges">
            {techStack?.frontend?.map((tech, i) => (
              <span key={i} className="tech-badge frontend">
                {tech.name}
              </span>
            ))}
            {techStack?.backend?.map((tech, i) => (
              <span key={i} className="tech-badge backend">
                {tech.name}
              </span>
            ))}
            {techStack?.database?.map((tech, i) => (
              <span key={i} className="tech-badge database">
                {tech.name}
              </span>
            ))}
            {techStack?.buildTools?.map((tool, i) => (
              <span key={i} className="tech-badge build">
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="overview-section">
          <h3>
            <Layers size={20} />
            Programming Languages
          </h3>
          <div className="language-list">
            {techStack?.languages?.map((lang, i) => (
              <div key={i} className="language-item">
                <span className="language-name">{lang.name}</span>
                <span className="language-count">{lang.files} files</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entry Points */}
        <div className="overview-section">
          <h3>
            <FolderTree size={20} />
            Entry Points
          </h3>
          <div className="entry-points-list">
            {directory?.entryPoints && directory.entryPoints.length > 0 ? (
              directory.entryPoints.map((entry, i) => (
                <div key={i} className="entry-point">
                  <FileCode size={16} />
                  <span className="entry-path">{entry.path}</span>
                  <span className={`entry-type type-${entry.type}`}>
                    {entry.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-text">No entry points detected</p>
            )}
          </div>
        </div>

        {/* Project Info */}
        <div className="overview-section">
          <h3>
            <CheckCircle size={20} />
            Project Information
          </h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Project Name</span>
              <span className="info-value">{dependencies?.name || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Version</span>
              <span className="info-value">{dependencies?.version || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Size</span>
              <span className="info-value">
                {formatSize(directory?.stats?.totalSize || 0)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Description</span>
              <span className="info-value">
                {dependencies?.description || 'No description'}
              </span>
            </div>
          </div>
        </div>

        {/* File Type Breakdown */}
        <div className="overview-section">
          <h3>
            <FileCode size={20} />
            File Types
          </h3>
          <div className="file-types-list">
            {directory?.stats?.filesByType && 
             Object.entries(directory.stats.filesByType)
               .sort((a, b) => b[1] - a[1])
               .slice(0, 8)
               .map(([ext, count], i) => (
                 <div key={i} className="file-type-item">
                   <span className="file-ext">{ext}</span>
                   <span className="file-count">{count} files</span>
                 </div>
               ))}
          </div>
        </div>

        {/* Frameworks Detected */}
        <div className="overview-section">
          <h3>
            <Database size={20} />
            Frameworks & Libraries
          </h3>
          <div className="frameworks-list">
            {dependencies?.framework && dependencies.framework.length > 0 ? (
              dependencies.framework.map((fw, i) => (
                <div key={i} className="framework-item">
                  <CheckCircle size={16} className="check-icon" />
                  <span>{fw}</span>
                </div>
              ))
            ) : (
              <p className="empty-text">No frameworks detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
