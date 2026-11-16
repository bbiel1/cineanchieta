import { campo, elemento, selecao } from "./dom";
import { buscarTitulo, listarTitulos } from "./api";
import type { Formato, Titulo } from "./tipos";
import { adicionarTitulo } from "./servicos";

// ---------- Cabeçalho ----------
elemento("nome-do-sistema").textContent = "CineAnchieta";
elemento("versao").textContent = "v0.3.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");

// O estado do programa: a lista que está valendo agora.
// Começa vazia: quem preenche é a API (por isso é let, não const).
let lista: Titulo[] = [];

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
  // map: o antigo transformar da Aula 2, agora pronto na linguagem
  elemento("lista").replaceChildren(...lista.map(criarItem));

  // filter: só os que passam no teste
  const queroVer = lista.filter((titulo) => titulo.status === "quero_ver");
  elemento("total").textContent = String(lista.length);
  elemento("quero-ver").textContent = String(queroVer.length);

  // find: o primeiro título de status "quero ver" (ou undefined)
  const proximo = lista.find((titulo) => titulo.status === "quero_ver");
  const aviso = elemento("comece-por");
  if (proximo) {
    aviso.textContent = `Comece por: #${proximo.id} ${proximo.titulo}`;
    aviso.hidden = false;
  } else {
    aviso.hidden = true;
  }
}

// O formulário: a função abaixo é um CALLBACK — quem a chama é o navegador.
// Aula 3: o cadastro ainda grava só na tela; na Aula 4 ele vai para o banco.
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

// Prata: busca um título pelo id e mostra o resultado no console
async function mostrarTitulo(id: number): Promise<void> {
  try {
    const procurado = await buscarTitulo(id);
    if (procurado) {
      console.log(`Encontrado: #${procurado.id} ${procurado.titulo}`);
    } else {
      console.log(`Título #${id} não encontrado.`);
    }
  } catch (falha) {
    if (falha instanceof Error) {
      console.error(falha.message);
    }
  }
}

// Ouro: aviso na tela quando a API não responde
function avisarApiForaDoAr(mensagem: string): void {
  const aviso = elemento("aviso-api");
  aviso.textContent = mensagem;
  aviso.hidden = false;
}

// O começo do programa: busca no banco, depois desenha
async function iniciar(): Promise<void> {
  try {
    lista = await listarTitulos();
    desenhar();
  } catch (falha) {
    if (falha instanceof Error) {
      avisarApiForaDoAr(
        "Não foi possível carregar os títulos. Verifique se a API está rodando e recarregue a página."
      );
    }
    return;
  }

  // find no banco: pode não encontrar
  await mostrarTitulo(3);
}

iniciar();
