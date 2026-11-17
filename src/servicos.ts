// gerarId e adicionarTitulo foram apagados: agora quem cria o id é o banco.
// A função de alta ordem continua aqui, para comparar com o map.

// A função de alta ordem: recebe uma lista e uma regra
export function transformar<T, R>(lista: T[], regra: (item: T) => R): R[] {
  const resultado: R[] = [];
  for (const item of lista) {
    resultado.push(regra(item));
  }
  return resultado;
}
