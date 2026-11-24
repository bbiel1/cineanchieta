import type { Contagem, Status, Titulo } from "./tipos";

// A função de alta ordem da Aula 2: recebe uma lista e uma regra.
// Continua aqui para comparar com o map, que já vem pronto na linguagem.
export function transformar<T, R>(lista: T[], regra: (item: T) => R): R[] {
  const resultado: R[] = [];
  for (const item of lista) {
    resultado.push(regra(item));
  }
  return resultado;
}

// ---------- filter e find: selecionar ----------

// filter: devolve uma lista nova só com os títulos do status escolhido.
export function filtrarPorStatus(lista: Titulo[], status: Status): Titulo[] {
  return lista.filter((titulo) => titulo.status === status);
}

// includes: pesquisa no título e também nos gêneros (desafio Ouro da Aula 6).
export function pesquisarTitulos(lista: Titulo[], termo: string): Titulo[] {
  const procurado = termo.trim().toLowerCase();
  if (procurado === "") {
    return lista;
  }
  return lista.filter(
    (titulo) =>
      titulo.titulo.toLowerCase().includes(procurado) ||
      titulo.generos.some((genero) => genero.toLowerCase().includes(procurado))
  );
}

// ---------- some e every: perguntas de sim ou não ----------

// some: existe pelo menos um título com lançamento futuro?
export function existeEmBreve(lista: Titulo[], hoje: string): boolean {
  return lista.some(
    (titulo) => titulo.lancamento != null && titulo.lancamento > hoje
  );
}

// every: todos os títulos já foram assistidos?
// A lista vazia fica de fora: sem títulos, não há o que comemorar.
export function todasAssistidas(lista: Titulo[]): boolean {
  return lista.length > 0 && lista.every((titulo) => titulo.status === "assisti");
}

// ---------- reduce: o painel calculado no navegador ----------

export function contarPorStatus(lista: Titulo[]): Contagem {
  return lista.reduce<Contagem>(
    (acumulador, titulo) => {
      acumulador[titulo.status]++;
      return acumulador; // sem este return, o próximo acumulador é undefined
    },
    { quero_ver: 0, assistindo: 0, assisti: 0 }
  );
}

// ---------- sort: ordenar sem estragar o original ----------

export function ordenarPorTitulo(lista: Titulo[]): Titulo[] {
  // O [...lista] faz a cópia: o sort altera o array em que é chamado.
  return [...lista].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
}
