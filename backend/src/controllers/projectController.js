const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;
const FlowAnalyzer = require('../services/flowAnalyzer');
const GitHubService = require('../services/githubService');

const createProject = async (req, res) => {
  const { name, description, sourceType, githubRepoUrl, githubRepoName, githubBranch } = req.body;
  const userId = req.userId;

  try {
    const result = await pool.query(
      `INSERT INTO projects (user_id, name, description, source_type, github_repo_url, github_repo_name, github_branch) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, name, description || '', sourceType || 'upload', githubRepoUrl || null, githubRepoName || null, githubBranch || 'main']
    );

    res.status(201).json({
      message: 'Project created successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error creating project' });
  }
};

const analyzeGitHubRepo = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Get project and verify ownership
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    if (project.source_type !== 'github') {
      return res.status(400).json({ error: 'Project is not a GitHub repository' });
    }

    // Get user's GitHub token
    const userResult = await pool.query(
      'SELECT github_token FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    if (!user.github_token) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    // Parse repo owner and name
    const [owner, repo] = project.github_repo_name.split('/');

    // Download repository
    const githubService = new GitHubService(user.github_token);
    const tempDir = path.join(__dirname, '../../uploads', `github_${Date.now()}`);
    
    await githubService.downloadRepository(owner, repo, project.github_branch || 'main', tempDir);

    // Analyze the repository
    const analyzer = new FlowAnalyzer();
    const flows = await analyzer.analyzeProject(tempDir, true); // Pass true to indicate it's already extracted

    // Delete existing flows for this project
    await pool.query('DELETE FROM flows WHERE project_id = $1', [id]);

    // Insert new flows
    for (const flow of flows) {
      await pool.query(
        'INSERT INTO flows (project_id, endpoint, method, flow_data) VALUES ($1, $2, $3, $4)',
        [id, flow.endpoint, flow.method, JSON.stringify(flow.flowData)]
      );
    }

    // Update project with analysis timestamp
    await pool.query(
      'UPDATE projects SET uploaded_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });

    res.json({
      message: 'Repository analyzed successfully',
      flowsCount: flows.length
    });
  } catch (error) {
    console.error('Analyze GitHub repo error:', error);
    res.status(500).json({ error: 'Failed to analyze repository' });
  }
};

const getProjects = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT id, name, description, file_name, file_size, uploaded_at, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error fetching projects' });
  }
};

const getProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project: result.rows[0] });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error fetching project' });
  }
};

const uploadProjectFile = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify project ownership
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (projectResult.rows.length === 0) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project with file info
    const updateResult = await pool.query(
      'UPDATE projects SET file_path = $1, file_name = $2, file_size = $3, uploaded_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [req.file.path, req.file.originalname, req.file.size, id]
    );

    // Analyze the uploaded file
    const analyzer = new FlowAnalyzer();
    const flows = await analyzer.analyzeProject(req.file.path);

    // Delete existing flows for this project
    await pool.query('DELETE FROM flows WHERE project_id = $1', [id]);

    // Insert new flows
    for (const flow of flows) {
      await pool.query(
        'INSERT INTO flows (project_id, endpoint, method, flow_data) VALUES ($1, $2, $3, $4)',
        [id, flow.endpoint, flow.method, JSON.stringify(flow.flowData)]
      );
    }

    res.json({
      message: 'File uploaded and analyzed successfully',
      project: updateResult.rows[0],
      flowsCount: flows.length
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Server error uploading file' });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING file_path',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete associated file if exists
    if (result.rows[0].file_path) {
      try {
        await fs.unlink(result.rows[0].file_path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error deleting project' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  uploadProjectFile,
  deleteProject,
  analyzeGitHubRepo
};
