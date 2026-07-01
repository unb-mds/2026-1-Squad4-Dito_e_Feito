-- =============================================
-- MIGRATION 009 - Drop e recria views com conflito de colunas
-- Data: 2026-06-29
-- =============================================
-- Dropa as 4 views que nao puderam ser recriadas com CREATE OR REPLACE
-- e as recria com a estrutura correta.
-- =============================================

-- Drop em ordem (dependencias primeiro)
DROP VIEW IF EXISTS ranking_coerencia CASCADE;
DROP VIEW IF EXISTS parlamentares_por_partido CASCADE;
DROP VIEW IF EXISTS votos_por_parlamentar CASCADE;
DROP VIEW IF EXISTS alertas_divergencia CASCADE;

-- ─────────────────────────────────────────────
-- Recriar ranking_coerencia
-- ─────────────────────────────────────────────
CREATE VIEW ranking_coerencia AS
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
-- Recriar parlamentares_por_partido
-- ─────────────────────────────────────────────
CREATE VIEW parlamentares_por_partido AS
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
-- Recriar votos_por_parlamentar
-- ─────────────────────────────────────────────
CREATE VIEW votos_por_parlamentar AS
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
-- Recriar alertas_divergencia (com status correto)
-- ─────────────────────────────────────────────
CREATE VIEW alertas_divergencia AS
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
