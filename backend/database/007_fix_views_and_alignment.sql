-- =============================================
-- MIGRATION 007 - Alinhamento completo com o backend
-- Data: 2026-06-29
-- =============================================
-- Corrige inconsistencias entre schema, migrations anteriores e
-- o comportamento real do scan_senators.py + api.py.
-- SEGURO: usa IF NOT EXISTS / CREATE OR REPLACE / nao apaga dados.
-- =============================================

-- ─────────────────────────────────────────────
-- PASSO 1: Garantir colunas tipo e tipo_parlamentar
-- ─────────────────────────────────────────────

ALTER TABLE parlamentar
ADD COLUMN IF NOT EXISTS tipo_parlamentar VARCHAR(20) DEFAULT 'senador';

ALTER TABLE parlamentar
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'senador';

-- Sincroniza 'tipo' com 'tipo_parlamentar' nos registros existentes
UPDATE parlamentar
SET tipo = tipo_parlamentar
WHERE tipo IS DISTINCT FROM tipo_parlamentar;

-- ─────────────────────────────────────────────
-- PASSO 2: Popula nome_urna com nome_civil onde estiver vazio
-- ─────────────────────────────────────────────

UPDATE parlamentar
SET nome_urna = nome_civil
WHERE nome_urna IS NULL OR TRIM(nome_urna) = '';

-- ─────────────────────────────────────────────
-- PASSO 3: Corrigir VIEW ranking_coerencia
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW ranking_coerencia AS
SELECT
    p.id_externo,
    COALESCE(p.nome_urna, p.nome_civil)  AS nome_urna,
    p.nome_civil,
    p.sigla_partido,
    p.sigla_uf,
    p.foto_url,
    p.tipo_parlamentar,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS NOT NULL) AS total_validos,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS TRUE)     AS votos_coerentes,
    CASE
        WHEN COUNT(sc.id) FILTER (WHERE sc.coerente IS NOT NULL) >= 3
        THEN ROUND(
            (COUNT(sc.id) FILTER (WHERE sc.coerente IS TRUE)::NUMERIC
             / COUNT(sc.id) FILTER (WHERE sc.coerente IS NOT NULL)) * 100,
            1
        )
        ELSE NULL
    END AS score_coerencia,
    MAX(sc.calculado_em) AS ultima_analise
FROM parlamentar p
LEFT JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY
    p.id_externo,
    p.nome_urna,
    p.nome_civil,
    p.sigla_partido,
    p.sigla_uf,
    p.foto_url,
    p.tipo_parlamentar
ORDER BY score_coerencia DESC NULLS LAST;

-- ─────────────────────────────────────────────
-- PASSO 4: Corrigir VIEW parlamentares_por_partido
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW parlamentares_por_partido AS
SELECT
    p.sigla_partido,
    p.sigla_uf,
    p.tipo_parlamentar,
    COUNT(DISTINCT p.id)                                    AS total_parlamentares,
    ROUND(AVG(sc.score)::numeric, 2)                        AS media_coerencia,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS TRUE)         AS total_coerentes,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS NOT NULL)     AS total_validos
FROM parlamentar p
LEFT JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY p.sigla_partido, p.sigla_uf, p.tipo_parlamentar
ORDER BY p.sigla_partido, p.sigla_uf;

-- ─────────────────────────────────────────────
-- PASSO 5: Corrigir VIEW evolucao_coerencia
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW evolucao_coerencia AS
SELECT
    COALESCE(p.nome_urna, p.nome_civil)  AS nome_urna,
    p.sigla_partido,
    DATE_TRUNC('month', sc.calculado_em) AS mes,
    ROUND(AVG(sc.score)::numeric, 2)     AS media_mensal,
    COUNT(sc.id)                         AS total_analises,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS TRUE)         AS coerentes,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS NOT NULL)     AS validos
FROM score_coerencia sc
JOIN parlamentar p ON p.id = sc.parlamentar_id
GROUP BY p.nome_urna, p.nome_civil, p.sigla_partido, mes
ORDER BY p.nome_civil, mes;

-- ─────────────────────────────────────────────
-- PASSO 6: Corrigir VIEW comparacao_parlamentares
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW comparacao_parlamentares AS
SELECT
    p.id_externo,
    COALESCE(p.nome_urna, p.nome_civil)         AS nome_urna,
    p.sigla_partido,
    p.sigla_uf,
    p.tipo_parlamentar,
    ROUND(AVG(sc.score)::numeric, 2)             AS media_score,
    MAX(sc.score)                                AS maior_score,
    MIN(sc.score)                                AS menor_score,
    COUNT(sc.id)                                 AS total_analises,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS TRUE)      AS coerentes,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS FALSE)     AS incoerentes,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS NOT NULL)  AS total_validos
