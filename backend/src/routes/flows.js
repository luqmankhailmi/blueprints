const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getProjectFlows, getFlow } = require('../controllers/flowController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes
router.get('/project/:projectId', getProjectFlows);
router.get('/:flowId', getFlow);

module.exports = router;
