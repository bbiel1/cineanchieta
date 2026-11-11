-- ============================================================
-- CineAnchieta — Entrega 2 / Desafio Ouro
--
-- Tabela comentarios: uma tarefa (título) tem muitos comentários.
-- Rode DEPOIS de banco/script.sql.
-- ============================================================

USE cineanchieta;

CREATE TABLE comentarios (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo_id  INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  texto      TEXT         NOT NULL,
  criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_comentarios PRIMARY KEY (id),
  CONSTRAINT fk_comentarios_titulo FOREIGN KEY (titulo_id)
    REFERENCES titulos (id) ON DELETE CASCADE,
  CONSTRAINT fk_comentarios_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT ck_comentarios_texto CHECK (CHAR_LENGTH(TRIM(texto)) >= 1)
);

-- Exemplos de comentários (um título pode ter vários)
INSERT INTO comentarios (titulo_id, usuario_id, texto) VALUES
  (1, 1, 'A trilha sonora do Hans Zimmer é incrível.'),
  (1, 2, 'Preciso rever esse filme com mais calma.'),
  (2, 1, 'A quinta temporada fecha muito bem a série.');

SELECT c.id, t.titulo, u.nome AS autor, c.texto, c.criado_em
FROM comentarios AS c
JOIN titulos AS t  ON t.id = c.titulo_id
JOIN usuarios AS u ON u.id = c.usuario_id
ORDER BY c.id;
