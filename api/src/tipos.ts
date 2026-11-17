// Os mesmos tipos do front, mais as listas de valores válidos.
// A API confere o que chega do navegador antes de usar.

export type Formato = "filme" | "serie";
export type Status = "quero_ver" | "assistindo" | "assisti";

export const FORMATOS: Formato[] = ["filme", "serie"];
export const STATUS: Status[] = ["quero_ver", "assistindo", "assisti"];

// O que chega no corpo do POST. Tudo é opcional porque quem manda é
// o navegador: a API valida antes de usar.
export interface DadosTitulo {
  titulo?: string;
  descricao?: string | null;
  formato?: Formato;
  lancamento?: string | null;
  // generos?: string[]; // entram na Aula 6, junto com titulo_genero
}
