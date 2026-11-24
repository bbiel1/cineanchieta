// Os mesmos tipos do front, mais as listas de valores válidos.
// A API confere o que chega do navegador antes de usar.

export type Formato = "filme" | "serie";
export type Status = "quero_ver" | "assistindo" | "assisti";

export const FORMATOS: Formato[] = ["filme", "serie"];
export const STATUS: Status[] = ["quero_ver", "assistindo", "assisti"];

// Aula 6: os números do painel. Record garante que os três status existam.
export type Contagem = Record<Status, number>;

// O que chega no corpo do POST. Tudo é opcional porque quem manda é
// o navegador: a API valida antes de usar.
export interface DadosTitulo {
  titulo?: string;
  descricao?: string | null;
  formato?: Formato;
  lancamento?: string | null;
  generos?: string[]; // Aula 6: nomes separados por vírgula viram esta lista
}

// Aula 5: cadastro e login. A senha chega em texto uma única vez e vira
// hash antes de ser gravada; ela nunca é devolvida pela API.
export interface DadosCadastro {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface DadosLogin {
  email?: string;
  senha?: string;
}
