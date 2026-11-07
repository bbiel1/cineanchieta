import { elemento } from "./dom";
import { titulos } from "./dados";

// ---------- Parte 1: tipos primitivos ----------
const nomeDoSistema: string = "CineAnchieta";
const versao: string = "0.1.0";
const hoje: string = new Date().toLocaleDateString("pt-BR");
const autor = "Grupo Filmes e Séries"; // inferência: o TypeScript deduz que é string

elemento("nome-do-sistema").textContent = nomeDoSistema;
elemento("versao").textContent = `v${versao}`;
elemento("data-de-hoje").textContent = hoje;
console.log(`CineAnchieta iniciado. Autor: ${autor}`); // aparece no F12

// ---------- Parte 3: o array e os laços ----------
const lista = elemento("lista");

// LAÇO 1 — for...of: percorre os valores, sem índice
for (const titulo of titulos) {
  const item = document.createElement("li");
  item.className = `titulo titulo--${titulo.status}`;

  const nome = document.createElement("h3");
  nome.className = "titulo__nome";
  nome.textContent = `#${titulo.id} ${titulo.titulo}`;

  const etiquetas = document.createElement("div");
  etiquetas.className = "titulo__etiquetas";

  const status = document.createElement("span");
  status.className = `etiqueta etiqueta--${titulo.status}`;
  status.textContent = titulo.status.replace("_", " ");

  const formato = document.createElement("span");
  formato.className = `etiqueta etiqueta--${titulo.formato}`;
  formato.textContent = titulo.formato;

  etiquetas.append(status, formato);
  item.append(nome, etiquetas);
  lista.append(item);
}

// LAÇO 2 — for com índice: contando os "quero ver"
let queroVer = 0;
for (let i = 0; i < titulos.length; i++) {
  if (titulos[i].status === "quero_ver") {
    queroVer++;
  }
}
elemento("total").textContent = String(titulos.length);
elemento("quero-ver").textContent = String(queroVer);

// LAÇO 3 — while: achar o primeiro título de status "quero ver"
// (não sabemos quantas voltas: o laço para assim que encontra)
let posicao = 0;
while (posicao < titulos.length && titulos[posicao].status !== "quero_ver") {
  posicao++;
}
if (posicao < titulos.length) {
  // achou: mostra o aviso na página
  const proximo = titulos[posicao];
  elemento("comece-por").textContent = `Comece por: #${proximo.id} ${proximo.titulo}`;
  elemento("comece-por").hidden = false;
}
