import React from 'react';
import { Package, Box } from 'lucide-react';

const DependenciesTab = ({ architecture }) => {
  if (!architecture?.dependencies) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <Package size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>Loading dependencies...</p>
      </div>
    );
  }

  const deps = architecture.dependencies;

  if (deps.error || deps.totalCount === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <Package size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>No package.json found in this project</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>Dependencies</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          {deps.totalCount} total packages • {deps.dependencyCount} production • {deps.devDependencyCount} development
        </p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {Object.entries(deps.dependencies || {}).map(([category, packages]) => (
          packages.length > 0 && (
            <div
              key={category}
              style={{
                background: 'rgba(26, 31, 53, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 217, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Box size={20} style={{ color: '#00d9ff' }} />
                <h3 style={{ fontSize: '18px', color: '#fff' }}>{category}</h3>
                <span style={{ 
                  marginLeft: 'auto',
                  padding: '4px 12px',
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#00d9ff'
                }}>
                  {packages.length}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {packages.map((pkg, index) => (
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
                    <span style={{ color: '#fff', fontFamily: 'Monaco, monospace', fontSize: '13px' }}>
                      {pkg.name}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                      {pkg.version}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default DependenciesTab;
