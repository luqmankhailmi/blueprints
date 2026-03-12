const DirectoryAnalyzer = require('../services/directoryAnalyzer');
const DependencyAnalyzer = require('../services/dependencyAnalyzer');
const TechStackDetector = require('../services/techStackDetector');
const pool = require('../config/database');

/**
 * Get complete architecture analysis for a project
 */
exports.getArchitecture = async (req, res) => {
  try {
    const { id } = req.params;

    // Get project from database
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    const projectPath = project.file_path;

    // Run all analyzers
    const directoryAnalyzer = new DirectoryAnalyzer(projectPath);
    const dependencyAnalyzer = new DependencyAnalyzer(projectPath);
    const techStackDetector = new TechStackDetector(projectPath);

    const [directory, dependencies, techStack] = await Promise.all([
      directoryAnalyzer.analyze(),
      dependencyAnalyzer.analyze(),
      techStackDetector.detect()
    ]);

    res.json({
      projectId: id,
      projectName: project.name,
      directory,
      dependencies,
      techStack,
      analyzedAt: new Date()
    });
  } catch (error) {
    console.error('Architecture analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze architecture', message: error.message });
  }
};

/**
 * Get directory structure only
 */
exports.getDirectoryStructure = async (req, res) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    const analyzer = new DirectoryAnalyzer(project.file_path);
    const result = await analyzer.analyze();

    res.json(result);
  } catch (error) {
    console.error('Directory analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze directory', message: error.message });
  }
};

/**
 * Get dependencies only
 */
exports.getDependencies = async (req, res) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    const analyzer = new DependencyAnalyzer(project.file_path);
    const result = await analyzer.analyze();

    res.json(result);
  } catch (error) {
    console.error('Dependency analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze dependencies', message: error.message });
  }
};

/**
 * Get dependency graph
 */
exports.getDependencyGraph = async (req, res) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    const analyzer = new DependencyAnalyzer(project.file_path);
    const graph = await analyzer.buildDependencyGraph();

    res.json(graph);
  } catch (error) {
    console.error('Dependency graph error:', error);
    res.status(500).json({ error: 'Failed to build dependency graph', message: error.message });
  }
};

/**
 * Get tech stack
 */
exports.getTechStack = async (req, res) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    const detector = new TechStackDetector(project.file_path);
    const techStack = await detector.detect();

    res.json(techStack);
  } catch (error) {
    console.error('Tech stack detection error:', error);
    res.status(500).json({ error: 'Failed to detect tech stack', message: error.message });
  }
};

/**
 * Get file content
 */
exports.getFileContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { path: filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    const analyzer = new DirectoryAnalyzer(project.file_path);
    const content = await analyzer.getFileContent(filePath);

    res.json(content);
  } catch (error) {
    console.error('File content error:', error);
    res.status(500).json({ error: 'Failed to get file content', message: error.message });
  }
};

/**
 * Get project statistics
 */
exports.getStats = async (req, res) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    
    // Get directory stats
    const directoryAnalyzer = new DirectoryAnalyzer(project.file_path);
    const directoryData = await directoryAnalyzer.analyze();

    // Get dependency stats
    const dependencyAnalyzer = new DependencyAnalyzer(project.file_path);
    const dependencyData = await dependencyAnalyzer.analyze();

    res.json({
      directory: directoryData.stats,
      dependencies: {
        total: dependencyData.totalCount,
        production: dependencyData.dependencyCount,
        development: dependencyData.devDependencyCount,
        categories: dependencyData.categories
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics', message: error.message });
  }
};

module.exports = exports;
