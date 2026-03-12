import React, { useState } from 'react';
import { Package, Box, ChevronDown, ChevronRight, FileCode } from 'lucide-react';

const DependenciesTab = ({ architecture }) => {
  const [expandedPackage, setExpandedPackage] = useState(null);

  if (!architecture?.dependencies) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <Package size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>Loading dependencies...</p>
      </div>
    );
  }

  const deps = architecture.dependencies;

  if (deps.error || !deps.packageFiles || deps.packageFiles.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <Package size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>No package.json files found in this project</p>
      </div>
    );
  }

  const togglePackage = (index) => {
    setExpandedPackage(expandedPackage === index ? null : index);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>Dependencies</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          {deps.packageFiles.length} package.json file{deps.packageFiles.length !== 1 ? 's' : ''} found • {deps.totalCount} total packages
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {deps.packageFiles.map((packageFile, pkgIndex) => (
          <div
            key={pkgIndex}
            style={{
              background: 'rgba(26, 31, 53, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 217, 255, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Package File Header - Clickable */}
            <div
              onClick={() => togglePackage(pkgIndex)}
              style={{
                padding: '20px 24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: expandedPackage === pkgIndex ? '1px solid rgba(0, 217, 255, 0.1)' : 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ color: '#00d9ff' }}>
                {expandedPackage === pkgIndex ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
              <FileCode size={20} style={{ color: '#a29bfe' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', color: '#fff', fontWeight: '600', fontFamily: 'Monaco, monospace', marginBottom: '4px' }}>
                  {packageFile.filePath || '/package.json'}
                </div>
                {packageFile.packageInfo && packageFile.packageInfo.name && (
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                    {packageFile.packageInfo.name} {packageFile.packageInfo.version && `v${packageFile.packageInfo.version}`}
                  </div>
                )}
              </div>
              <div style={{
                padding: '6px 16px',
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#00d9ff',
                fontWeight: '600',
              }}>
                {packageFile.totalCount} packages
              </div>
            </div>

            {/* Expanded Content */}
            {expandedPackage === pkgIndex && (
              <div style={{ padding: '24px' }}>
                {/* Package Info */}
                {packageFile.packageInfo && packageFile.packageInfo.description && (
                  <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                      {packageFile.packageInfo.description}
                    </div>
                  </div>
                )}

                {/* Dependencies by Category */}
                {Object.entries(packageFile.dependencies || {}).map(([category, packages]) => (
                  packages.length > 0 && (
                    <div key={category} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Box size={16} style={{ color: '#00d9ff' }} />
                        <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: '600' }}>{category}</h4>
                        <span style={{
                          padding: '2px 8px',
                          background: 'rgba(0, 217, 255, 0.1)',
                          border: '1px solid rgba(0, 217, 255, 0.2)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#00d9ff',
                        }}>
                          {packages.length}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gap: '6px', marginLeft: '28px' }}>
                        {packages.map((pkg, index) => (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              background: 'rgba(0, 0, 0, 0.2)',
                              borderRadius: '6px',
                            }}
                          >
                            <span style={{ color: '#fff', fontFamily: 'Monaco, monospace', fontSize: '13px' }}>
                              {pkg.name}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                              {pkg.version}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}

                {/* Dev Dependencies */}
                {packageFile.devDependencies && Object.keys(packageFile.devDependencies).length > 0 && (
                  <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 159, 67, 0.05)', border: '1px solid rgba(255, 159, 67, 0.2)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#ff9f43', fontWeight: '600', marginBottom: '12px' }}>
                      Development Dependencies ({packageFile.devDependencyCount})
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                      {Object.values(packageFile.devDependencies).flat().slice(0, 5).map(p => p.name).join(', ')}
                      {Object.values(packageFile.devDependencies).flat().length > 5 && ` and ${Object.values(packageFile.devDependencies).flat().length - 5} more...`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DependenciesTab;
