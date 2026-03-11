import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { flowAPI } from '../services/api';
import { ArrowLeft, Code2, FileCode } from 'lucide-react';
import '../styles/Flow.css';

const FlowVisualization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const response = await flowAPI.getFlow(id);
        const flowData = response.data.flow;
        setFlow(flowData);
        
        if (flowData.flow_data.steps) {
          const transformedNodes = flowData.flow_data.steps.nodes.map(node => ({
            id: node.id,
            data: { 
              label: node.label,
              ...node.data
            },
            position: node.position,
            type: getNodeType(node.type),
            style: getNodeStyle(node.type),
          }));

          const transformedEdges = flowData.flow_data.steps.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            animated: true,
            style: { stroke: '#00d9ff', strokeWidth: 2 },
          }));

          setNodes(transformedNodes);
          setEdges(transformedEdges);
        }
      } catch (error) {
        console.error('Failed to fetch flow:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlow();
  }, [id, setNodes, setEdges]);

  const getNodeType = (type) => {
    return 'default';
  };

  const getNodeStyle = (type) => {
    const baseStyle = {
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: '2px solid',
      minWidth: '150px',
      textAlign: 'center',
    };

    switch (type) {
      case 'start':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderColor: '#764ba2',
        };
      case 'end':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#fff',
          borderColor: '#f5576c',
        };
      case 'file':
        return {
          ...baseStyle,
          background: 'rgba(0, 217, 255, 0.1)',
          color: '#00d9ff',
          borderColor: '#00d9ff',
        };
      case 'middleware':
        return {
          ...baseStyle,
          background: 'rgba(255, 184, 0, 0.1)',
          color: '#ffb800',
          borderColor: '#ffb800',
        };
      case 'handler':
        return {
          ...baseStyle,
          background: 'rgba(0, 255, 135, 0.1)',
          color: '#00ff87',
          borderColor: '#00ff87',
        };
      default:
        return {
          ...baseStyle,
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#fff',
          borderColor: '#444',
        };
    }
  };

  if (loading) {
    return <div className="loading-page">Loading flow...</div>;
  }

  return (
    <div className="flow-container">
      <div className="flow-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flow-info">
          <div className="flow-method-badge">{flow?.method}</div>
          <h1>{flow?.endpoint}</h1>
        </div>
      </div>

      <div className="flow-details">
        {flow?.flow_data.file && (
          <div className="detail-item">
            <FileCode size={16} />
            <span>{flow.flow_data.file}</span>
          </div>
        )}
        {flow?.flow_data.middleware?.length > 0 && (
          <div className="detail-item">
            <Code2 size={16} />
            <span>{flow.flow_data.middleware.length} middleware</span>
          </div>
        )}
        {flow?.flow_data.handlers?.length > 0 && (
          <div className="detail-item">
            <Code2 size={16} />
            <span>{flow.flow_data.handlers.length} handlers</span>
          </div>
        )}
      </div>

      <div className="flow-visualization">
        <div className="react-flow-wrapper" style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#00d9ff" gap={16} size={1} style={{ opacity: 0.1 }} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const style = getNodeStyle(node.type);
                return style.borderColor || '#444';
              }}
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
              }}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default FlowVisualization;
