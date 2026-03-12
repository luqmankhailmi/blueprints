import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, flowAPI } from '../services/api';
import { 
  Upload, ArrowLeft, FileCode, Zap, Layout, Package, 
  Code2, BarChart3, Layers, Folder, FolderTree,
  Database, Wrench, TestTube, Palette, Cloud
} from 'lucide-react';
import '../styles/Project.css';

// Import tab components
import OverviewTab from '../components/OverviewTab';
import APIFlowTab from '../components/APIFlowTab';
import FilesTab from '../components/FilesTab';
import DependenciesTab from '../components/DependenciesTab';
import TechStackTab from '../components/TechStackTab';
import StatsTab from '../components/StatsTab';

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [flows, setFlows] = useState([]);
  const [architecture, setArchitecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingArchitecture, setLoadingArchitecture] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Layout size={18} /> },
    { id: 'api-flow', label: 'API Flow', icon: <Zap size={18} /> },
    { id: 'files', label: 'Files', icon: <FolderTree size={18} /> },
    { id: 'dependencies', label: 'Dependencies', icon: <Package size={18} /> },
    { id: 'tech-stack', label: 'Tech Stack', icon: <Code2 size={18} /> },
    { id: 'stats', label: 'Statistics', icon: <BarChart3 size={18} /> },
  ];

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

  const fetchArchitecture = async () => {
    if (architecture) return; // Already loaded
    
    setLoadingArchitecture(true);
    try {
      const response = await fetch(`/api/architecture/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setArchitecture(data);
    } catch (error) {
      console.error('Failed to fetch architecture:', error);
    } finally {
      setLoadingArchitecture(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchFlows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch architecture when needed
  useEffect(() => {
    if (project?.uploaded_at && !architecture && activeTab !== 'api-flow') {
      fetchArchitecture();
    }
  }, [activeTab, project, architecture]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
    } else {
      alert('Please select a ZIP file');
    }
  };

  const handleAnalyzeGitHub = async () => {
    setUploading(true);

    try {
      await projectAPI.analyzeGitHub(id);
      await fetchProject();
      await fetchFlows();
      await fetchArchitecture();
    } catch (error) {
      console.error('Failed to analyze repository:', error);
      alert('Failed to analyze repository');
    } finally {
      setUploading(false);
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
      await fetchArchitecture();
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const renderTabContent = () => {
    if (!project?.uploaded_at) {
      return null;
    }

    if (loadingArchitecture && activeTab !== 'api-flow') {
      return (
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Analyzing project architecture...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab project={project} architecture={architecture} flows={flows} />;
      case 'api-flow':
        return <APIFlowTab flows={flows} project={project} />;
      case 'files':
        return <FilesTab projectId={id} architecture={architecture} />;
      case 'dependencies':
        return <DependenciesTab projectId={id} architecture={architecture} />;
      case 'tech-stack':
        return <TechStackTab architecture={architecture} />;
      case 'stats':
        return <StatsTab architecture={architecture} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  return (
    <div className="project-container">
      <div className="project-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="project-title">
            <h1>📐 {project?.name}</h1>
            <p className="project-subtitle">
              {project?.source_type === 'github' 
                ? `${project.github_repo_name} • ${project.github_branch}` 
                : project?.file_name || 'Uploaded project'}
            </p>
          </div>
        </div>
      </div>

      <div className="project-content">
        {!project?.uploaded_at && project?.source_type === 'upload' ? (
          <div className="upload-section">
            <div className="upload-card">
              <Upload size={48} className="upload-icon" />
              <h2>Upload Your Project</h2>
              <p>Upload a ZIP file of your project to analyze its architecture</p>
              
              <div className="upload-area">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  id="file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-input" className="file-label">
                  <FileCode size={20} />
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
        ) : !project?.uploaded_at && project?.source_type === 'github' ? (
          <div className="upload-section">
            <div className="upload-card">
              <Zap size={48} className="upload-icon" />
              <h2>Analyze GitHub Repository</h2>
              <p>Repository: <strong>{project.github_repo_name}</strong></p>
              <p>Branch: <strong>{project.github_branch}</strong></p>
              
              <button
                className="btn-primary"
                onClick={handleAnalyzeGitHub}
                disabled={uploading}
                style={{ marginTop: '20px' }}
              >
                {uploading ? 'Analyzing...' : 'Analyze Repository'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs Navigation */}
            <div className="tabs-container">
              <div className="tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {renderTabContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Project;
