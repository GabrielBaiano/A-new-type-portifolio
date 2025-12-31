-- ========================================
-- SUPABASE DATABASE SCHEMA
-- GitHub Cache Tables
-- ========================================

-- 1. [DEPRECATED] Tabela de Followers
-- Not used in current portfolio version
/*
CREATE TABLE IF NOT EXISTS github_followers (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'follower',
  username TEXT NOT NULL,
  avatar_url TEXT,
  profile_url TEXT,
  context TEXT NOT NULL DEFAULT 'home',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- 2. Tabela de Project Data (stars, contributors, releases)
CREATE TABLE IF NOT EXISTS github_project_data (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'star', 'contributor', 'release'
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
  
  -- [DEPRECATED] Granular tracking removed to simplify background balloons
  /*
  fork_url TEXT,
  issue_title TEXT,
  issue_url TEXT,
  issue_number INTEGER,
  pr_title TEXT,
  pr_url TEXT,
  pr_number INTEGER,
  */
  
  -- Releases
  release_tag TEXT,
  release_notes TEXT,
  
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

-- --------------------------------------------------------
-- LEETCODE DAILY CHALLENGES
-- --------------------------------------------------------
CREATE TABLE leetcode_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    external_link TEXT,
    streak INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup of the latest challenge
CREATE INDEX idx_leetcode_created_at ON leetcode_challenges(created_at DESC);

ALTER TABLE leetcode_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on leetcode"
  ON leetcode_challenges FOR SELECT
  USING (true);
