import "dotenv/config"; // primeira linha: carrega o .env antes de tudo
import bcrypt from "bcryptjs";
import express, { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { exigirLogin, SEGREDO, usuarioDe } from "./autenticacao";
import { banco } from "./banco";
import {
  FORMATOS,
  STATUS,
  type Contagem,
  type DadosCadastro,
  type DadosLogin,
  type DadosTitulo,
  type Status,
} from "./tipos";

const app = express();
app.use(express.json());

// O SELECT que as rotas usam. Os "AS" trocam o nome da coluna do jeito
// do banco (adicionado_em) para o jeito do TypeScript (adicionadoEm).
// A subconsulta com GROUP_CONCAT devolve todos os gêneros em uma linha só:
// "drama,ficção científica". O alias t evita coluna ambígua.
const SELECT_TITULOS = `
  SELECT t.id, t.titulo, t.descricao, t.formato, t.status,
         DATE_FORMAT(t.lancamento, '%Y-%m-%d') AS lancamento,
         t.adicionado_em AS adicionadoEm,
         (SELECT GROUP_CONCAT(g.nome ORDER BY g.nome SEPARATOR ',')
            FROM titulo_genero tg
            JOIN generos g ON g.id = tg.genero_id
           WHERE tg.titulo_id = t.id) AS generos
    FROM titulos t`;

// O banco devolve os gêneros como um texto só (ou NULL). Esta função
// faz o caminho de volta: "drama,terror" vira ["drama", "terror"].
function paraTitulo(linha: RowDataPacket): RowDataPacket {
  return {
    ...linha,
    generos: linha.generos ? String(linha.generos).split(",") : [],
  };
}

// Busca um título do usuário logado pelo id. Usada pelo GET e depois de
// cada escrita. O usuarioId vem do token, nunca da página.
async function buscarUm(id: number, usuarioId: number): Promise<RowDataPacket | undefined> {
  const [linhas] = await banco.execute<RowDataPacket[]>(
    `${SELECT_TITULOS} WHERE t.id = ? AND t.usuario_id = ?`,
    [id, usuarioId]
  );
  return linhas.length > 0 ? paraTitulo(linhas[0]) : undefined;
}

// Liga os gêneros ao título. Se o gênero ainda não existe para este usuário,
// o INSERT cria; se já existe, o ON DUPLICATE KEY reaproveita o id.
async function salvarGeneros(
  tituloId: number,
  usuarioId: number,
  generos: string[]
): Promise<void> {
  for (const nome of generos) {
    const [resultado] = await banco.execute<ResultSetHeader>(
      `INSERT INTO generos (usuario_id, nome) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [usuarioId, nome]
    );
    await banco.execute(
      "INSERT IGNORE INTO titulo_genero (titulo_id, genero_id) VALUES (?, ?)",
      [tituloId, resultado.insertId]
    );
  }
}

// Confere os campos que vieram do navegador. Devolve a mensagem de erro,
// ou undefined quando está tudo certo.
function validar(dados: DadosTitulo): string | undefined {
  if (typeof dados.titulo !== "string" || dados.titulo.trim().length < 3) {
    return "O título precisa ter pelo menos 3 caracteres.";
  }
  if (dados.titulo.trim().length > 120) {
    return "O título pode ter no máximo 120 caracteres.";
  }
  if (dados.formato !== undefined && !FORMATOS.includes(dados.formato)) {
    return "Formato inválido.";
  }
  if (dados.lancamento && !dataValida(dados.lancamento)) {
    return "Data de lançamento inválida.";
  }
  if (dados.generos !== undefined) {
    if (!Array.isArray(dados.generos)) {
      return "Gêneros inválidos.";
    }
    if (dados.generos.length > 10) {
      return "No máximo 10 gêneros por título.";
    }
    for (const genero of dados.generos) {
      if (typeof genero !== "string" || genero.trim().length < 1 || genero.trim().length > 40) {
        return "Cada gênero precisa ter entre 1 e 40 caracteres.";
      }
    }
  }
  return undefined;
}

// Data no formato AAAA-MM-DD e que existe no calendário
// (2026-02-30, por exemplo, não passa).
function dataValida(valor: string): boolean {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }
  // O DATE do MySQL vai de 1000-01-01 a 9999-12-31.
  const ano = Number(valor.slice(0, 4));
  if (ano < 1000 || ano > 9999) {
    return false;
  }
  const data = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}

// Os ids chegam como texto na URL; se não forem inteiros, o título
// simplesmente não existe para a API. O Express 5 pode tipar o parâmetro
// como string ou string[]; usamos sempre a primeira parte.
function textoDoParametro(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) {
    return valor[0] ?? "";
  }
  return valor ?? "";
}

function lerId(valor: string | string[] | undefined): number | undefined {
  const id = Number(textoDoParametro(valor));
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function naoEncontrado(res: Response, idTexto: string | string[] | undefined): void {
  res.status(404).json({ erro: `Título #${textoDoParametro(idTexto)} não encontrado.` });
}

// ---------- USUÁRIOS E LOGIN (Aula 5) ----------

// Cadastro: a senha vira hash antes de chegar ao banco. O UNIQUE do banco
// é quem descobre e-mail repetido; a API só traduz o erro para 409.
app.post("/api/usuarios", async (req, res) => {
  const { nome, email, senha } = (req.body ?? {}) as DadosCadastro;
  const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
  const emailLimpo = typeof email === "string" ? email.trim().toLowerCase() : "";
  const senhaTexto = typeof senha === "string" ? senha : "";

  if (
    !nomeLimpo ||
    nomeLimpo.length > 100 ||
    !emailLimpo.includes("@") ||
    emailLimpo.length > 150 ||
    senhaTexto.length < 6 ||
    senhaTexto.length > 72
  ) {
    res.status(400).json({
      erro: "Preencha nome, e-mail válido e senha de 6 a 72 caracteres.",
    });
    return;
  }

  const hash = await bcrypt.hash(senhaTexto, 10); // a senha nunca vai para o banco

  try {
    const [resultado] = await banco.execute<ResultSetHeader>(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
      [nomeLimpo, emailLimpo, hash]
    );
    res.status(201).json({ id: resultado.insertId });
  } catch (erro) {
    if ((erro as { code?: string }).code === "ER_DUP_ENTRY") {
      res.status(409).json({ erro: "Este e-mail já está cadastrado." });
      return;
    }
    throw erro;
  }
});

// Login: confere o hash e entrega um token assinado, válido por 8 horas.
// E-mail inexistente e senha errada dão a mesma resposta: assim ninguém
// descobre quais e-mails têm conta.
app.post("/api/login", async (req, res) => {
  const { email, senha } = (req.body ?? {}) as DadosLogin;
  const emailLimpo = typeof email === "string" ? email.trim().toLowerCase() : "";
  const senhaTexto = typeof senha === "string" ? senha : "";

  const [linhas] = await banco.execute<RowDataPacket[]>(
    "SELECT id, nome, senha_hash FROM usuarios WHERE email = ?",
    [emailLimpo]
  );
  const usuario = linhas[0];

  if (!usuario || !senhaTexto || !(await bcrypt.compare(senhaTexto, usuario.senha_hash))) {
    res.status(401).json({ erro: "E-mail ou senha inválidos." });
    return;
  }

  const token = jwt.sign({ id: usuario.id }, SEGREDO, { expiresIn: "8h" });
  res.json({ token, nome: usuario.nome });
});

// Prata: devolve quem está logado. O SELECT não pede senha_hash, então
// o hash nunca sai do banco.
app.get("/api/eu", exigirLogin, async (_req, res) => {
  const [linhas] = await banco.execute<RowDataPacket[]>(
    "SELECT id, nome, email FROM usuarios WHERE id = ?",
    [usuarioDe(res)]
  );
  const usuario = linhas[0];

  if (!usuario) {
    res.status(401).json({ erro: "Sessão inválida. Entre de novo." });
    return;
  }

  res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
});

// ---------- PAINEL (Aula 6) ----------

// O GROUP BY faz no banco o que o reduce fazia no navegador: conta os
// títulos por status. Status sem nenhum título não vem na resposta, por
// isso o objeto começa com zeros.
app.get("/api/estatisticas", exigirLogin, async (_req, res) => {
  const [linhas] = await banco.execute<RowDataPacket[]>(
    `SELECT status, COUNT(*) AS quantidade
       FROM titulos
      WHERE usuario_id = ?
      GROUP BY status`,
    [usuarioDe(res)]
  );

  const contagem: Contagem = { quero_ver: 0, assistindo: 0, assisti: 0 };
  for (const linha of linhas) {
    contagem[linha.status as Status] = Number(linha.quantidade);
  }
  res.json(contagem);
});

// ---------- LER ----------

// Todos os títulos do usuário logado. A partir da Aula 6, a URL aceita
// filtros opcionais: /api/titulos?status=quero_ver&busca=duna
app.get("/api/titulos", exigirLogin, async (req, res) => {
  let sql = `${SELECT_TITULOS} WHERE t.usuario_id = ?`;
  const valores: (string | number)[] = [usuarioDe(res)];

  const { status, busca } = req.query;
  if (typeof status === "string" && STATUS.includes(status as Status)) {
    sql += " AND t.status = ?"; // o filter, no banco
    valores.push(status);
  }
  if (typeof busca === "string" && busca.trim() !== "") {
    const termo = `%${busca.trim()}%`;
    // Procura no título e também nos gêneros (desafio Ouro da Aula 6).
    sql += ` AND (t.titulo LIKE ? OR EXISTS (
      SELECT 1
        FROM titulo_genero tg
        JOIN generos g ON g.id = tg.genero_id
       WHERE tg.titulo_id = t.id
         AND g.nome LIKE ?
    ))`;
    valores.push(termo, termo);
  }
  sql += " ORDER BY t.titulo"; // o sort

  const [linhas] = await banco.execute<RowDataPacket[]>(sql, valores);
  res.json(linhas.map(paraTitulo));
});

// Um título: pode não existir ou ser de outra pessoa
app.get("/api/titulos/:id", exigirLogin, async (req, res) => {
  const id = lerId(req.params.id);
  if (id === undefined) {
    naoEncontrado(res, req.params.id);
    return;
  }
  const titulo = await buscarUm(id, usuarioDe(res));
  if (!titulo) {
    naoEncontrado(res, req.params.id);
    return;
  }
  res.json(titulo);
});

// ---------- CRIAR ----------

app.post("/api/titulos", exigirLogin, async (req, res) => {
  const dados = (req.body ?? {}) as DadosTitulo;
  const problema = validar(dados);
  if (problema) {
    res.status(400).json({ erro: problema }); // 400: o pedido veio errado
    return;
  }

  // Todo valor do navegador entra como ?: o texto nunca vira parte do comando.
  const [resultado] = await banco.execute<ResultSetHeader>(
    `INSERT INTO titulos (usuario_id, titulo, descricao, formato, lancamento)
     VALUES (?, ?, ?, ?, ?)`,
    [
      usuarioDe(res),
      dados.titulo!.trim(),
      dados.descricao ?? null,
      dados.formato ?? "filme",
      dados.lancamento || null,
    ]
  );

  // Aula 6 (Ouro): depois do título, os gêneros entram em generos e
  // titulo_genero. A lista já foi validada e sem duplicatas.
  const generos = Array.isArray(dados.generos)
    ? [...new Set(dados.generos.map((genero) => genero.trim()).filter((genero) => genero !== ""))]
    : [];
  await salvarGeneros(resultado.insertId, usuarioDe(res), generos);

  // 201: criado. Devolve o título como o banco o guardou (id, datas e gêneros).
  res.status(201).json(await buscarUm(resultado.insertId, usuarioDe(res)));
});

// ---------- ATUALIZAR (só o status) ----------

app.patch("/api/titulos/:id/status", exigirLogin, async (req, res) => {
  const { status } = (req.body ?? {}) as { status?: Status };
  if (!status || !STATUS.includes(status)) {
    res.status(400).json({ erro: "Status inválido." });
    return;
  }

  const id = lerId(req.params.id);
  if (id === undefined) {
    naoEncontrado(res, req.params.id);
    return;
  }

  // O WHERE tem id E usuario_id: saber o id de outra pessoa não basta.
  const [resultado] = await banco.execute<ResultSetHeader>(
    `UPDATE titulos
        SET status = ?, assistido_em = IF(? = 'assisti', NOW(), NULL)
      WHERE id = ? AND usuario_id = ?`,
    [status, status, id, usuarioDe(res)]
  );

  if (resultado.affectedRows === 0) {
    naoEncontrado(res, req.params.id);
    return;
  }
  res.status(204).end(); // 204: deu certo, e não há nada para devolver
});

// ---------- EDITAR (Prata: só o título) ----------

app.put("/api/titulos/:id", exigirLogin, async (req, res) => {
  const { titulo } = (req.body ?? {}) as { titulo?: string };
  if (
    titulo !== undefined &&
    (typeof titulo !== "string" || titulo.trim().length < 3 || titulo.trim().length > 120)
  ) {
    res.status(400).json({ erro: "O título precisa ter entre 3 e 120 caracteres." });
    return;
  }

  const id = lerId(req.params.id);
  if (id === undefined) {
    naoEncontrado(res, req.params.id);
    return;
  }

  // COALESCE mantém o título antigo quando nenhum novo é enviado.
  const [resultado] = await banco.execute<ResultSetHeader>(
    `UPDATE titulos
        SET titulo = COALESCE(?, titulo)
      WHERE id = ? AND usuario_id = ?`,
    [titulo?.trim() ?? null, id, usuarioDe(res)]
  );

  if (resultado.affectedRows === 0) {
    naoEncontrado(res, req.params.id);
    return;
  }
  res.json(await buscarUm(id, usuarioDe(res)));
});

// ---------- APAGAR ----------

app.delete("/api/titulos/:id", exigirLogin, async (req, res) => {
  const id = lerId(req.params.id);
  if (id === undefined) {
    naoEncontrado(res, req.params.id);
    return;
  }

  // Ouro: o WHERE id = ? AND usuario_id = ? é o que impede o usuário A
  // de apagar o título do usuário B, mesmo sabendo o id.
  const [resultado] = await banco.execute<ResultSetHeader>(
    "DELETE FROM titulos WHERE id = ? AND usuario_id = ?",
    [id, usuarioDe(res)]
  );

  if (resultado.affectedRows === 0) {
    naoEncontrado(res, req.params.id);
    return;
  }
  res.status(204).end();
});

// ---------- ERROS NÃO PREVISTOS: sempre depois de todas as rotas ----------

app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(erro); // o detalhe técnico fica só no terminal

  // JSON malformado é um pedido errado (400), não uma falha do servidor.
  if (erro instanceof SyntaxError) {
    res.status(400).json({ erro: "Corpo do pedido inválido." });
    return;
  }

  res.status(500).json({ erro: "Algo deu errado no servidor. Tente de novo." });
});

app.listen(3000, () => console.log("API do CineAnchieta em http://localhost:3000"));
