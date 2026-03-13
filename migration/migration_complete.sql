-- Complete migration: adds tech_stack + AI analysis columns to projects table
-- Safe to run multiple times (uses IF NOT EXISTS / IF NOT EXISTS equivalent)

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS tech_stack JSONB,
  ADD COLUMN IF NOT EXISTS ai_analyzed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_analysis_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_projects_ai_analyzed ON projects(ai_analyzed);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;