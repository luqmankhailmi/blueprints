import React, { useState } from 'react';
import {
  Code2,
  Database,
  TestTube,
  Server,
  Layers,
  Palette,
  Package,
  Route,
  Shield,
  Wrench,
  Cloud,
  Box,
  GitBranch,
  Monitor,
  Gauge,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const TechStackTab = ({ architecture }) => {
  const [expandedSections, setExpandedSections] = useState({
    frontend: true,
    backend: true,
    database: true,
    devOps: false,
    testing: false,
  });

  if (!architecture?.techStack) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <Code2 size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>Detecting tech stack...</p>
      </div>
    );
  }

  const tech = architecture.techStack;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderTechItem = (item, color) => (
    <div
      style={{
        padding: '8px 14px',
        background: `${color}15`,
        border: `1px solid ${color}30`,
        borderRadius: '8px',
        color: color,
        fontSize: '13px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {item.name}
      {item.version && (
        <span style={{ opacity: 0.6, fontSize: '11px', fontWeight: '400' }}>
          {item.version}
        </span>
      )}
      {item.type && (
        <span style={{
          opacity: 0.5,
          fontSize: '10px',
          fontWeight: '400',
          marginLeft: '4px',
          padding: '2px 6px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px'
        }}>
          {item.type}
        </span>
      )}
      {item.category && (
        <span style={{
          opacity: 0.5,
          fontSize: '10px',
          fontWeight: '400',
          marginLeft: '4px',
          padding: '2px 6px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px'
        }}>
          {item.category}
        </span>
      )}
    </div>
  );

  const renderSubSection = (title, items, icon, color, emptyMessage = 'None detected') => {
    if (!items || (Array.isArray(items) && items.length === 0)) {
      return null;
    }

    return (
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ color: color }}>{icon}</div>
          <h4 style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: '600'
          }}>
            {title}
          </h4>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingLeft: '28px' }}>
          {Array.isArray(items) ? (
            items.map((item, i) => (
              <React.Fragment key={i}>
                {renderTechItem(item, color)}
              </React.Fragment>
            ))
          ) : typeof items === 'string' ? (
            <div style={{ color: '#fff', fontSize: '14px' }}>{items}</div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderMainSection = (title, icon, color, sectionKey, content) => {
    const isExpanded = expandedSections[sectionKey];
    const hasContent = content && Object.values(content).some(val =>
      (Array.isArray(val) && val.length > 0) || (val && !Array.isArray(val))
    );

    if (!hasContent) return null;

    return (
      <div
        style={{
          background: 'rgba(26, 31, 53, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 217, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <div
          onClick={() => toggleSection(sectionKey)}
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderBottom: isExpanded ? '1px solid rgba(0, 217, 255, 0.1)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ color: color, display: 'flex' }}>{icon}</div>
            <h3 style={{ fontSize: '18px', color: '#fff', fontWeight: '600', margin: 0 }}>
              {title}
            </h3>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>

        {isExpanded && (
          <div style={{ padding: '24px' }}>
            {content}
          </div>
        )}
      </div>
    );
  };

  // FRONTEND SECTION
  const frontendContent = tech.frontend && (
    <>
      {tech.frontend.language && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Code2 size={16} style={{ color: '#a29bfe' }} />
            <h4 style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
              Language
            </h4>
          </div>
          <div style={{ paddingLeft: '28px', color: '#a29bfe', fontSize: '16px', fontWeight: '600' }}>
            {tech.frontend.language}
          </div>
        </div>
      )}
      {renderSubSection('Frameworks', tech.frontend.frameworks, <Layers size={16} />, '#00d9ff')}
      {renderSubSection('UI Components', tech.frontend.uiComponents, <Package size={16} />, '#a29bfe')}
      {renderSubSection('Styling', tech.frontend.styling, <Palette size={16} />, '#f093fb')}
      {renderSubSection('State Management', tech.frontend.stateManagement, <Database size={16} />, '#fdcb6e')}
      {renderSubSection('Routing', tech.frontend.routing, <Route size={16} />, '#74b9ff')}
      {renderSubSection('Bundlers & Build Tools', tech.frontend.bundlers, <Box size={16} />, '#ff9f43')}
      {renderSubSection('Libraries', tech.frontend.libraries, <Package size={16} />, '#00b894')}
    </>
  );

  // BACKEND SECTION
  const backendContent = tech.backend && (
    <>
      {tech.backend.runtime && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Server size={16} style={{ color: '#00d9ff' }} />
            <h4 style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
              Runtime
            </h4>
          </div>
          <div style={{ paddingLeft: '28px', color: '#00d9ff', fontSize: '16px', fontWeight: '600' }}>
            {tech.backend.runtime}
          </div>
        </div>
      )}
      {tech.backend.language && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Code2 size={16} style={{ color: '#a29bfe' }} />
            <h4 style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
              Language
            </h4>
          </div>
          <div style={{ paddingLeft: '28px', color: '#a29bfe', fontSize: '16px', fontWeight: '600' }}>
            {tech.backend.language}
          </div>
        </div>
      )}
      {renderSubSection('Frameworks', tech.backend.frameworks, <Layers size={16} />, '#00d9ff')}
      {renderSubSection('API Tools', tech.backend.apiTools, <Route size={16} />, '#74b9ff')}
      {renderSubSection('Authentication', tech.backend.authentication, <Shield size={16} />, '#00b894')}
      {renderSubSection('Validation', tech.backend.validation, <Shield size={16} />, '#667eea')}
      {renderSubSection('ORM/ODM', tech.backend.orm, <Database size={16} />, '#f093fb')}
      {renderSubSection('Utilities', tech.backend.utilities, <Wrench size={16} />, '#ff9f43')}
    </>
  );

  // DATABASE SECTION
  const databaseContent = tech.database && (
    <>
      {renderSubSection('Relational Databases', tech.database.relational, <Database size={16} />, '#00b894')}
      {renderSubSection('NoSQL Databases', tech.database.nosql, <Database size={16} />, '#fdcb6e')}
      {renderSubSection('Cache & In-Memory', tech.database.cache, <Gauge size={16} />, '#ff9f43')}
      {renderSubSection('Search Engines', tech.database.search, <Monitor size={16} />, '#a29bfe')}
      {renderSubSection('Database Tools', tech.database.tools, <Wrench size={16} />, '#74b9ff')}
    </>
  );

  // DEVOPS SECTION
  const devOpsContent = tech.devOps && (
    <>
      {renderSubSection('Containerization', tech.devOps.containerization, <Box size={16} />, '#00d9ff')}
      {renderSubSection('CI/CD', tech.devOps.ci_cd, <GitBranch size={16} />, '#00b894')}
      {renderSubSection('Hosting Platforms', tech.devOps.hosting, <Cloud size={16} />, '#74b9ff')}
      {renderSubSection('Monitoring', tech.devOps.monitoring, <Gauge size={16} />, '#f093fb')}
      {renderSubSection('Cloud Services', tech.devOps.cloudServices, <Cloud size={16} />, '#a29bfe')}
    </>
  );

  // TESTING SECTION
  const testingContent = tech.testing && (
    <>
      {renderSubSection('Testing Frameworks', tech.testing.frameworks, <TestTube size={16} />, '#667eea')}
      {renderSubSection('Testing Libraries', tech.testing.libraries, <Package size={16} />, '#a29bfe')}
      {renderSubSection('E2E Testing', tech.testing.e2e, <Monitor size={16} />, '#00d9ff')}
      {renderSubSection('Coverage Tools', tech.testing.coverage, <Gauge size={16} />, '#00b894')}
    </>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px', color: '#fff', fontWeight: '700' }}>
          Tech Stack Analysis
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Comprehensive breakdown of detected technologies across your codebase
        </p>
      </div>

      {renderMainSection('Frontend', <Monitor size={24} />, '#00d9ff', 'frontend', frontendContent)}
      {renderMainSection('Backend', <Server size={24} />, '#00b894', 'backend', backendContent)}
      {renderMainSection('Database', <Database size={24} />, '#f093fb', 'database', databaseContent)}
      {renderMainSection('DevOps & Deployment', <Cloud size={24} />, '#74b9ff', 'devOps', devOpsContent)}
      {renderMainSection('Testing', <TestTube size={24} />, '#667eea', 'testing', testingContent)}

      {(!tech.frontend && !tech.backend && !tech.database && !tech.devOps && !tech.testing) && (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          background: 'rgba(26, 31, 53, 0.3)',
          borderRadius: '16px',
          border: '1px dashed rgba(255,255,255,0.1)'
        }}>
          <Code2 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px' }}>No tech stack detected</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            Make sure your project includes a package.json file
          </p>
        </div>
      )}
    </div>
  );
};

export default TechStackTab;