-- Add security analysis columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS security_issues JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS security_analyzed_at TIMESTAMP;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_security_score ON projects(security_score);