-- =============================================
-- MIGRATION 004 - Modelo de Coerência Booleana
-- Data: 2026-06
-- =============================================
-- Substitui o modelo de similaridade textual (float) pelo modelo de
-- coerência de postura vs. voto (booleano), alinhado com a proposta do projeto:
-- "O parlamentar discursou A FAVOR ou CONTRA esta pauta — e o voto foi SIM ou NÃO?"
-- =============================================

-- 1. Adicionar coluna de postura extraída pelo LLM
ALTER TABLE score_coerencia
ADD COLUMN IF NOT EXISTS postura_extraida TEXT
CHECK (postura_extraida IN ('A Favor', 'Contra', 'Neutro'));

-- 2. Adicionar voto oficial registrado (para auditabilidade)
ALTER TABLE score_coerencia
ADD COLUMN IF NOT EXISTS voto_registrado TEXT;

-- 3. Adicionar campo booleano de coerência (o árbitro final)
--    TRUE  = postura do discurso alinhada com o voto
--    FALSE = postura do discurso contrária ao voto
--    NULL  = não avaliável (neutro, abstenção, ausência ou LLM offline)
ALTER TABLE score_coerencia
ADD COLUMN IF NOT EXISTS coerente BOOLEAN;

-- 4. Remover a coluna de similaridade de cosseno (sem semântica no novo modelo)
ALTER TABLE score_coerencia
DROP COLUMN IF EXISTS similaridade_coseno;

-- 5. Atualizar o CHECK de status_coerencia para os novos valores
--    (Remove o antigo e adiciona o novo via recriação da constraint)
ALTER TABLE score_coerencia
DROP CONSTRAINT IF EXISTS score_coerencia_status_coerencia_check;

ALTER TABLE score_coerencia
ADD CONSTRAINT score_coerencia_status_coerencia_check
CHECK (status_coerencia IN ('Coerente', 'Incoerente', 'Não Relacionado'));

-- 6. Índice para consultas por resultado booleano
CREATE INDEX IF NOT EXISTS idx_score_coerente
ON score_coerencia(coerente);

-- 7. Atualizar a View de ranking para usar o novo modelo booleano
--    A média do score legacy (100=coerente, 0=incoerente) equivale à taxa booleana.
CREATE OR REPLACE VIEW ranking_coerencia AS
SELECT
    p.id_externo,
    p.nome_urna,
    p.sigla_partido,
    p.sigla_uf,
    p.foto_url,
    p.tipo,
    -- Conta apenas pares com coerente não-NULL (exclui abstenções e LLM offline)
    COUNT(sc.id) FILTER (WHERE sc.coerente IS NOT NULL) AS total_validos,
    COUNT(sc.id) FILTER (WHERE sc.coerente IS TRUE)     AS votos_coerentes,
    -- Taxa de coerência: votos coerentes / total válidos × 100
    CASE
        WHEN COUNT(sc.id) FILTER (WHERE sc.coerente IS NOT NULL) >= 3
        THEN ROUND(
            (COUNT(sc.id) FILTER (WHERE sc.coerente IS TRUE)::NUMERIC
             / COUNT(sc.id) FILTER (WHERE sc.coerente IS NOT NULL)) * 100,
            1
        )
        ELSE NULL  -- dados insuficientes (< 3 pares válidos)
    END AS score_coerencia,
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
ORDER BY score_coerencia DESC NULLS LAST;
