-- ============================================================
-- CineAnchieta — testes de erro da Aula 2
--
-- Pré-requisito: banco/script.sql já executado.
-- Rode UM comando por vez (selecione a linha e clique no raio)
-- e leia a mensagem que o MySQL devolve.
-- ============================================================

USE cineanchieta;

-- 1) Valor fora do ENUM de status
-- Esperado: Error 1265 — Data truncated for column 'status' at row 1
INSERT INTO titulos (usuario_id, titulo, status)
VALUES (1, 'Testar', 'feito');

-- 2) Título com menos de 3 caracteres (regra do CHECK)
-- Esperado: Error 3819 — Check constraint 'ck_titulos_titulo' is violated.
INSERT INTO titulos (usuario_id, titulo)
VALUES (1, 'ab');

-- 3) Chave estrangeira apontando para um usuário que não existe
-- Esperado: Error 1452 — Cannot add or update a child row:
--           a foreign key constraint fails
INSERT INTO titulos (usuario_id, titulo)
VALUES (99, 'Título sem dono');

-- 4) Agora insira um título válido e olhe o id que ele recebeu.
-- Os números das tentativas que falharam podem ter sido pulados.
INSERT INTO titulos (usuario_id, titulo, formato)
VALUES (1, 'Título válido depois dos erros', 'filme');

SELECT id, titulo
FROM titulos
WHERE titulo = 'Título válido depois dos erros';
