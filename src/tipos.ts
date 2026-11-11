export type Status = "quero_ver" | "assistindo" | "assisti";
export type Formato = "filme" | "serie";

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
// id, status e adicionadoEm são responsabilidade do sistema
export type NovoTitulo = Omit<Titulo, "id" | "status" | "adicionadoEm">;
