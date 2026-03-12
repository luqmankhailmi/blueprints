import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, FileCode } from 'lucide-react';

const APIFlowTab = ({ flows, project }) => {
  const navigate = useNavigate();

  if (!flows || flows.length === 0) {
    return (
      <div className="empty-state">
        <Zap size={48} />
        <h3>No API Endpoints Found</h3>
        <p>No Express.js API endpoints were detected in this project</p>
      </div>
    );
  }

  return (
    <div className="api-flow-tab">
      <div className="flow-header">
        <h3>API Endpoints</h3>
        <p>{flows.length} endpoints detected</p>
      </div>

      <div className="flows-grid">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className="flow-card"
            onClick={() => navigate(`/flow/${flow.id}`)}
          >
            <div className="flow-card-header">
              <span className={`flow-method method-${flow.method.toLowerCase()}`}>
                {flow.method}
              </span>
              <span className="flow-endpoint">{flow.endpoint}</span>
            </div>
            
            <div className="flow-card-meta">
              {flow.flow_data.file && (
                <span className="flow-file">
                  <FileCode size={14} />
                  {flow.flow_data.file.split('/').pop()}
                </span>
              )}
              <span className="flow-steps">
                <Zap size={14} />
                {flow.flow_data.steps?.nodes?.length || 0} steps
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default APIFlowTab;
