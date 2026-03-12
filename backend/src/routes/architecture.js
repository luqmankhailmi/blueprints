const express = require('express');
const router = express.Router();
const architectureController = require('../controllers/architectureController');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get complete architecture analysis
router.get('/:id', architectureController.getArchitecture);

// Get directory structure
router.get('/:id/directory', architectureController.getDirectoryStructure);

// Get dependencies
router.get('/:id/dependencies', architectureController.getDependencies);

// Get dependency graph
router.get('/:id/dependencies/graph', architectureController.getDependencyGraph);

// Get tech stack
router.get('/:id/tech-stack', architectureController.getTechStack);

// Get file content
router.get('/:id/file', architectureController.getFileContent);

// Get statistics
router.get('/:id/stats', architectureController.getStats);

module.exports = router;
