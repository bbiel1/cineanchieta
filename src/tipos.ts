export type Status = "quero_ver" | "assistindo" | "assisti";
export type Formato = "filme" | "serie";

export interface Titulo {
  readonly id: number;
  titulo: string;
  descricao?: string;
  status: Status;
  formato: Formato;
  generos: string[];
  adicionadoEm: Date;
}

// O que o usuário informa ao cadastrar:
// id, status e adicionadoEm são responsabilidade do sistema
export type NovoTitulo = Omit<Titulo, "id" | "status" | "adicionadoEm">;
