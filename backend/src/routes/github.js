const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  connectGitHub,
  disconnectGitHub,
  getGitHubStatus,
  getUserRepositories,
  getRepositoryBranches,
} = require('../controllers/githubController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes
router.post('/connect', connectGitHub);
router.post('/disconnect', disconnectGitHub);
router.get('/status', getGitHubStatus);
router.get('/repositories', getUserRepositories);
router.get('/repositories/:owner/:repo/branches', getRepositoryBranches);

module.exports = router;
