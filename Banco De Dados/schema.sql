-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Parlamentar
CREATE TABLE parlamentar (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_externo      BIGINT UNIQUE,
    nome_civil      TEXT NOT NULL,
    nome_urna       TEXT,
    sigla_partido   VARCHAR(15),
    sigla_uf        VARCHAR(2),
    foto_url        TEXT,
    situacao        TEXT,
    dados_api       JSONB,
    criado_em       TIMESTAMPTZ DEFAULT now(),
    atualizado_em   TIMESTAMPTZ DEFAULT now()
);

-- Discurso
CREATE TABLE discurso (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_externo      BIGINT UNIQUE,
    parlamentar_id  UUID NOT NULL REFERENCES parlamentar(id) ON DELETE CASCADE,
    data_hora       TIMESTAMPTZ NOT NULL,
    sumario         TEXT,
    transcricao     TEXT,
    palavras_chave  TEXT[],
    dados_api       JSONB,
    criado_em       TIMESTAMPTZ DEFAULT now()
);

-- Proposição
CREATE TABLE proposicao (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_externo      BIGINT UNIQUE,
    sigla_tipo      VARCHAR(10),
    numero          INTEGER,
    ano             INTEGER,
    ementa          TEXT,
    dados_api       JSONB,
    criado_em       TIMESTAMPTZ DEFAULT now()
);

-- Votação
CREATE TABLE votacao (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_externo      TEXT UNIQUE,
    proposicao_id   UUID REFERENCES proposicao(id) ON DELETE SET NULL,
    data_hora       TIMESTAMPTZ NOT NULL,
    descricao       TEXT,
    aprovada        BOOLEAN,
    dados_api       JSONB,
    criado_em       TIMESTAMPTZ DEFAULT now()
);

-- Tipo ENUM para resultado do voto
CREATE TYPE resultado_voto AS ENUM (
    'Sim', 'Não', 'Abstenção', 'Obstrução', 'Art. 17', 'Ausente'
);

-- Voto individual
CREATE TABLE voto (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parlamentar_id  UUID NOT NULL REFERENCES parlamentar(id) ON DELETE CASCADE,
    votacao_id      UUID NOT NULL REFERENCES votacao(id) ON DELETE CASCADE,
    resultado       resultado_voto NOT NULL,
    criado_em       TIMESTAMPTZ DEFAULT now(),
    UNIQUE (parlamentar_id, votacao_id)
);

-- Score de coerência
CREATE TABLE score_coerencia (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parlamentar_id      UUID NOT NULL REFERENCES parlamentar(id) ON DELETE CASCADE,
    discurso_id         UUID REFERENCES discurso(id) ON DELETE SET NULL,
    votacao_id          UUID REFERENCES votacao(id) ON DELETE SET NULL,
    score               NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
    similaridade_coseno FLOAT,
    modelo_usado        TEXT,
    justificativa       TEXT,
    calculado_em        TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_discurso_parlamentar ON discurso(parlamentar_id);
CREATE INDEX idx_voto_parlamentar     ON voto(parlamentar_id);
CREATE INDEX idx_voto_votacao         ON voto(votacao_id);
CREATE INDEX idx_score_parlamentar    ON score_coerencia(parlamentar_id);
CREATE INDEX idx_parlamentar_partido  ON parlamentar(sigla_partido);
CREATE INDEX idx_parlamentar_uf       ON parlamentar(sigla_uf);