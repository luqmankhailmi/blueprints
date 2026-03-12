-- Add AI analysis columns to projects table
-- Run this migration to add AI analysis support

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_analyzed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_analysis_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_ai_analyzed ON projects(ai_analyzed);

-- Comment for documentation
COMMENT ON COLUMN projects.ai_analyzed IS 'Whether the project has been analyzed with AI';
COMMENT ON COLUMN projects.ai_analysis_date IS 'Timestamp of when AI analysis was performed';
COMMENT ON COLUMN projects.ai_model IS 'AI model used for analysis (e.g., llama-3.3-70b-versatile)';
