-- ========================================
-- SUPABASE DATABASE SCHEMA
-- GitHub Cache Tables
-- ========================================

-- 1. Tabela de Followers (para Home)
CREATE TABLE IF NOT EXISTS github_followers (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'follower',
  username TEXT NOT NULL,
  avatar_url TEXT,
  profile_url TEXT,
  context TEXT NOT NULL DEFAULT 'home',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Project Data (stars, contributors, forks, issues, PRs)
CREATE TABLE IF NOT EXISTS github_project_data (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'star', 'contributor', 'fork', 'issue_opened', 'issue_closed', 'pr_opened', 'pr_merged'
  username TEXT NOT NULL,
  avatar_url TEXT,
  profile_url TEXT,
  
  -- Repo info
  repo_name TEXT NOT NULL,
  repo_full_name TEXT NOT NULL,
  
  -- Context
  context TEXT NOT NULL DEFAULT 'projects', -- 'projects' ou 'home'
  project_context TEXT, -- Nome do projeto específico (ex: 'shii-app')
  
  -- Dados específicos por tipo
  contributions INTEGER, -- Para contributors
  fork_url TEXT, -- Para forks
  issue_title TEXT, -- Para issues
  issue_url TEXT,
  issue_number INTEGER,
  pr_title TEXT, -- Para PRs
  pr_url TEXT,
  pr_number INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de READMEs dos projetos
CREATE TABLE IF NOT EXISTS github_readmes (
  repo_full_name TEXT PRIMARY KEY,
  repo_name TEXT NOT NULL,
  readme_content TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Metadata (controle de cache)
CREATE TABLE IF NOT EXISTS github_cache_metadata (
  username TEXT PRIMARY KEY,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  followers_count INTEGER DEFAULT 0,
  project_data_count INTEGER DEFAULT 0
);

-- ========================================
-- INDEXES para melhor performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_followers_context ON github_followers(context);
CREATE INDEX IF NOT EXISTS idx_followers_created ON github_followers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_data_context ON github_project_data(context);
CREATE INDEX IF NOT EXISTS idx_project_data_project_context ON github_project_data(project_context);
CREATE INDEX IF NOT EXISTS idx_project_data_type ON github_project_data(type);
CREATE INDEX IF NOT EXISTS idx_project_data_repo ON github_project_data(repo_name);
CREATE INDEX IF NOT EXISTS idx_project_data_created ON github_project_data(created_at DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- Permitir leitura pública, escrita apenas via service role
-- ========================================

ALTER TABLE github_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_readmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_cache_metadata ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
CREATE POLICY "Allow public read access on followers"
  ON github_followers FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on project data"
  ON github_project_data FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on readmes"
  ON github_readmes FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on metadata"
  ON github_cache_metadata FOR SELECT
  USING (true);

-- Políticas de escrita apenas via service role
-- (Não precisa criar políticas de INSERT/UPDATE/DELETE pois só o service role terá acesso)
