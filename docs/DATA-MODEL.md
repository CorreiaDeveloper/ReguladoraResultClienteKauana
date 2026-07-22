# Modelo de dados e API — evolução para produção

> Documento de planejamento. Nada aqui está implementado no protótipo. Hoje o
> conteúdo editável vive em `services/store.js` (localStorage). Em produção,
> este armazenamento local deve ser substituído pelos endpoints abaixo.

## Visão geral

O painel administrativo atual persiste tudo no navegador. Para produção,
propõe-se um backend simples (ex.: Node/Express, Fastify ou serverless) com um
banco relacional (PostgreSQL) e autenticação real. O mesmo formato de conteúdo
usado no `store.js` mapeia diretamente para as tabelas abaixo.

## Modelo relacional (PostgreSQL)

```sql
-- Usuários do painel
CREATE TABLE admin_users (
  id            BIGSERIAL PRIMARY KEY,
  email         CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,           -- bcrypt/argon2, NUNCA senha em texto
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'editor', -- 'admin' | 'editor'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conteúdo editável do site (blocos chave-valor versionáveis)
CREATE TABLE site_content (
  key        TEXT PRIMARY KEY,           -- ex.: 'home', 'proof', 'settings'
  value      JSONB NOT NULL,
  updated_by BIGINT REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Artigos / conteúdos
CREATE TABLE articles (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  category   TEXT NOT NULL,
  summary    TEXT,
  body       TEXT,
  status     TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  cover_url  TEXT,
  published_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Formulários recebidos pelo site (contato, SAC, trabalhe conosco, etc.)
CREATE TABLE submissions (
  id         BIGSERIAL PRIMARY KEY,
  type       TEXT NOT NULL,              -- 'geral' | 'trabalhe-conosco' | 'sac' | 'sugestoes' | 'parcerias'
  person     TEXT NOT NULL,
  email      TEXT,
  company    TEXT,
  message    TEXT,
  attachment_url TEXT,                   -- currículo, quando houver
  status     TEXT NOT NULL DEFAULT 'new',-- 'new' | 'in_progress' | 'done'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parceiros/seguradoras (uso de marca controlado)
CREATE TABLE partners (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'seguradora',
  logo_url      TEXT,
  brand_approved BOOLEAN NOT NULL DEFAULT false, -- só publica se true
  visible       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Depoimentos (publicação depende de consentimento)
CREATE TABLE testimonials (
  id            BIGSERIAL PRIMARY KEY,
  author_label  TEXT,                    -- pode ser anônimo: "Imobiliária parceira"
  quote         TEXT NOT NULL,
  consent       BOOLEAN NOT NULL DEFAULT false,
  visible       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indicadores mensais (série de resolutividade)
CREATE TABLE indicators (
  id         BIGSERIAL PRIMARY KEY,
  label      TEXT NOT NULL,              -- 'JUL', 'AGO'...
  value      NUMERIC(5,2) NOT NULL,      -- 0..100
  period     DATE NOT NULL,
  published  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (period)
);

-- Membros da equipe exibidos publicamente
CREATE TABLE team_members (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT,
  bio        TEXT,
  photo_url  TEXT,
  visible    BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);
```

## API REST (esboço)

Autenticação por sessão/JWT. Rotas `GET` públicas expõem apenas dados marcados
como publicados/visíveis; rotas de escrita exigem token de admin.

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | pública | Login → token |
| GET | `/api/content/:key` | pública | Bloco de conteúdo (home, proof, settings) |
| PUT | `/api/content/:key` | admin | Atualiza bloco de conteúdo |
| GET | `/api/articles` | pública | Lista artigos publicados |
| POST/PUT/DELETE | `/api/articles/:id?` | admin | CRUD de artigos |
| POST | `/api/submissions` | pública | Recebe formulário → e-mail interno |
| GET | `/api/submissions` | admin | Lista recebimentos |
| GET/PUT | `/api/indicators` | admin (GET público só publicados) | Série mensal |
| GET/PUT | `/api/partners` | admin (GET público só aprovados) | Parceiros |
| GET/PUT | `/api/testimonials` | admin (GET público só com consentimento) | Depoimentos |
| GET/PUT | `/api/team` | admin (GET público só visíveis) | Equipe |

## Segurança e conformidade (obrigatório antes de publicar)

- Senhas com hash forte (argon2/bcrypt); nunca a senha fixa de demonstração.
- Upload de imagens/currículos validado por tipo e tamanho; armazenar em storage
  dedicado (S3/Cloudflare R2), servir por URL assinada.
- Envio de formulário para e-mail interno **sem** expor o endereço na interface.
- LGPD: base legal, retenção e consentimento para depoimentos/dados de contato.
- Rate limiting e proteção contra spam nos formulários (honeypot/CAPTCHA).
- Não publicar dados por seguradora nem índices de sinistralidade (confidencial).
