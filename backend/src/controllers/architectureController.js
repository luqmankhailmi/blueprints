const DirectoryAnalyzer = require('../services/directoryAnalyzer');
const DependencyAnalyzer = require('../services/dependencyAnalyzer');
const TechStackDetector = require('../services/techStackDetector');
const pool = require('../config/database');
const path = require('path');

/**
 * Get complete architecture analysis for a project
 */
exports.getArchitecture = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Get project from database
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    if (!project.file_path) {
      return res.status(400).json({ error: 'Project has not been uploaded yet' });
    }

    const projectPath = project.file_path;

    // Use cached analysis from DB — avoids re-scanning on every page load
    const hasCachedData = project.directory_data && project.dependencies_data;

    let directory, dependencies, techStack;

    if (hasCachedData) {
      directory = project.directory_data;
      dependencies = project.dependencies_data;
      techStack = project.tech_stack || {};
    } else {
      // Cache missing — run live and save for next time
      const directoryAnalyzer = new DirectoryAnalyzer(projectPath);
      const dependencyAnalyzer = new DependencyAnalyzer(projectPath);
      const techStackDetector = new TechStackDetector(projectPath);

      [directory, dependencies, techStack] = await Promise.all([
        directoryAnalyzer.analyze(),
        dependencyAnalyzer.analyze(),
        techStackDetector.detect(),
      ]);

      await pool.query(
        `UPDATE projects 
         SET directory_data = $1, dependencies_data = $2, tech_stack = COALESCE(tech_stack, $3)
         WHERE id = $4`,
        [JSON.stringify(directory), JSON.stringify(dependencies), JSON.stringify(techStack), id]
      );
    }

    res.json({
      projectId: id,
      projectName: project.name,
      directory,
      dependencies,
      techStack,
      aiEnhanced: !!(project.tech_stack?.aiEnhanced),
      analyzedAt: new Date()
    });
  } catch (error) {
    console.error('Architecture analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze architecture',
      message: error.message
    });
  }
};

/**
 * Get directory structure only
 */
exports.getDirectoryStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
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
    res.status(500).json({
      error: 'Failed to analyze directory',
      message: error.message
    });
  }
};

/**
 * Get file content
 */
exports.getFileContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { path: filePath } = req.query;
    const userId = req.userId;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
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
    res.status(500).json({
      error: 'Failed to get file content',
      message: error.message
    });
  }
};

module.exports = exports;