export type Status = "quero_ver" | "assistindo" | "assisti";
export type Formato = "filme" | "serie";

// Aula 6: os números do painel. Record garante que as três chaves existam.
export type Contagem = Record<Status, number>;

// Aula 5: o que a API devolve no login e guardamos no navegador.
export interface Sessao {
  token: string;
  nome: string;
}

// O que a rota protegida GET /api/eu devolve. Não tem senha nem hash.
export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface Titulo {
  readonly id: number;
  titulo: string;
  descricao?: string | null; // no banco, "sem valor" é NULL
  status: Status;
  formato: Formato;
  generos: string[];
  lancamento?: string | null; // "2026-10-22" ou null (a data do tema, como o prazo)
  adicionadoEm: Date;
}

// O que o usuário informa ao cadastrar:
// id, status e adicionadoEm são responsabilidade do sistema (o id vem do banco)
export type NovoTitulo = Omit<Titulo, "id" | "status" | "adicionadoEm">;
