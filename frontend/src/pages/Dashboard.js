import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, githubAPI } from '../services/api';
import { Plus, FolderOpen, Calendar, FileArchive, Trash2, LogOut, Settings, Github } from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [sourceType, setSourceType] = useState('upload'); // 'upload' or 'github'
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    checkGitHubStatus();
  }, []);

  const checkGitHubStatus = async () => {
    try {
      const response = await githubAPI.getStatus();
      setGithubConnected(response.data.connected);
    } catch (error) {
      console.error('Failed to check GitHub status:', error);
    }
  };

  const fetchGitHubRepos = async () => {
    setLoadingRepos(true);
    try {
      const response = await githubAPI.getRepositories();
      setRepositories(response.data.repositories);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      alert('Failed to fetch GitHub repositories');
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    if (sourceType === 'github' && githubConnected && repositories.length === 0) {
      fetchGitHubRepos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceType, githubConnected]);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const projectData = {
        name: newProjectName,
        sourceType: sourceType,
      };

      if (sourceType === 'github' && selectedRepo) {
        projectData.githubRepoUrl = selectedRepo.html_url;
        projectData.githubRepoName = selectedRepo.full_name;
        projectData.githubBranch = selectedRepo.default_branch;
      }

      const response = await projectAPI.create(projectData);
      setProjects([response.data.project, ...projects]);
      setNewProjectName('');
      setSelectedRepo(null);
      setSourceType('upload');
      setShowNewProject(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'No file';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="logo">
            <FolderOpen size={24} />
            <span>Blueprints</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <span>{user?.name}</span>
          </div>
          <button className="icon-btn" onClick={() => navigate('/settings')}>
            <Settings size={20} />
          </button>
          <button className="icon-btn" onClick={logout}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Your Projects</h1>
            <p>Manage and analyze your Express.js applications</p>
          </div>
          <button className="btn-primary" onClick={() => setShowNewProject(true)}>
            <Plus size={20} />
            New Project
          </button>
        </div>

        {showNewProject && (
          <div className="modal-overlay" onClick={() => setShowNewProject(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Project</h2>
              <form onSubmit={handleCreateProject}>
                <div className="input-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Express App"
                    required
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <label>Source</label>
                  <div className="source-tabs">
                    <button
                      type="button"
                      className={`source-tab ${sourceType === 'upload' ? 'active' : ''}`}
                      onClick={() => setSourceType('upload')}
                    >
                      <FileArchive size={18} />
                      Upload ZIP
                    </button>
                    <button
                      type="button"
                      className={`source-tab ${sourceType === 'github' ? 'active' : ''}`}
                      onClick={() => setSourceType('github')}
                      disabled={!githubConnected}
                    >
                      <Github size={18} />
                      GitHub {!githubConnected && '(Not Connected)'}
                    </button>
                  </div>
                </div>

                {sourceType === 'github' && (
                  <div className="input-group">
                    <label>Select Repository</label>
                    {loadingRepos ? (
                      <div className="loading-repos">Loading repositories...</div>
                    ) : (
                      <select
                        value={selectedRepo?.id || ''}
                        onChange={(e) => {
                          const repo = repositories.find(r => r.id === parseInt(e.target.value));
                          setSelectedRepo(repo);
                          if (repo && !newProjectName) {
                            setNewProjectName(repo.name);
                          }
                        }}
                        required
                      >
                        <option value="">Choose a repository...</option>
                        {repositories.map(repo => (
                          <option key={repo.id} value={repo.id}>
                            {repo.full_name} {repo.private ? '(Private)' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowNewProject(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={creating || (sourceType === 'github' && !selectedRepo)}
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={64} />
            <h3>No projects yet</h3>
            <p>Create your first project to start tracking API flows</p>
            <button className="btn-primary" onClick={() => setShowNewProject(true)}>
              <Plus size={20} />
              Create Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="project-info">
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>Created {formatDate(project.created_at)}</span>
                  </div>
                  {project.file_name && (
                    <div className="info-item">
                      <FileArchive size={16} />
                      <span>{formatFileSize(project.file_size)}</span>
                    </div>
                  )}
                </div>

                <div className="project-status">
                  {project.file_name ? (
                    <span className="status-badge status-ready">
                      Analyzed
                    </span>
                  ) : (
                    <span className="status-badge status-pending">
                      No file uploaded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
