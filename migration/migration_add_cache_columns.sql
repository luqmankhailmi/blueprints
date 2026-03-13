-- Add analysis cache columns so architecture data is stored and not re-computed on every load
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS directory_data JSONB,
  ADD COLUMN IF NOT EXISTS dependencies_data JSONB,
  ADD COLUMN IF NOT EXISTS tech_stack JSONB,
  ADD COLUMN IF NOT EXISTS ai_analyzed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_analysis_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS ai_model VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_projects_ai_analyzed ON projects(ai_analyzed);