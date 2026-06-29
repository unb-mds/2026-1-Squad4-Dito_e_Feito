-- =============================================
-- MIGRATION 008 - Fix completo: colunas faltantes + views corrigidas
-- Data: 2026-06-29
-- =============================================
-- Aplica as colunas da migration 006 que nao estavam no banco
-- e recria todas as views com a estrutura correta.
-- =============================================

-- ─────────────────────────────────────────────
-- PASSO 1: Adicionar colunas faltantes em score_coerencia
-- (Migration 006 nunca foi aplicada no banco live)
-- ─────────────────────────────────────────────

ALTER TABLE score_coerencia
ADD COLUMN IF NOT EXISTS postura_extraida TEXT;

ALTER TABLE score_coerencia
ADD COLUMN IF NOT EXISTS voto_registrado TEXT;

ALTER TABLE score_coerencia
ADD COLUMN IF NOT EXISTS coerente BOOLEAN;

ALTER TABLE score_coerencia
DROP COLUMN IF EXISTS similaridade_coseno;

-- Atualizar constraint de status_coerencia
ALTER TABLE score_coerencia
DROP CONSTRAINT IF EXISTS score_coerencia_status_coerencia_check;

ALTER TABLE score_coerencia
ADD CONSTRAINT score_coerencia_status_coerencia_check
CHECK (status_coerencia IN ('Coerente', 'Incoerente', 'Nao Relacionado', 'Não Relacionado'));

-- ─────────────────────────────────────────────
-- PASSO 2: Inferir 'coerente' dos dados existentes (score legacy)
-- score=100 -> coerente=TRUE, score=0 -> coerente=FALSE
-- ─────────────────────────────────────────────

UPDATE score_coerencia
SET coerente = CASE
    WHEN score = 100 THEN TRUE
    WHEN score = 0   THEN FALSE
    ELSE NULL
END
WHERE coerente IS NULL AND score IS NOT NULL;

UPDATE score_coerencia
SET status_coerencia = CASE
    WHEN coerente IS TRUE  THEN 'Coerente'
    WHEN coerente IS FALSE THEN 'Incoerente'
    ELSE 'Nao Relacionado'
END
WHERE status_coerencia IS NULL;

-- ─────────────────────────────────────────────
-- PASSO 3: Verificar e corrigir parametro_coleta
-- ─────────────────────────────────────────────

ALTER TABLE parametro_coleta
ADD COLUMN IF NOT EXISTS descricao TEXT;

INSERT INTO parametro_coleta (chave, valor, descricao)
VALUES
    ('data_inicio_coleta', '2024-01-01', 'Data de inicio padrao para busca de discursos e votos'),
    ('data_fim_coleta',    '2026-12-31', 'Data de fim padrao para busca de discursos e votos'),
    ('limite_por_partido', '6',          'Maximo de senadores por partido no scan completo'),
    ('min_pares_validos',  '3',          'Minimo de pares validos para ter score calculado')
ON CONFLICT (chave) DO NOTHING;

-- ─────────────────────────────────────────────
-- PASSO 4: Indices nas novas colunas
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_score_coerente
    ON score_coerencia(coerente);

CREATE INDEX IF NOT EXISTS idx_score_postura
    ON score_coerencia(postura_extraida);

-- ─────────────────────────────────────────────
-- PASSO 5: Recriar VIEW ranking_coerencia (com colunas corretas)
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
-- PASSO 6: Recriar VIEW parlamentares_por_partido
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
-- PASSO 7: Recriar VIEW evolucao_coerencia
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
-- PASSO 8: Recriar VIEW comparacao_parlamentares
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW comparacao_parlamentares AS
SELECT
    p.id_externo,
    COALESCE(p.nome_urna, p.nome_civil)          AS nome_urna,
    p.sigla_partido,
    p.sigla_uf,
    p.tipo_parlamentar,
    ROUND(AVG(sc.score)::numeric, 2)              AS media_score,
    MAX(sc.score)                                 AS maior_score,
    MIN(sc.score)                                 AS menor_score,
    COUNT(sc.id)                                  AS total_analises,
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
-- PASSO 9: Recriar VIEW votos_por_parlamentar
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
-- PASSO 10: Recriar VIEW alertas_divergencia (corrigida)
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
WHERE sc.coerente IS FALSE
   OR sc.score < 40
ORDER BY sc.score ASC NULLS LAST;

-- ─────────────────────────────────────────────
-- PASSO 11: Recriar VIEW media_por_partido
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
