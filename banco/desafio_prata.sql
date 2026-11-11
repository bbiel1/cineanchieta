-- ============================================================
-- CineAnchieta — Entrega 2 / Desafio Prata
--
-- Duas tarefas (títulos) novas para a Ana, cada uma com uma
-- tag (gênero) ligada na tabela N:N titulo_genero.
--
-- Rode DEPOIS de banco/script.sql.
-- ============================================================

USE cineanchieta;

-- 1) Duas novas tarefas da Ana
INSERT INTO titulos (usuario_id, titulo, formato, status, lancamento)
VALUES
  (1, 'Duna: Parte Três', 'filme', 'quero_ver', NULL),
  (1, 'Severance',        'serie', 'quero_ver', '2022-02-18');

-- 2) Uma tag nova para a Ana (a "ficção científica" já existe)
INSERT INTO generos (usuario_id, nome)
VALUES (1, 'suspense');

-- 3) Liga a primeira tarefa a uma tag que já existia.
-- As subconsultas evitam depender dos ids gerados pelo AUTO_INCREMENT.
INSERT INTO titulo_genero (titulo_id, genero_id)
SELECT t.id, g.id
FROM titulos AS t
JOIN generos AS g
  ON g.usuario_id = t.usuario_id
WHERE t.titulo = 'Duna: Parte Três'
  AND t.usuario_id = 1
  AND g.nome = 'ficção científica'
  AND g.usuario_id = 1;

-- 4) Liga a segunda tarefa à tag nova.
INSERT INTO titulo_genero (titulo_id, genero_id)
SELECT t.id, g.id
FROM titulos AS t
JOIN generos AS g
  ON g.usuario_id = t.usuario_id
WHERE t.titulo = 'Severance'
  AND t.usuario_id = 1
  AND g.nome = 'suspense'
  AND g.usuario_id = 1;

-- Conferência: as duas tarefas com suas tags
SELECT t.id, t.titulo, g.nome AS genero
FROM titulos AS t
JOIN titulo_genero AS tg ON tg.titulo_id = t.id
JOIN generos AS g        ON g.id = tg.genero_id
WHERE t.titulo IN ('Duna: Parte Três', 'Severance')
ORDER BY t.id;
