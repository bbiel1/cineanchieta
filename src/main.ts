import { campo, elemento, selecao } from "./dom";
import { titulos } from "./dados";
import type { Formato, Titulo } from "./tipos";
import { adicionarTitulo, transformar } from "./servicos";

// ---------- Cabeçalho ----------
elemento("nome-do-sistema").textContent = "CineAnchieta";
elemento("versao").textContent = "v0.2.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");

// O estado do programa: a lista que está valendo agora
const lista: Titulo[] = [...titulos];

// Um título vira um <li> pronto para a tela
function criarItem(titulo: Titulo): HTMLLIElement {
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
  return item;
}

// A função que desenha a tela inteira a partir da lista
function desenhar(): void {
  const itens = transformar(lista, criarItem); // a função de alta ordem
  elemento("lista").replaceChildren(...itens);

  let queroVer = 0;
  for (const titulo of lista) {
    if (titulo.status === "quero_ver") {
      queroVer++;
    }
  }
  elemento("total").textContent = String(lista.length);
  elemento("quero-ver").textContent = String(queroVer);

  // while: achar o primeiro título de status "quero ver"
  // (não sabemos quantas voltas: o laço para assim que encontra)
  let posicao = 0;
  while (posicao < lista.length && lista[posicao].status !== "quero_ver") {
    posicao++;
  }

  const aviso = elemento("comece-por");
  if (posicao < lista.length) {
    const proximo = lista[posicao];
    aviso.textContent = `Comece por: #${proximo.id} ${proximo.titulo}`;
    aviso.hidden = false;
  } else {
    aviso.hidden = true;
  }
}

// O formulário: a função abaixo é um CALLBACK — quem a chama é o navegador
elemento("formulario").addEventListener("submit", (evento) => {
  evento.preventDefault(); // sem isto, a página recarrega e tudo se perde
  const erro = elemento("erro");
  erro.textContent = "";

  try {
    adicionarTitulo(lista, {
      titulo: campo("titulo").value.trim(),
      formato: selecao("formato").value as Formato,
      generos: [],
    });

    campo("titulo").value = "";
    campo("titulo").focus();
    desenhar(); // mudou a lista? desenhe de novo
  } catch (falha) {
    if (falha instanceof Error) {
      erro.textContent = falha.message;
    }
  }
});

desenhar();
