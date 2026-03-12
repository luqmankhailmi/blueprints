import React from 'react';
import { Zap, GitBranch, Filter, Code, FileCode } from 'lucide-react';

const APIFlowTab = ({ flows, project }) => {
  if (!flows || flows.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        <Zap size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h3 style={{ marginBottom: '8px' }}>No API Endpoints Found</h3>
        <p>This project doesn't contain Express.js API routes or they couldn't be detected.</p>
      </div>
    );
  }

  const getMethodColor = (method) => {
    const colors = {
      'GET': '#00b894',
      'POST': '#00d9ff',
      'PUT': '#ff9f43',
      'DELETE': '#ff556c',
      'PATCH': '#a29bfe',
    };
    return colors[method.toUpperCase()] || '#667eea';
  };

  const getNodeTypeColor = (type) => {
    const colors = {
      'ROUTE': '#ff9f43',
      'MIDDLEWARE': '#a29bfe',
      'CONTROLLER': '#00b894',
      'START': '#667eea',
      'END': '#f093fb',
      'middleware': '#a29bfe',
      'handler': '#00b894',
      'file': '#ff9f43',
      'start': '#667eea',
      'end': '#f093fb',
    };
    return colors[type] || '#00d9ff';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>API Endpoints</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          {flows.length} endpoint{flows.length !== 1 ? 's' : ''} detected in your Express.js application
        </p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {flows.map((flow, index) => {
          const flowData = typeof flow.flow_data === 'string' ? JSON.parse(flow.flow_data) : flow.flow_data;
          
          return (
            <div
              key={index}
              style={{
                background: 'rgba(26, 31, 53, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 217, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Endpoint Header */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      padding: '6px 12px',
                      background: `${getMethodColor(flow.method)}20`,
                      border: `1px solid ${getMethodColor(flow.method)}`,
                      borderRadius: '6px',
                      color: getMethodColor(flow.method),
                      fontSize: '13px',
                      fontWeight: '700',
                    }}
                  >
                    {flow.method.toUpperCase()}
                  </div>
                  <code style={{ fontSize: '16px', color: '#00d9ff', fontFamily: 'Monaco, monospace' }}>
                    {flow.endpoint}
                  </code>
                </div>

                {/* File Source */}
                {flowData.file && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '88px' }}>
                    <FileCode size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Monaco, monospace' }}>
                      Found in: {flowData.file}
                    </span>
                  </div>
                )}
              </div>

              {/* Flow Steps */}
              {flowData.nodes && flowData.nodes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {flowData.nodes.map((node, nodeIndex) => (
                    <div key={nodeIndex}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px',
                          background: `${getNodeTypeColor(node.type)}10`,
                          border: `1px solid ${getNodeTypeColor(node.type)}40`,
                          borderRadius: '12px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `${getNodeTypeColor(node.type)}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: getNodeTypeColor(node.type),
                            fontWeight: '700',
                            fontSize: '12px',
                          }}
                        >
                          {node.type[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>
                            {node.label || node.type}
                          </div>
                          {node.data && node.data.filePath && (
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Monaco, monospace' }}>
                              {node.data.filePath}
                            </div>
                          )}
                        </div>
                      </div>
                      {nodeIndex < flowData.nodes.length - 1 && (
                        <div style={{ width: '2px', height: '12px', background: 'rgba(0, 217, 255, 0.2)', margin: '0 20px' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default APIFlowTab;
