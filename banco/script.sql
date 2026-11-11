-- ============================================================
-- CineAnchieta — banco de dados da Aula 2
-- MySQL 8+
--
-- Execute este arquivo inteiro no MySQL Workbench:
--   File -> Open SQL Script -> script.sql -> botão do raio
--
-- Atenção: o script recria o banco do zero (DROP DATABASE).
-- ============================================================

SET NAMES utf8mb4; -- garante os acentos quando o script roda pelo terminal

DROP DATABASE IF EXISTS cineanchieta;
CREATE DATABASE cineanchieta
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE cineanchieta;

-- ------------------------------------------------------------
-- 1. Usuários
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  senha_hash  CHAR(60)      NOT NULL,          -- hash bcrypt, NUNCA a senha
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_usuarios        PRIMARY KEY (id),
  CONSTRAINT uq_usuarios_email  UNIQUE (email)
);

-- ------------------------------------------------------------
-- 2. Títulos (o registro principal do tema)
-- ------------------------------------------------------------
CREATE TABLE titulos (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id    INT UNSIGNED  NOT NULL,
  titulo        VARCHAR(120)  NOT NULL,
  descricao     TEXT          NULL,
  formato       ENUM('filme', 'serie')                     NOT NULL DEFAULT 'filme',
  status        ENUM('quero_ver', 'assistindo', 'assisti') NOT NULL DEFAULT 'quero_ver',
  lancamento    DATE          NULL,
  adicionado_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  assistido_em  DATETIME      NULL,
  CONSTRAINT pk_titulos PRIMARY KEY (id),
  CONSTRAINT fk_titulos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT ck_titulos_titulo CHECK (CHAR_LENGTH(TRIM(titulo)) >= 3)
);

-- ------------------------------------------------------------
-- 3. Gêneros (a "lista" do tema, por usuário)
-- ------------------------------------------------------------
CREATE TABLE generos (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED NOT NULL,
  nome        VARCHAR(40)  NOT NULL,
  CONSTRAINT pk_generos PRIMARY KEY (id),
  CONSTRAINT uq_generos_usuario_nome UNIQUE (usuario_id, nome),
  CONSTRAINT fk_generos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. Título x Gênero (relação N:N)
-- ------------------------------------------------------------
CREATE TABLE titulo_genero (
  titulo_id  INT UNSIGNED NOT NULL,
  genero_id  INT UNSIGNED NOT NULL,
  CONSTRAINT pk_titulo_genero PRIMARY KEY (titulo_id, genero_id),
  CONSTRAINT fk_titulo_genero_titulo FOREIGN KEY (titulo_id)
    REFERENCES titulos (id) ON DELETE CASCADE,
  CONSTRAINT fk_titulo_genero_genero FOREIGN KEY (genero_id)
    REFERENCES generos (id) ON DELETE CASCADE
);

-- ============================================================
-- Dados de exemplo
-- Usuários: Ana e Bruno — senha: senha123 (guardada só como hash)
-- ============================================================
INSERT INTO usuarios (nome, email, senha_hash) VALUES
  ('Ana Souza',  'ana@cineanchieta.com',   '$2b$10$qegHupoqt2oGJtZr.Dts8uh8gtqoAnx5eiFdzoNcY4YaiSwAGTWgK'),
  ('Bruno Lima', 'bruno@cineanchieta.com', '$2b$10$qegHupoqt2oGJtZr.Dts8uh8gtqoAnx5eiFdzoNcY4YaiSwAGTWgK');

-- 6 títulos da Ana (os mesmos do dados.ts da Aula 1) + 1 do Bruno
INSERT INTO titulos
  (usuario_id, titulo, descricao, formato, status, lancamento, adicionado_em, assistido_em)
VALUES
  (1, 'Interestelar',          NULL,          'filme', 'assisti',    '2014-11-07', '2026-10-01 19:10:00', '2026-10-02 22:00:00'),
  (1, 'Breaking Bad',          'Temporada 5', 'serie', 'assistindo', '2008-01-20', '2026-10-03 20:15:00', NULL),
  (1, 'Duna: Parte Dois',      NULL,          'filme', 'quero_ver',  '2024-02-29', '2026-10-04 21:00:00', NULL),
  (1, 'Stranger Things',       NULL,          'serie', 'quero_ver',  '2016-07-15', '2026-10-05 18:30:00', NULL),
  (1, 'O Auto da Compadecida', NULL,          'filme', 'assisti',    '2000-09-15', '2026-10-06 20:45:00', '2026-10-07 21:30:00'),
  (1, 'The Last of Us',        NULL,          'serie', 'assistindo', '2023-01-15', '2026-10-08 19:20:00', NULL),
  (2, 'Oppenheimer',           NULL,          'filme', 'assisti',    '2023-07-20', '2026-10-09 20:00:00', '2026-10-10 22:10:00');

-- Gêneros da Ana (ids 1 a 6) e do Bruno (ids 7 e 8)
INSERT INTO generos (usuario_id, nome) VALUES
  (1, 'ficção científica'),
  (1, 'drama'),
  (1, 'crime'),
  (1, 'aventura'),
  (1, 'terror'),
  (1, 'comédia'),
  (2, 'drama'),
  (2, 'história');

-- Ligações N:N (cada título com seus gêneros)
INSERT INTO titulo_genero (titulo_id, genero_id) VALUES
  (1, 1), (1, 2),  -- Interestelar: ficção científica, drama
  (2, 2), (2, 3),  -- Breaking Bad: drama, crime
  (3, 1), (3, 4),  -- Duna: Parte Dois: ficção científica, aventura
  (4, 1), (4, 5),  -- Stranger Things: ficção científica, terror
  (5, 6), (5, 4),  -- O Auto da Compadecida: comédia, aventura
  (6, 2), (6, 5),  -- The Last of Us: drama, terror
  (7, 7), (7, 8);  -- Oppenheimer: drama, história
