const pool = require('./database');

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        avatar_url TEXT,
        github_id VARCHAR(255) UNIQUE,
        github_token TEXT,
        github_username VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        source_type VARCHAR(50) DEFAULT 'upload',
        file_path TEXT,
        file_name VARCHAR(255),
        file_size BIGINT,
        github_repo_url TEXT,
        github_repo_name VARCHAR(255),
        github_branch VARCHAR(255) DEFAULT 'main',
        uploaded_at TIMESTAMP,
        tech_stack JSONB,
        ai_analyzed BOOLEAN DEFAULT FALSE,
        ai_analysis_date TIMESTAMP,
        ai_model VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Flows table (analyzed API flows)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS flows (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        endpoint VARCHAR(500) NOT NULL,
        method VARCHAR(10) NOT NULL,
        flow_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
      CREATE INDEX IF NOT EXISTS idx_flows_project_id ON flows(project_id);
      CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = { createTables };