-- =============================================
-- SEED - Dados iniciais para desenvolvimento
-- Dito e Feito
-- =============================================

-- Parlamentares reais para testes
INSERT INTO parlamentar 
    (id_externo, nome_civil, nome_urna, sigla_partido, sigla_uf, tipo_parlamentar, situacao)
VALUES
    (204534, 'Tabata Amaral de Pontes', 'Tabata Amaral', 'PSB', 'SP', 'deputado', 'Em exercício'),
    (220600, 'Erika Hilton', 'Erika Hilton', 'PSOL', 'SP', 'deputado', 'Em exercício'),
    (160510, 'Arthur César Pereira de Lira', 'Arthur Lira', 'PP', 'AL', 'deputado', 'Em exercício'),
    (178957, 'Guilherme Boulos', 'Guilherme Boulos', 'PSOL', 'SP', 'deputado', 'Em exercício'),
    (5942,   'Randolfe Rodrigues', 'Randolfe Rodrigues', 'PT', 'AP', 'senador', 'Em exercício'),
    (5732,   'Rodrigo Pacheco', 'Rodrigo Pacheco', 'PSD', 'MG', 'senador', 'Em exercício')
ON CONFLICT (id_externo) DO NOTHING;