FROM parlamentar p
JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY
    p.id_externo,
    p.nome_urna,
    p.nome_civil,
    p.sigla_partido,
    p.sigla_uf,
    p.tipo_parlamentar;

-- ─────────────────────────────────────────────
-- PASSO 7: Corrigir VIEW cobertura_banco
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW cobertura_banco AS
SELECT
    tipo_parlamentar,
    COUNT(DISTINCT p.id)                AS total,
    COUNT(DISTINCT sc.parlamentar_id)   AS com_score,
    ROUND(
        COUNT(DISTINCT sc.parlamentar_id)::numeric /
        NULLIF(COUNT(DISTINCT p.id), 0) * 100,
    1)                                  AS cobertura_pct
FROM parlamentar p
LEFT JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY tipo_parlamentar;

-- ─────────────────────────────────────────────
-- PASSO 8: Corrigir VIEW votos_por_parlamentar
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW votos_por_parlamentar AS
SELECT
    p.id_externo,
    COALESCE(p.nome_urna, p.nome_civil)  AS nome_urna,
    p.sigla_partido,
    sc.score,
    sc.coerente,
    sc.postura_extraida,
    sc.voto_registrado,
    sc.status_coerencia,
    sc.justificativa,
    sc.modelo_usado,
    sc.calculado_em
FROM score_coerencia sc
JOIN parlamentar p ON p.id = sc.parlamentar_id
ORDER BY sc.calculado_em DESC;

-- ─────────────────────────────────────────────
-- PASSO 9: Corrigir VIEW alertas_divergencia
-- (status 'Divergente' nao existe — correto eh 'Incoerente')
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW alertas_divergencia AS
SELECT
    p.id_externo,
    COALESCE(p.nome_urna, p.nome_civil)  AS nome_urna,
    p.sigla_partido,
    p.sigla_uf,
    sc.score,
    sc.postura_extraida,
    sc.voto_registrado,
    sc.justificativa,
    sc.calculado_em
FROM score_coerencia sc
JOIN parlamentar p ON p.id = sc.parlamentar_id
WHERE sc.status_coerencia = 'Incoerente'
   OR (sc.coerente IS FALSE)
   OR sc.score < 40
ORDER BY sc.score ASC NULLS LAST;

-- ─────────────────────────────────────────────
-- PASSO 10: Corrigir VIEW media_por_partido
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW media_por_partido AS
SELECT
    p.sigla_partido,
    p.tipo_parlamentar,
    COUNT(DISTINCT p.id)             AS total_parlamentares,
    ROUND(AVG(sc.score)::numeric, 2) AS media_score,
    MAX(sc.score)                    AS maior_score,
    MIN(sc.score)                    AS menor_score,
    ROUND(
        AVG(CASE WHEN sc.coerente IS TRUE  THEN 100.0
                 WHEN sc.coerente IS FALSE THEN 0.0
                 ELSE NULL END)::numeric,
    1)                               AS taxa_coerencia_pct
FROM parlamentar p
JOIN score_coerencia sc ON sc.parlamentar_id = p.id
GROUP BY p.sigla_partido, p.tipo_parlamentar
ORDER BY media_score DESC;

-- ─────────────────────────────────────────────
-- PASSO 11: Garantir tabela parametro_coleta
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parametro_coleta (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave           TEXT UNIQUE NOT NULL,
    valor           TEXT,
    descricao       TEXT,
    atualizado_em   TIMESTAMPTZ DEFAULT now()
);

INSERT INTO parametro_coleta (chave, valor, descricao)
VALUES
    ('data_inicio_coleta', '2024-01-01', 'Data de inicio padrao para busca de discursos e votos'),
    ('data_fim_coleta',    '2026-12-31', 'Data de fim padrao para busca de discursos e votos'),
    ('limite_por_partido', '6',          'Maximo de senadores por partido no scan completo'),
    ('min_pares_validos',  '3',          'Minimo de pares validos para ter score calculado')
ON CONFLICT (chave) DO NOTHING;

-- ─────────────────────────────────────────────
-- PASSO 12: Indices adicionais de performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_score_coerente
    ON score_coerencia(coerente);

CREATE INDEX IF NOT EXISTS idx_score_calculado_em
    ON score_coerencia(calculado_em);

CREATE INDEX IF NOT EXISTS idx_parlamentar_tipo_parlamentar
    ON parlamentar(tipo_parlamentar);
