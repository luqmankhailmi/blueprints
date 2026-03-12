const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const {
  createProject,
  getProjects,
  getProject,
  uploadProjectFile,
  deleteProject,
  analyzeGitHubRepo
} = require('../controllers/projectController');
const {
  executeAIAnalysis,
  getAIAnalysisStatus
} = require('../controllers/aiAnalysisController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// All routes require authentication
router.use(verifyToken);

// Routes
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/:id/upload', upload.single('file'), uploadProjectFile);
router.post('/:id/analyze-github', analyzeGitHubRepo);
router.delete('/:id', deleteProject);

// AI Analysis routes
router.post('/:id/ai-analyze', executeAIAnalysis);
router.get('/:id/ai-status', getAIAnalysisStatus);

module.exports = router;
