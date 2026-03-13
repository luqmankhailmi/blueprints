const pool = require('../config/database');
const AITechStackAnalyzer = require('../services/aiTechStackAnalyzer');
const TechStackDetector = require('../services/techStackDetector');

/**
 * Trigger AI-powered tech stack analysis
 * POST /api/projects/:id/ai-analyze
 */
exports.executeAIAnalysis = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.userId;

    // Check if GROQ_API_KEY is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'AI analysis is not configured. Please add GROQ_API_KEY to environment variables.'
      });
    }

    // Get project from database
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    if (!project.file_path) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded for this project'
      });
    }

    console.log(`Starting AI analysis for project ${projectId}...`);

    // Run basic analysis first
    const basicDetector = new TechStackDetector(project.file_path);
    const basicAnalysis = await basicDetector.detect();

    // Run AI analysis
    const aiAnalyzer = new AITechStackAnalyzer(project.file_path, process.env.GROQ_API_KEY);
    const aiResult = await aiAnalyzer.analyzeWithAI(basicAnalysis);

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: aiResult.error,
        fallbackAnalysis: aiResult.analysis
      });
    }

    // Update project with AI-enhanced analysis
    await pool.query(
      `UPDATE projects 
       SET tech_stack = $1, 
           ai_analyzed = true,
           ai_analysis_date = CURRENT_TIMESTAMP,
           ai_model = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [JSON.stringify(aiResult.analysis), aiResult.aiModel, projectId]
    );

    console.log(`AI analysis completed for project ${projectId}`);

    res.json({
      success: true,
      message: 'AI analysis completed successfully',
      techStack: aiResult.analysis,
      aiModel: aiResult.aiModel,
      timestamp: aiResult.timestamp,
      insights: aiResult.analysis.insights || null
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute AI analysis',
      details: error.message
    });
  }
};

/**
 * Get AI analysis status for a project
 * GET /api/projects/:id/ai-status
 */
exports.getAIAnalysisStatus = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.userId;

    const result = await pool.query(
      `SELECT ai_analyzed, ai_analysis_date, ai_model 
       FROM projects 
       WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const project = result.rows[0];

    res.json({
      success: true,
      aiAnalyzed: project.ai_analyzed || false,
      aiAnalysisDate: project.ai_analysis_date,
      aiModel: project.ai_model,
      groqConfigured: !!process.env.GROQ_API_KEY
    });

  } catch (error) {
    console.error('Error fetching AI status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI analysis status'
    });
  }
};