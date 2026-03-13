import React, { useState } from 'react';
import { Zap, FileCode, ChevronDown, ChevronRight, ArrowDown } from 'lucide-react';

const APIFlowTab = ({ flows, project }) => {
  const [expandedFlow, setExpandedFlow] = useState(null);

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

  const getNodeTypeIcon = (type) => {
    const typeUpper = type.toUpperCase();
    if (typeUpper === 'START') return '⚡';
    if (typeUpper === 'END') return '✓';
    if (typeUpper === 'MIDDLEWARE') return '⚙';
    if (typeUpper === 'HANDLER') return '📋';
    if (typeUpper === 'FILE') return '📄';
    return '●';
  };

  const toggleFlow = (index) => {
    setExpandedFlow(expandedFlow === index ? null : index);
  };

  const renderFlowDiagram = (flowData) => {
    if (!flowData.steps || !flowData.steps.nodes) return null;

    const nodes = flowData.steps.nodes;

    return (
      <div style={{
        marginTop: '24px',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 217, 255, 0.15)'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#00d9ff',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Zap size={18} />
          Request Flow
        </h3>

        <div style={{ position: 'relative' }}>
          {nodes.map((node, nodeIndex) => (
            <div key={node.id}>
              {/* Flow Node */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: nodeIndex < nodes.length - 1 ? '8px' : '0',
                }}
              >
                {/* Node Box */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    background: `linear-gradient(135deg, ${getNodeTypeColor(node.type)}15, ${getNodeTypeColor(node.type)}08)`,
                    border: `2px solid ${getNodeTypeColor(node.type)}`,
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${getNodeTypeColor(node.type)}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${getNodeTypeColor(node.type)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                    }}
                  >
                    {getNodeTypeIcon(node.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: getNodeTypeColor(node.type),
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '4px'
                    }}>
                      {node.type}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#fff',
                      fontWeight: '600',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {node.label || node.type}
                    </div>
                    {node.data && node.data.filePath && (
                      <div style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.5)',
                        fontFamily: 'Monaco, monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {node.data.filePath}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow Connector */}
              {nodeIndex < nodes.length - 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '8px 0',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <ArrowDown size={24} style={{ color: 'rgba(0, 217, 255, 0.6)' }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(0, 217, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 217, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '13px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Total Steps</div>
            <div style={{ color: '#00d9ff', fontWeight: '700', fontSize: '18px' }}>{nodes.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Middleware</div>
            <div style={{ color: '#a29bfe', fontWeight: '700', fontSize: '18px' }}>
              {nodes.filter(n => n.type === 'middleware').length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Handlers</div>
            <div style={{ color: '#00b894', fontWeight: '700', fontSize: '18px' }}>
              {nodes.filter(n => n.type === 'handler').length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>API Endpoints</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          {flows.length} endpoint{flows.length !== 1 ? 's' : ''} detected in your Express.js application
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {flows.map((flow, index) => {
          const flowData = typeof flow.flow_data === 'string' ? JSON.parse(flow.flow_data) : flow.flow_data;
          const isExpanded = expandedFlow === index;

          return (
            <div
              key={index}
              style={{
                background: 'rgba(26, 31, 53, 0.6)',
                backdropFilter: 'blur(20px)',
                border: isExpanded ? '1px solid rgba(0, 217, 255, 0.3)' : '1px solid rgba(0, 217, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => toggleFlow(index)}
            >
              {/* Endpoint Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
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
                        {flowData.file}
                      </span>
                    </div>
                  )}
                </div>

                {/* Expand/Collapse Icon */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isExpanded ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease'
                }}>
                  {isExpanded ? (
                    <ChevronDown size={20} style={{ color: '#00d9ff' }} />
                  ) : (
                    <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  )}
                </div>
              </div>

              {/* Flow Diagram (Expandable) */}
              {isExpanded && renderFlowDiagram(flowData)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default APIFlowTab;