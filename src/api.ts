import type { Contagem, NovoTitulo, Sessao, Status, Titulo, Usuario } from "./tipos";

const CHAVE_SESSAO = "cineanchieta:sessao";

// ---------- A sessão: o "crachá" guardado no navegador ----------

export function sessaoAtual(): Sessao | undefined {
  const texto = localStorage.getItem(CHAVE_SESSAO);
  return texto ? (JSON.parse(texto) as Sessao) : undefined;
}

export function guardarSessao(sessao: Sessao): void {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

export function encerrarSessao(): void {
  localStorage.removeItem(CHAVE_SESSAO);
}

// A ajudante que todas as chamadas usam: monta o pedido, mostra o crachá
// e trata o erro. Sem o Authorization, a API responde 401.
async function enviar(metodo: string, url: string, corpo?: unknown): Promise<Response> {
  const sessao = sessaoAtual();
  const resposta = await fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(sessao ? { Authorization: `Bearer ${sessao.token}` } : {}),
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

  // Crachá vencido ou inválido: apaga a sessão e volta para a entrada.
  if (resposta.status === 401 && sessao) {
    encerrarSessao();
    location.reload();
  }

  if (!resposta.ok) {
    // a API manda { erro: "..." }; se não mandar, usamos o código
    const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };
    // 502/504: o proxy do Vite não achou a API na porta 3000
    const semApi = resposta.status === 502 || resposta.status === 504;
    throw new Error(
      dados.erro ??
        (semApi
          ? "A API não respondeu. Rode npm run dev na pasta api."
          : `Erro ${resposta.status}`)
    );
  }
  return resposta;
}

// JSON não tem data: adicionadoEm chega como texto e precisa virar Date.
// generos também é normalizado para a tela nunca receber undefined.
function converter(titulo: Titulo): Titulo {
  return {
    ...titulo,
    generos: titulo.generos ?? [],
    adicionadoEm: new Date(titulo.adicionadoEm),
  };
}

// ---------- Usuários ----------

export async function entrar(email: string, senha: string): Promise<Sessao> {
  const resposta = await enviar("POST", "/api/login", { email, senha });
  return (await resposta.json()) as Sessao;
}

export async function criarConta(nome: string, email: string, senha: string): Promise<void> {
  await enviar("POST", "/api/usuarios", { nome, email, senha });
}

// Prata: o nome do cabeçalho vem daqui, não do que ficou guardado na sessão.
export async function buscarEu(): Promise<Usuario> {
  const resposta = await enviar("GET", "/api/eu");
  return (await resposta.json()) as Usuario;
}

// ---------- Painel (Aula 6) ----------

// Os números do painel vêm prontos do banco, calculados com GROUP BY.
export async function buscarEstatisticas(): Promise<Contagem> {
  const resposta = await enviar("GET", "/api/estatisticas");
  return (await resposta.json()) as Contagem;
}

// ---------- Títulos ----------

// Todos os títulos do usuário logado que estão no banco
export async function listarTitulos(): Promise<Titulo[]> {
  const resposta = await enviar("GET", "/api/titulos");
  const bruto = (await resposta.json()) as Titulo[];
  return bruto.map(converter);
}

// Um título: devolve undefined se ele não existir (ou for de outra pessoa)
export async function buscarTitulo(id: number): Promise<Titulo | undefined> {
  try {
    const resposta = await enviar("GET", `/api/titulos/${id}`);
    const bruto = (await resposta.json()) as Titulo;
    return converter(bruto);
  } catch (erro) {
    // A API responde 404 com "Título #... não encontrado."
    if (erro instanceof Error && erro.message.includes("não encontrado")) {
      return undefined;
    }
    throw erro;
  }
}

// Cadastra no banco e devolve o título com o id que o AUTO_INCREMENT criou
export async function cadastrarTitulo(dados: NovoTitulo): Promise<Titulo> {
  const resposta = await enviar("POST", "/api/titulos", dados);
  const bruto = (await resposta.json()) as Titulo;
  return converter(bruto);
}

// Muda só o status: o banco devolve 204, sem conteúdo
export async function alterarStatus(id: number, status: Status): Promise<void> {
  await enviar("PATCH", `/api/titulos/${id}/status`, { status });
}

// Edita só o título (desafio Prata)
export async function editarTitulo(id: number, titulo: string): Promise<Titulo> {
  const resposta = await enviar("PUT", `/api/titulos/${id}`, { titulo });
  const bruto = (await resposta.json()) as Titulo;
  return converter(bruto);
}

// Remove do banco: 204, sem conteúdo
export async function removerTitulo(id: number): Promise<void> {
  await enviar("DELETE", `/api/titulos/${id}`);
}
