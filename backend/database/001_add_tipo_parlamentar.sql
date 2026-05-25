-- ============================================================
-- Migração 001: Adicionar coluna tipo_parlamentar
-- Executar no Supabase SQL Editor ou via psql
-- ============================================================

-- Adiciona a coluna somente se ela ainda não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'parlamentar'
          AND column_name = 'tipo_parlamentar'
    ) THEN
        ALTER TABLE parlamentar
            ADD COLUMN tipo_parlamentar VARCHAR(20) NOT NULL DEFAULT 'senador'
            CHECK (tipo_parlamentar IN ('senador', 'deputado'));
    END IF;
END;
$$;

-- Índice para facilitar filtros por tipo
CREATE INDEX IF NOT EXISTS idx_parlamentar_tipo ON parlamentar(tipo_parlamentar);
