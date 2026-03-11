const pool = require('../config/database');

const getProjectFlows = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.userId;

  try {
    // Verify project ownership
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get flows
    const result = await pool.query(
      'SELECT * FROM flows WHERE project_id = $1 ORDER BY method, endpoint',
      [projectId]
    );

    res.json({ flows: result.rows });
  } catch (error) {
    console.error('Get flows error:', error);
    res.status(500).json({ error: 'Server error fetching flows' });
  }
};

const getFlow = async (req, res) => {
  const { flowId } = req.params;
  const userId = req.userId;

  try {
    // Get flow with project ownership verification
    const result = await pool.query(`
      SELECT f.* FROM flows f
      JOIN projects p ON f.project_id = p.id
      WHERE f.id = $1 AND p.user_id = $2
    `, [flowId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    res.json({ flow: result.rows[0] });
  } catch (error) {
    console.error('Get flow error:', error);
    res.status(500).json({ error: 'Server error fetching flow' });
  }
};

module.exports = {
  getProjectFlows,
  getFlow
};
