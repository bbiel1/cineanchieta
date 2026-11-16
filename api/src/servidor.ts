import "dotenv/config"; // primeira linha: carrega o .env antes de tudo
import express from "express";
import type { RowDataPacket } from "mysql2";
import { banco } from "./banco";

const app = express();
app.use(express.json());

// Aula 3: a lista mostra os títulos de TODOS os usuários.

// O SELECT que as duas rotas usam. Os "AS" trocam o nome da coluna
// do jeito do banco (adicionado_em) para o jeito do TypeScript (adicionadoEm).
const SELECT_TITULOS = `
  SELECT id, titulo, descricao, formato, status,
         DATE_FORMAT(lancamento, '%Y-%m-%d') AS lancamento,
         adicionado_em AS adicionadoEm
    FROM titulos`;

// Todos os títulos
app.get("/api/titulos", async (_req, res) => {
  const [linhas] = await banco.execute<RowDataPacket[]>(
    `${SELECT_TITULOS} ORDER BY id`,
    [] // sem filtro: nenhum ? nesta consulta
  );
  // os gêneros chegam na Aula 6; por enquanto, uma lista vazia em cada título
  res.json(linhas.map((linha) => ({ ...linha, generos: [] })));
});

// Um título: pode não existir!
app.get("/api/titulos/:id", async (req, res) => {
  const [linhas] = await banco.execute<RowDataPacket[]>(
    `${SELECT_TITULOS} WHERE id = ?`,
    [Number(req.params.id)]
  );
  if (linhas.length === 0) {
    res.status(404).json({ erro: `Título #${req.params.id} não encontrado.` });
    return;
  }
  res.json({ ...linhas[0], generos: [] });
});

app.listen(3000, () => console.log("API do CineAnchieta em http://localhost:3000"));
