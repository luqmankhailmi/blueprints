import React from 'react';
import { Code2, Database, TestTube, Wrench, Palette, Cloud } from 'lucide-react';

const TechStackTab = ({ architecture }) => {
  if (!architecture?.techStack) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <Code2 size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>Detecting tech stack...</p>
      </div>
    );
  }

  const tech = architecture.techStack;

  const sections = [
    {
      title: 'Framework',
      icon: <Code2 size={20} />,
      color: '#00d9ff',
      value: tech.framework ? `${tech.framework.name} ${tech.framework.version || ''}` : null
    },
    {
      title: 'Language',
      icon: <Code2 size={20} />,
      color: '#a29bfe',
      value: tech.language
    },
    {
      title: 'Build Tool',
      icon: <Wrench size={20} />,
      color: '#ff9f43',
      value: tech.buildTool
    },
    {
      title: 'Database',
      icon: <Database size={20} />,
      color: '#00b894',
      value: tech.database
    },
    {
      title: 'Testing',
      icon: <TestTube size={20} />,
      color: '#667eea',
      value: tech.testing
    },
    {
      title: 'Styling',
      icon: <Palette size={20} />,
      color: '#f093fb',
      value: tech.styling
    },
    {
      title: 'State Management',
      icon: <Code2 size={20} />,
      color: '#fdcb6e',
      value: tech.stateManagement
    },
    {
      title: 'Deployment',
      icon: <Cloud size={20} />,
      color: '#74b9ff',
      value: tech.deployment
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>Tech Stack</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Automatically detected frameworks, tools, and technologies
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {sections.map((section, index) => (
          section.value && (
            <div
              key={index}
              style={{
                background: 'rgba(26, 31, 53, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 217, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ color: section.color }}>{section.icon}</div>
                <h3 style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {section.title}
                </h3>
              </div>
              {Array.isArray(section.value) ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {section.value.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '6px 12px',
                        background: `${section.color}20`,
                        border: `1px solid ${section.color}40`,
                        borderRadius: '8px',
                        color: section.color,
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '18px', color: '#fff', fontWeight: '600' }}>
                  {section.value}
                </div>
              )}
            </div>
          )
        ))}
      </div>

      {tech.other && tech.other.length > 0 && (
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(26, 31, 53, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 217, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#fff' }}>Other Tools</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {tech.other.map((tool, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                }}
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechStackTab;
