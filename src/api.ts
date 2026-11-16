import type { Titulo } from "./tipos";

// Todos os títulos que estão no banco
export async function listarTitulos(): Promise<Titulo[]> {
  const resposta = await fetch("/api/titulos");
  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os títulos. A API está rodando?");
  }
  const bruto = (await resposta.json()) as Titulo[];
  // JSON não tem data: adicionadoEm chega como texto e precisa virar Date
  return bruto.map((titulo) => ({
    ...titulo,
    adicionadoEm: new Date(titulo.adicionadoEm),
  }));
}

// Um título: devolve undefined se ele não existir (o mesmo padrão do find)
export async function buscarTitulo(id: number): Promise<Titulo | undefined> {
  const resposta = await fetch(`/api/titulos/${id}`);
  if (resposta.status === 404) {
    return undefined;
  }
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} ao buscar o título #${id}.`);
  }
  const bruto = (await resposta.json()) as Titulo;
  return { ...bruto, adicionadoEm: new Date(bruto.adicionadoEm) };
}
