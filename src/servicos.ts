import type { NovoTitulo, Titulo } from "./tipos";

// Gera o próximo id a partir do maior id já existente
function gerarId(lista: Titulo[]): number {
  let maior = 0;
  for (const titulo of lista) {
    if (titulo.id > maior) {
      maior = titulo.id;
    }
  }
  return maior + 1;
}

// Cadastra um título: o usuário informa só o essencial
export function adicionarTitulo(lista: Titulo[], dados: NovoTitulo): Titulo {
  if (dados.titulo.trim().length < 3) {
    throw new Error("O título precisa ter pelo menos 3 caracteres.");
  }

  const titulo: Titulo = {
    ...dados,
    titulo: dados.titulo.trim(),
    id: gerarId(lista),
    status: "quero_ver",
    lancamento: dados.lancamento ?? null,
    adicionadoEm: new Date(),
  };

  lista.push(titulo);
  return titulo;
}

// A função de alta ordem: recebe uma lista e uma regra
export function transformar<T, R>(lista: T[], regra: (item: T) => R): R[] {
  const resultado: R[] = [];
  for (const item of lista) {
    resultado.push(regra(item));
  }
  return resultado;
}
