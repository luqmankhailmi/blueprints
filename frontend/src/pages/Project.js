import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, flowAPI } from '../services/api';
import { Upload, ArrowLeft, FileCode, Zap } from 'lucide-react';
import '../styles/Project.css';

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getOne(id);
      setProject(response.data.project);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlows = async () => {
    try {
      const response = await flowAPI.getProjectFlows(id);
      setFlows(response.data.flows);
    } catch (error) {
      console.error('Failed to fetch flows:', error);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchFlows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
    } else {
      alert('Please select a ZIP file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);

    try {
      await projectAPI.uploadFile(id, formData);
      setSelectedFile(null);
      await fetchProject();
      await fetchFlows();
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <div className="project-container">
      <div className="project-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>{project?.name}</h1>
      </div>

      <div className="project-content">
        {!project?.file_name ? (
          <div className="upload-section">
            <div className="upload-card">
              <Upload size={48} />
              <h2>Upload Your Express.js Project</h2>
              <p>Upload a ZIP file of your Express.js project to analyze API flows</p>
              
              <div className="upload-area">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  id="file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-input" className="file-label">
                  {selectedFile ? selectedFile.name : 'Choose ZIP file'}
                </label>
                {selectedFile && (
                  <button
                    className="btn-primary"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload & Analyze'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flows-section">
            <div className="flows-header">
              <div>
                <h2>API Flows</h2>
                <p>{flows.length} endpoints detected</p>
              </div>
              <div className="file-info">
                <FileCode size={18} />
                <span>{project.file_name}</span>
              </div>
            </div>

            {flows.length === 0 ? (
              <div className="empty-flows">
                <Zap size={48} />
                <p>No API endpoints found in the uploaded project</p>
              </div>
            ) : (
              <div className="flows-list">
                {flows.map((flow) => (
                  <div
                    key={flow.id}
                    className="flow-card"
                    onClick={() => navigate(`/flow/${flow.id}`)}
                  >
                    <div className="flow-method">{flow.method}</div>
                    <div className="flow-endpoint">{flow.endpoint}</div>
                    <div className="flow-meta">
                      {flow.flow_data.file && (
                        <span className="flow-file">
                          <FileCode size={14} />
                          {flow.flow_data.file.split('/').pop()}
                        </span>
                      )}
                      <span className="flow-steps">
                        {flow.flow_data.steps?.nodes?.length || 0} steps
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;
