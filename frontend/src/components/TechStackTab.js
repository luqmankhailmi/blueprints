import React from 'react';
import { 
  Code2, Database, Wrench, TestTube, Palette, Cloud,
  Layers, Package, CheckCircle 
} from 'lucide-react';

const TechStackTab = ({ architecture }) => {
  if (!architecture?.techStack) {
    return (
      <div className="empty-state">
        <Code2 size={48} />
        <p>Loading tech stack...</p>
      </div>
    );
  }

  const { frontend, backend, database, languages, buildTools, testing, styling, deployment } = architecture.techStack;

  const Section = ({ icon, title, items, type = 'simple' }) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <div className="tech-section">
        <h3 className="tech-section-title">
          {icon}
          <span>{title}</span>
        </h3>
        <div className="tech-items">
          {type === 'detailed' ? (
            items.map((item, i) => (
              <div key={i} className="tech-item-detailed">
                <div className="tech-item-header">
                  <CheckCircle size={16} className="check-icon" />
                  <span className="tech-name">{item.name}</span>
                </div>
                {item.version && (
                  <span className="tech-version">{item.version}</span>
                )}
                {item.files !== undefined && (
                  <span className="tech-meta">{item.files} files</span>
                )}
              </div>
            ))
          ) : (
            items.map((item, i) => (
              <span key={i} className="tech-badge">
                {item}
              </span>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tech-stack-tab">
      <div className="tech-header">
        <h2>Technology Stack Overview</h2>
        <p>Detected frameworks, libraries, and tools used in this project</p>
      </div>

      <div className="tech-grid">
        {/* Frontend */}
        <Section
          icon={<Layers size={20} />}
          title="Frontend Frameworks"
          items={frontend}
          type="detailed"
        />

        {/* Backend */}
        <Section
          icon={<Code2 size={20} />}
          title="Backend Frameworks"
          items={backend}
          type="detailed"
        />

        {/* Database */}
        <Section
          icon={<Database size={20} />}
          title="Databases"
          items={database}
          type="detailed"
        />

        {/* Languages */}
        <Section
          icon={<Package size={20} />}
          title="Programming Languages"
          items={languages}
          type="detailed"
        />

        {/* Build Tools */}
        <Section
          icon={<Wrench size={20} />}
          title="Build Tools"
          items={buildTools}
          type="simple"
        />

        {/* Testing */}
        <Section
          icon={<TestTube size={20} />}
          title="Testing Frameworks"
          items={testing}
          type="simple"
        />

        {/* Styling */}
        <Section
          icon={<Palette size={20} />}
          title="Styling & CSS"
          items={styling}
          type="simple"
        />

        {/* Deployment */}
        <Section
          icon={<Cloud size={20} />}
          title="Deployment & Infrastructure"
          items={deployment}
          type="simple"
        />
      </div>

      {/* Empty State */}
      {!frontend?.length && !backend?.length && !database?.length && !languages?.length &&
       !buildTools?.length && !testing?.length && !styling?.length && !deployment?.length && (
        <div className="empty-state">
          <Code2 size={48} />
          <h3>No Technology Detected</h3>
          <p>Could not detect any specific technologies in this project</p>
        </div>
      )}
    </div>
  );
};

export default TechStackTab;
