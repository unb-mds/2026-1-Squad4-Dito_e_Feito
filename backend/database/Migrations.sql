-- =============================================
-- MIGRATIONS - Dito e Feito
-- Alterações aplicadas após o schema inicial
-- =============================================

-- ───────────────────────────────────────────
-- MIGRATION 001 - Suporte a senadores e cache
-- Data: 2026-05
-- ───────────────────────────────────────────

-- Adiciona tipo (deputado/senador) na tabela parlamentar
ALTER TABLE parlamentar 
ADD COLUMN IF NOT EXISTS tipo TEXT 
CHECK (tipo IN ('deputado', 'senador')) DEFAULT 'deputado';

-- Adiciona controle de sincronização
ALTER TABLE parlamentar 
ADD COLUMN IF NOT EXISTS ultima_sincronizacao TIMESTAMPTZ;

-- Tabela de cache das análises da IA
CREATE TABLE IF NOT EXISTS cache_analise (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parlamentar_id  BIGINT NOT NULL,
    tipo            TEXT CHECK (tipo IN ('deputado', 'senador')),
    modelo_usado    TEXT,
    total_votos     INTEGER,
    resultado       JSONB,
    criado_em       TIMESTAMPTZ DEFAULT now(),
    UNIQUE (parlamentar_id, tipo)
);

CREATE INDEX IF NOT EXISTS idx_cache_parlamentar 
ON cache_analise(parlamentar_id);

-- ───────────────────────────────────────────
-- MIGRATION 002 - Views para o frontend
-- Data: 2026-05
-- ───────────────────────────────────────────

-- View de ranking de coerência (atende RF04 e RF14)
CREATE OR REPLACE VIEW ranking_coerencia AS
SELECT
    p.id_externo,
    p.nome_urna,
    p.sigla_partido,
    p.sigla_uf,
    p.foto_url,
    p.tipo,
    AVG(sc.score) AS media_score,
    COUNT(sc.id) AS total_analises,
    MAX(sc.calculado_em) AS ultima_analise
FROM parlamentar p
LEFT JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY 
    p.id_externo, 
    p.nome_urna, 
    p.sigla_partido, 
    p.sigla_uf, 
    p.foto_url,
    p.tipo
ORDER BY media_score DESC NULLS LAST;

-- View de filtros por partido e estado (atende RF05 e RF06)
CREATE OR REPLACE VIEW parlamentares_por_partido AS
SELECT
    p.sigla_partido,
    p.sigla_uf,
    p.tipo,
    COUNT(DISTINCT p.id) AS total_parlamentares,
    ROUND(AVG(sc.score)::numeric, 2) AS media_coerencia
FROM parlamentar p
LEFT JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY p.sigla_partido, p.sigla_uf, p.tipo
ORDER BY p.sigla_partido, p.sigla_uf;