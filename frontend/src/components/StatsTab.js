import React from 'react';
import { BarChart3, PieChart, FileCode, Package, TrendingUp } from 'lucide-react';

const StatsTab = ({ architecture }) => {
  if (!architecture?.directory?.stats) {
    return (
      <div className="empty-state">
        <BarChart3 size={48} />
        <p>Loading statistics...</p>
      </div>
    );
  }

  const { stats } = architecture.directory;
  const depStats = architecture.dependencies;

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Calculate percentages for file types
  const fileTypeData = stats.filesByType 
    ? Object.entries(stats.filesByType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([ext, count]) => ({
          ext,
          count,
          percentage: (count / stats.totalFiles * 100).toFixed(1)
        }))
    : [];

  // Calculate dependency categories
  const depCategoryData = depStats?.categories
    ? depStats.categories.slice(0, 8)
    : [];

  return (
    <div className="stats-tab">
      <div className="stats-header">
        <h2>Project Statistics</h2>
        <p>Detailed metrics and analysis of your project</p>
      </div>

      {/* Key Metrics */}
      <div className="stats-metrics">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#3b82f6' }}>
            <FileCode size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{formatNumber(stats.totalFiles)}</span>
            <span className="metric-label">Total Files</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{formatNumber(stats.totalLines)}</span>
            <span className="metric-label">Lines of Code</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#8b5cf6' }}>
            <Package size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{formatNumber(depStats?.totalCount)}</span>
            <span className="metric-label">Dependencies</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#f59e0b' }}>
            <BarChart3 size={24} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{formatSize(stats.totalSize)}</span>
            <span className="metric-label">Total Size</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {/* File Types Chart */}
        <div className="stats-chart">
          <h3>
            <PieChart size={20} />
            File Types Distribution
          </h3>
          <div className="chart-container">
            {fileTypeData.map((item, i) => (
              <div key={i} className="chart-bar-item">
                <div className="chart-bar-label">
                  <span className="chart-ext">{item.ext}</span>
                  <span className="chart-count">{item.count}</span>
                </div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: `hsl(${i * 36}, 70%, 60%)`
                    }}
                  />
                  <span className="chart-percentage">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Largest Files */}
        <div className="stats-chart">
          <h3>
            <FileCode size={20} />
            Largest Files
          </h3>
          <div className="largest-files-list">
            {stats.largestFiles && stats.largestFiles.slice(0, 10).map((file, i) => (
              <div key={i} className="largest-file-item">
                <span className="file-rank">#{i + 1}</span>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-path">{file.path}</span>
                </div>
                <span className="file-size">{formatSize(file.size)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dependency Categories */}
        <div className="stats-chart">
          <h3>
            <Package size={20} />
            Dependency Categories
          </h3>
          <div className="chart-container">
            {depCategoryData.map((cat, i) => (
              <div key={i} className="chart-bar-item">
                <div className="chart-bar-label">
                  <span className="chart-category">{cat.name}</span>
                  <span className="chart-count">{cat.count}</span>
                </div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ 
                      width: `${(cat.count / depStats.totalCount * 100)}%`,
                      backgroundColor: `hsl(${i * 45}, 65%, 55%)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Overview */}
        <div className="stats-chart">
          <h3>
            <BarChart3 size={20} />
            Project Overview
          </h3>
          <div className="overview-stats">
            <div className="overview-stat">
              <span className="overview-label">Average File Size</span>
              <span className="overview-value">
                {formatSize(stats.totalSize / stats.totalFiles)}
              </span>
            </div>
            <div className="overview-stat">
              <span className="overview-label">Average Lines per File</span>
              <span className="overview-value">
                {Math.round(stats.totalLines / stats.totalFiles)}
              </span>
            </div>
            <div className="overview-stat">
              <span className="overview-label">Production Dependencies</span>
              <span className="overview-value">
                {depStats?.dependencyCount || 0}
              </span>
            </div>
            <div className="overview-stat">
              <span className="overview-label">Dev Dependencies</span>
              <span className="overview-value">
                {depStats?.devDependencyCount || 0}
              </span>
            </div>
            <div className="overview-stat">
              <span className="overview-label">Total File Types</span>
              <span className="overview-value">
                {Object.keys(stats.filesByType || {}).length}
              </span>
            </div>
            <div className="overview-stat">
              <span className="overview-label">Dependency Categories</span>
              <span className="overview-value">
                {depStats?.categories?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
