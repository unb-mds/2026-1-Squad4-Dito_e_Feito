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

-- ───────────────────────────────────────────
-- MIGRATION 003 - Suporte à integração backend
-- Data: 2026-05
-- ───────────────────────────────────────────

-- Adiciona coluna tipo_parlamentar usada pelo backend (api.py e scan_senators.py)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'parlamentar'
          AND column_name = 'tipo_parlamentar'
    ) THEN
        ALTER TABLE parlamentar
            ADD COLUMN tipo_parlamentar VARCHAR(20) NOT NULL DEFAULT 'deputado'
            CHECK (tipo_parlamentar IN ('senador', 'deputado'));
    END IF;
END;
$$;

-- Índice para filtros por tipo de parlamentar
CREATE INDEX IF NOT EXISTS idx_parlamentar_tipo 
ON parlamentar(tipo_parlamentar);

-- Garante constraint UNIQUE no id_externo para upserts do backend
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'parlamentar'
          AND ccu.column_name = 'id_externo'
          AND tc.constraint_type = 'UNIQUE'
    ) THEN
        ALTER TABLE parlamentar 
        ADD CONSTRAINT parlamentar_id_externo_unique UNIQUE (id_externo);
    END IF;
END;
$$;

-- ───────────────────────────────────────────
-- MIGRATION 004 - Views e índices adicionais
-- Data: 2026-05
-- ───────────────────────────────────────────

-- Índices de performance no score_coerencia
CREATE INDEX IF NOT EXISTS idx_score_calculado_em 
ON score_coerencia(calculado_em);

CREATE INDEX IF NOT EXISTS idx_score_modelo 
ON score_coerencia(modelo_usado);

-- View de evolução temporal (RF08)
CREATE OR REPLACE VIEW evolucao_coerencia AS
SELECT
    p.nome_urna,
    p.sigla_partido,
    DATE_TRUNC('month', sc.calculado_em) AS mes,
    ROUND(AVG(sc.score)::numeric, 2) AS media_mensal,
    COUNT(sc.id) AS total_analises
FROM score_coerencia sc
JOIN parlamentar p ON p.id = sc.parlamentar_id
GROUP BY p.nome_urna, p.sigla_partido, mes
ORDER BY p.nome_urna, mes;

-- View de comparação entre parlamentares (RF10 e RF13)
CREATE OR REPLACE VIEW comparacao_parlamentares AS
SELECT
    p.id_externo,
    p.nome_urna,
    p.sigla_partido,
    p.sigla_uf,
    p.tipo_parlamentar,
    ROUND(AVG(sc.score)::numeric, 2) AS media_score,
    MAX(sc.score) AS maior_score,
    MIN(sc.score) AS menor_score,
    COUNT(sc.id) AS total_analises
FROM parlamentar p
JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY 
    p.id_externo, 
    p.nome_urna, 
    p.sigla_partido, 
    p.sigla_uf, 
    p.tipo_parlamentar;

-- View de cobertura do banco
CREATE OR REPLACE VIEW cobertura_banco AS
SELECT
    tipo_parlamentar,
    COUNT(DISTINCT p.id) AS total,
    COUNT(DISTINCT sc.parlamentar_id) AS com_score,
    ROUND(COUNT(DISTINCT sc.parlamentar_id)::numeric / 
          COUNT(DISTINCT p.id) * 100, 1) AS cobertura_pct
FROM parlamentar p
LEFT JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY tipo_parlamentar;

-- ───────────────────────────────────────────
-- MIGRATION 005 - Views para endpoints do backend
-- Data: 2026-06
-- ───────────────────────────────────────────

-- View de votos por parlamentar (endpoint /api/politico/<id>)
CREATE OR REPLACE VIEW votos_por_parlamentar AS
SELECT
    p.id_externo,
    p.nome_urna,
    p.sigla_partido,
    sc.score,
    sc.status_coerencia,
    sc.justificativa,
    sc.modelo_usado,
    sc.calculado_em
FROM score_coerencia sc
JOIN parlamentar p ON p.id = sc.parlamentar_id
ORDER BY sc.calculado_em DESC;

-- View de alertas de divergência (RF11)
CREATE OR REPLACE VIEW alertas_divergencia AS
SELECT
    p.id_externo,
    p.nome_urna,
    p.sigla_partido,
    p.sigla_uf,
    sc.score,
    sc.justificativa,
    sc.calculado_em
FROM score_coerencia sc
JOIN parlamentar p ON p.id = sc.parlamentar_id
WHERE sc.status_coerencia = 'Divergente'
   OR sc.score < 40
ORDER BY sc.score ASC;

-- View de média por partido (dashboard e gráficos)
CREATE OR REPLACE VIEW media_por_partido AS
SELECT
    p.sigla_partido,
    p.tipo_parlamentar,
    COUNT(DISTINCT p.id) AS total_parlamentares,
    ROUND(AVG(sc.score)::numeric, 2) AS media_score,
    MAX(sc.score) AS maior_score,
    MIN(sc.score) AS menor_score
FROM parlamentar p
JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY p.sigla_partido, p.tipo_parlamentar
ORDER BY media_score DESC;