# GitHub Cache API - Setup Guide

## 📋 Pré-requisitos

1. **Conta Supabase** - https://supabase.com
2. **GitHub Personal Access Token** - https://github.com/settings/tokens
3. **Conta Vercel** - https://vercel.com

## 🚀 Setup Passo a Passo

### 1. Configurar Supabase

1. Criar novo projeto no Supabase
2. Ir em **SQL Editor**
3. Copiar e executar o conteúdo de `supabase-schema.sql`
4. Verificar se as 4 tabelas foram criadas:
   - `github_followers`
   - `github_project_data`
   - `github_readmes`
   - `github_cache_metadata`

5. Pegar as credenciais:
   - **Project URL**: Settings → API → Project URL
   - **Service Role Key**: Settings → API → service_role (⚠️ NUNCA expor no frontend!)

### 2. Criar GitHub Token

1. Ir em https://github.com/settings/tokens
2. Clicar em **Generate new token (classic)**
3. Dar um nome: `Portfolio Cache API`
4. Selecionar permissões:
   - ✅ `public_repo` - Acesso a repositórios públicos
   - ✅ `read:user` - Ler perfil do usuário
   - ✅ `read:org` - Ler organizações (opcional)
5. Gerar e copiar o token (guarde em local seguro!)

### 3. Configurar Variáveis de Ambiente na Vercel

No seu projeto Vercel, ir em **Settings → Environment Variables** e adicionar:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GitHub
GITHUB_USERNAME=seu-username-github
GITHUB_TOKEN=ghp_...
```

### 4. Deploy na Vercel

```bash
# Fazer commit das mudanças
git add .
git commit -m "Add GitHub cache API with Supabase"
git push

# Deploy
vercel --prod
```

### 5. Testar a API

Após o deploy, testar manualmente:

```bash
curl https://seu-dominio.vercel.app/api/update-github-cache?username=seu-username
```

Resposta esperada:
```json
{
  "success": true,
  "updated_at": "2025-11-27T15:20:00.000Z",
  "data": {
    "followers": 42,
    "project_data": 156,
    "repos_processed": 10
  }
}
```

## 📊 Estrutura dos Dados

### Tabela: `github_followers`
```sql
{
  id: "follower-12345",
  type: "follower",
  username: "username",
  avatar_url: "https://...",
  profile_url: "https://github.com/username",
  context: "home",
  created_at: "2025-11-27T..."
}
```

### Tabela: `github_project_data`
```sql
{
  id: "star-123-456",
  type: "star", // ou 'contributor', 'fork', 'issue_opened', etc.
  username: "username",
  avatar_url: "https://...",
  repo_name: "Shii.logo.app",
  repo_full_name: "yourusername/Shii.logo.app",
  context: "projects",
  project_context: "shii-logo-app",
  created_at: "2025-11-27T..."
}
```

### Tabela: `github_readmes`
```sql
{
  repo_full_name: "yourusername/Shii.logo.app",
  repo_name: "Shii.logo.app",
  readme_content: "# Shii App\n\n...",
  updated_at: "2025-11-27T..."
}
```

## 🎈 Integrar com o Sistema de Balões

### Criar API de leitura (GET)

Criar `api/get-balloon-data.js`:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Usar anon key para leitura
);

export default async function handler(req, res) {
  const { context, project } = req.query;
  
  let query = supabase.from('github_project_data').select('*');
  
  if (context === 'home') {
    // Buscar followers
    const { data: followers } = await supabase
      .from('github_followers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    return res.json({ data: followers });
  }
  
  if (project) {
    // Buscar dados de projeto específico
    query = query.eq('project_context', project);
  } else {
    // Buscar todos os projetos
    query = query.eq('context', 'projects');
  }
  
  const { data } = await query
    .order('created_at', { ascending: false })
    .limit(50);
  
  return res.json({ data });
}
```

### Atualizar `balloons.js`

```javascript
async getAllData() {
    try {
        const context = this.currentContext; // 'home', 'projects', 'shii-app'
        
        const response = await fetch(`/api/get-balloon-data?context=${context}`);
        const { data } = await response.json();
        
        // Transformar para formato do balão
        return data.map(item => ({
            id: item.id,
            type: 'notification',
            name: item.username,
            message: this.getMessageForType(item.type, item),
            badge: this.getBadgeForType(item.type),
            image: item.avatar_url,
            contexts: [context]
        }));
    } catch (error) {
        console.error('Error fetching balloon data:', error);
        return this.getFallbackData();
    }
}

getMessageForType(type, item) {
    const messages = {
        'follower': 'Started following you on GitHub',
        'star': `Starred ${item.repo_name}`,
        'contributor': `Contributed to ${item.repo_name}`,
        'fork': `Forked ${item.repo_name}`,
        'issue_opened': `Opened issue: ${item.issue_title}`,
        'issue_closed': `Closed issue in ${item.repo_name}`,
        'pr_opened': `Opened PR: ${item.pr_title}`,
        'pr_merged': `Merged PR in ${item.repo_name}`
    };
    return messages[type] || 'GitHub activity';
}

getBadgeForType(type) {
    const badges = {
        'follower': '👥',
        'star': '⭐',
        'contributor': '💻',
        'fork': '🍴',
        'issue_opened': '🐛',
        'issue_closed': '🔧',
        'pr_opened': '📝',
        'pr_merged': '✅'
    };
    return badges[type] || '📌';
}
```

## ⏰ Cron Job

O cron job está configurado para rodar a cada 6 horas automaticamente.

Para forçar atualização manual:
```bash
curl -X POST https://seu-dominio.vercel.app/api/update-github-cache?username=seu-username
```

## 📈 Rate Limits

- **Sem token**: 60 requisições/hora
- **Com token**: 5,000 requisições/hora

A API processa ~10 repos × ~6 endpoints = ~60 requisições por execução.

## 🔒 Segurança

- ✅ Service Role Key nunca exposta no frontend
- ✅ RLS habilitado no Supabase
- ✅ Leitura pública, escrita apenas via API
- ✅ GitHub token armazenado como variável de ambiente

## 🎯 Próximos Passos

1. ✅ Executar schema SQL no Supabase
2. ✅ Configurar variáveis de ambiente
3. ✅ Deploy na Vercel
4. ✅ Testar API manualmente
5. ⏳ Criar API de leitura (`get-balloon-data.js`)
6. ⏳ Integrar com sistema de balões
7. ⏳ Testar em produção
