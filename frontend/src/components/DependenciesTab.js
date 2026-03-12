import React, { useState } from 'react';
import { Package, Search, ExternalLink } from 'lucide-react';

const DependenciesTab = ({ projectId, architecture }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!architecture?.dependencies) {
    return (
      <div className="empty-state">
        <Package size={48} />
        <p>Loading dependencies...</p>
      </div>
    );
  }

  const { dependencies, devDependencies, categories, totalCount } = architecture.dependencies;

  const allDeps = [...(dependencies || []), ...(devDependencies || [])];

  const filteredDeps = allDeps.filter(dep => {
    const matchesSearch = !searchTerm || 
      dep.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || dep.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryColor = (category) => {
    const colors = {
      'UI/Components': '#61dafb',
      'Framework': '#f7df1e',
      'Database': '#47a248',
      'Testing': '#944058',
      'Build Tools': '#f16529',
      'State Management': '#764abc',
      'Routing': '#ca4245',
      'HTTP/API': '#5ed4f4',
    };
    return colors[category] || '#888';
  };

  return (
    <div className="dependencies-tab">
      {/* Header Stats */}
      <div className="dep-stats">
        <div className="dep-stat">
          <span className="dep-stat-value">{totalCount}</span>
          <span className="dep-stat-label">Total Packages</span>
        </div>
        <div className="dep-stat">
          <span className="dep-stat-value">{dependencies?.length || 0}</span>
          <span className="dep-stat-label">Dependencies</span>
        </div>
        <div className="dep-stat">
          <span className="dep-stat-value">{devDependencies?.length || 0}</span>
          <span className="dep-stat-label">Dev Dependencies</span>
        </div>
        <div className="dep-stat">
          <span className="dep-stat-value">{categories?.length || 0}</span>
          <span className="dep-stat-label">Categories</span>
        </div>
      </div>

      {/* Filters */}
      <div className="dep-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            className={filter === 'dependency' ? 'active' : ''}
            onClick={() => setFilter('dependency')}
          >
            Production ({dependencies?.length || 0})
          </button>
          <button
            className={filter === 'devDependency' ? 'active' : ''}
            onClick={() => setFilter('devDependency')}
          >
            Development ({devDependencies?.length || 0})
          </button>
        </div>
      </div>

      <div className="dep-content">
        {/* Categories */}
        <div className="dep-categories">
          <h3>Categories</h3>
          {categories && categories.length > 0 ? (
            <div className="category-list">
              {categories.map((cat, i) => (
                <div 
                  key={i} 
                  className="category-item"
                  style={{ borderLeftColor: getCategoryColor(cat.name) }}
                >
                  <div className="category-header">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">{cat.count}</span>
                  </div>
                  <div className="category-packages">
                    {cat.packages.slice(0, 3).map((pkg, j) => (
                      <span key={j} className="package-tag">
                        {pkg.name}
                      </span>
                    ))}
                    {cat.count > 3 && (
                      <span className="package-more">+{cat.count - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No categories found</p>
          )}
        </div>

        {/* Package List */}
        <div className="dep-list-panel">
          <h3>All Packages ({filteredDeps.length})</h3>
          <div className="dep-list">
            {filteredDeps.map((dep, i) => (
              <div key={i} className="dep-item">
                <div className="dep-item-header">
                  <div className="dep-name">
                    <Package size={16} />
                    <span>{dep.name}</span>
                  </div>
                  <a
                    href={`https://www.npmjs.com/package/${dep.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dep-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
                <div className="dep-item-meta">
                  <span className="dep-version">{dep.version}</span>
                  <span className={`dep-type type-${dep.type}`}>
                    {dep.type === 'dependency' ? 'Production' : 'Development'}
                  </span>
                  {dep.category && (
                    <span 
                      className="dep-category"
                      style={{ backgroundColor: getCategoryColor(dep.category) }}
                    >
                      {dep.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DependenciesTab;
