import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flowAPI } from '../services/api';
import { ArrowLeft, Zap, Layers, Code2, Play, Flag } from 'lucide-react';
import '../styles/Flow.css';

const FlowVisualization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const response = await flowAPI.getFlow(id);
        const flowData = response.data.flow;
        setFlow(flowData);
      } catch (error) {
        console.error('Failed to fetch flow:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlow();
  }, [id]);

  const getStepIcon = (type) => {
    switch (type) {
      case 'start':
        return <Play size={20} />;
      case 'end':
        return <Flag size={20} />;
      case 'file':
      case 'handler':
        return <Code2 size={20} />;
      case 'middleware':
        return <Layers size={20} />;
      default:
        return <Zap size={20} />;
    }
  };

  const getStepType = (type) => {
    switch (type) {
      case 'start':
        return 'REQUEST';
      case 'end':
        return 'RESPONSE';
      case 'file':
        return 'ROUTE';
      case 'handler':
        return 'CONTROLLER';
      case 'middleware':
        return 'MIDDLEWARE';
      default:
        return type.toUpperCase();
    }
  };

  const getStepColorClass = (type) => {
    switch (type) {
      case 'start':
        return 'step-start';
      case 'end':
        return 'step-end';
      case 'file':
        return 'step-route';
      case 'handler':
        return 'step-controller';
      case 'middleware':
        return 'step-middleware';
      default:
        return 'step-default';
    }
  };

  if (loading) {
    return <div className="loading-page">Loading flow...</div>;
  }

  if (!flow || !flow.flow_data || !flow.flow_data.steps) {
    return <div className="loading-page">No flow data available</div>;
  }

  const steps = flow.flow_data.steps.nodes || [];

  return (
    <div className="flow-container">
      <div className="flow-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="flow-content">
        <div className="flow-title-section">
          <h1>Request Flow</h1>
          <div className="flow-endpoint-badge">
            <span className="method-tag">{flow.method}</span>
            <span className="endpoint-path">{flow.endpoint}</span>
          </div>
        </div>

        <div className="flow-steps">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`flow-step-card ${getStepColorClass(step.type)}`}>
                <div className="step-icon">
                  {getStepIcon(step.type)}
                </div>
                <div className="step-content">
                  <div className="step-type">{getStepType(step.type)}</div>
                  <div className="step-name">{step.label}</div>
                  {step.data?.filePath && (
                    <div className="step-file">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                      {step.data.filePath}
                    </div>
                  )}
                  {flow.flow_data.file && (step.type === 'file' || step.type === 'handler' || step.type === 'middleware') && (
                    <div className="step-file">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                      </svg>
                      {flow.flow_data.file}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flow-arrow">
                  <svg width="24" height="40" viewBox="0 0 24 40">
                    <line x1="12" y1="0" x2="12" y2="32" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    <polygon points="12,40 8,32 16,32" fill="currentColor" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowVisualization;
