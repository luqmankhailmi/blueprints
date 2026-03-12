const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  getArchitecture,
  getDirectoryStructure,
  getFileContent,
} = require('../controllers/architectureController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes
router.get('/:id', getArchitecture);
router.get('/:id/directory', getDirectoryStructure);
router.get('/:id/file', getFileContent);

module.exports = router;
