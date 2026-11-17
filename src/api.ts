import type { NovoTitulo, Status, Titulo } from "./tipos";

// A ajudante que todas as chamadas usam: monta o pedido e trata o erro.
async function enviar(metodo: string, url: string, corpo?: unknown): Promise<Response> {
  const resposta = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    // a API manda { erro: "..." }; se não mandar, usamos o código
    const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };
    throw new Error(dados.erro ?? `Erro ${resposta.status}`);
  }
  return resposta;
}

// JSON não tem data: adicionadoEm chega como texto e precisa virar Date
function converter(titulo: Titulo): Titulo {
  return { ...titulo, adicionadoEm: new Date(titulo.adicionadoEm) };
}

// Todos os títulos da Ana que estão no banco
export async function listarTitulos(): Promise<Titulo[]> {
  const resposta = await enviar("GET", "/api/titulos");
  const bruto = (await resposta.json()) as Titulo[];
  return bruto.map(converter);
}

// Um título: devolve undefined se ele não existir (ou for de outra pessoa)
export async function buscarTitulo(id: number): Promise<Titulo | undefined> {
  const resposta = await fetch(`/api/titulos/${id}`);
  if (resposta.status === 404) {
    return undefined;
  }
  if (!resposta.ok) {
    const dados = (await resposta.json().catch(() => ({}))) as { erro?: string };
    throw new Error(dados.erro ?? `Erro ${resposta.status} ao buscar o título #${id}.`);
  }
  const bruto = (await resposta.json()) as Titulo;
  return converter(bruto);
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
