import type { Titulo } from "./tipos";

export const titulos: Titulo[] = [
  {
    id: 1,
    titulo: "Interestelar",
    status: "assisti",
    formato: "filme",
    generos: ["ficção científica", "drama"],
    adicionadoEm: new Date(),
  },
  {
    id: 2,
    titulo: "Breaking Bad",
    descricao: "Temporada 5",
    status: "assistindo",
    formato: "serie",
    generos: ["drama", "crime"],
    adicionadoEm: new Date(),
  },
  {
    id: 3,
    titulo: "Duna: Parte Dois",
    status: "quero_ver",
    formato: "filme",
    generos: ["ficção científica", "aventura"],
    adicionadoEm: new Date(),
  },
  {
    id: 4,
    titulo: "Stranger Things",
    status: "quero_ver",
    formato: "serie",
    generos: ["ficção científica", "terror"],
    adicionadoEm: new Date(),
  },
  {
    id: 5,
    titulo: "O Auto da Compadecida",
    status: "assisti",
    formato: "filme",
    generos: ["comédia", "aventura"],
    adicionadoEm: new Date(),
  },
  {
    id: 6,
    titulo: "The Last of Us",
    status: "assistindo",
    formato: "serie",
    generos: ["drama", "terror"],
    adicionadoEm: new Date(),
  },
];
