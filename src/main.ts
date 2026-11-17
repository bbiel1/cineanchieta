import { campo, elemento, selecao } from "./dom";
import {
  alterarStatus,
  buscarEu,
  buscarTitulo,
  cadastrarTitulo,
  criarConta,
  editarTitulo,
  encerrarSessao,
  entrar,
  guardarSessao,
  listarTitulos,
  removerTitulo,
  sessaoAtual,
} from "./api";
import type { Formato, Status, Titulo } from "./tipos";

// ---------- Cabeçalho ----------
elemento("nome-do-sistema").textContent = "CineAnchieta";
elemento("versao").textContent = "v0.5.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");

// O estado do programa: a lista que está valendo agora.
// Começa vazia: quem preenche é a API (por isso é let, não const).
let lista: Titulo[] = [];

// Mensagens de erro das ações (a API é quem decide se o pedido está certo)
function mostrarErro(erro: unknown): void {
  if (erro instanceof TypeError) {
    elemento("erro").textContent =
      "Não foi possível falar com a API. Verifique se ela está rodando.";
    return;
  }
  elemento("erro").textContent = erro instanceof Error ? erro.message : "Erro inesperado.";
}

// Uma ajudante para criar botões sem repetir código
function botao(texto: string, extra: string, aoClicar: () => void): HTMLButtonElement {
  const elementoBotao = document.createElement("button");
  elementoBotao.type = "button";
  elementoBotao.className = ["botao", "botao--pequeno", extra].filter(Boolean).join(" ");
  elementoBotao.textContent = texto;
  elementoBotao.addEventListener("click", aoClicar); // callback, de novo
  return elementoBotao;
}

// Data AAAA-MM-DD -> DD/MM/AAAA sem passar por fuso horário
function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// O dia de hoje no mesmo formato do banco, para comparar com lancamento
function hojeIso(): string {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

// Um título vira um <li> pronto para a tela
function criarItem(titulo: Titulo): HTMLLIElement {
  const item = document.createElement("li");
  item.className = `titulo titulo--${titulo.status}`;
  if (titulo.status === "assisti") {
    item.classList.add("titulo--concluido");
  }

  // Ouro: lançamento no futuro ganha destaque
  const emBreve = titulo.lancamento ? titulo.lancamento > hojeIso() : false;
  if (emBreve) {
    item.classList.add("titulo--em-breve");
  }

  const principal = document.createElement("div");
  principal.className = "titulo__principal";

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

  if (titulo.lancamento) {
    const lancamento = document.createElement("span");
    lancamento.className = "etiqueta etiqueta--lancamento";
    lancamento.textContent = `lançamento ${formatarData(titulo.lancamento)}`;
    etiquetas.append(lancamento);
  }

  if (emBreve) {
    const emBreveEtiqueta = document.createElement("span");
    emBreveEtiqueta.className = "etiqueta etiqueta--em-breve";
    emBreveEtiqueta.textContent = "em breve";
    etiquetas.append(emBreveEtiqueta);
  }

  principal.append(nome, etiquetas);

  // Os botões: cada um fecha sobre o SEU título
  const acoes = document.createElement("div");
  acoes.className = "titulo__acoes";

  if (titulo.status === "quero_ver") {
    acoes.append(
      botao("Começar", "", () => mudarStatus(titulo.id, "assistindo")),
      botao("Concluir", "botao--sucesso", () => mudarStatus(titulo.id, "assisti"))
    );
  } else if (titulo.status === "assistindo") {
    acoes.append(
      botao("Quero ver", "", () => mudarStatus(titulo.id, "quero_ver")),
      botao("Concluir", "botao--sucesso", () => mudarStatus(titulo.id, "assisti"))
    );
  } else {
    acoes.append(botao("Reabrir", "", () => mudarStatus(titulo.id, "quero_ver")));
  }

  acoes.append(
    botao("Editar", "botao--neutro", () => editar(titulo)),
    botao("Remover", "botao--perigo", () => remover(titulo.id))
  );

  item.append(principal, acoes);
  return item;
}

// A função que desenha a tela inteira a partir da lista
function desenhar(): void {
  // map: o antigo transformar da Aula 2, agora pronto na linguagem
  elemento("lista").replaceChildren(...lista.map(criarItem));

  // filter: só os que passam no teste
  const queroVer = lista.filter((titulo) => titulo.status === "quero_ver");
  const assistindo = lista.filter((titulo) => titulo.status === "assistindo");
  const assistidos = lista.filter((titulo) => titulo.status === "assisti");

  elemento("total").textContent = String(lista.length);
  elemento("quero-ver").textContent = String(queroVer.length);
  elemento("assistindo").textContent = String(assistindo.length);
  elemento("assisti").textContent = String(assistidos.length);

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

// O trio que se repete a cada ação:
// 1. o banco confirma  2. a lista muda sem ser alterada  3. a tela acompanha
async function mudarStatus(id: number, status: Status): Promise<void> {
  elemento("erro").textContent = "";
  try {
    await alterarStatus(id, status);
    lista = lista.map((titulo) => (titulo.id === id ? { ...titulo, status } : titulo));
    desenhar();
  } catch (erro) {
    mostrarErro(erro);
  }
}

async function remover(id: number): Promise<void> {
  elemento("erro").textContent = "";
  try {
    await removerTitulo(id);
    lista = lista.filter((titulo) => titulo.id !== id);
    desenhar();
  } catch (erro) {
    mostrarErro(erro);
  }
}

// Prata: o prompt troca o título; o banco confirma; a lista e a tela acompanham
async function editar(titulo: Titulo): Promise<void> {
  const novo = prompt(`Novo título para #${titulo.id}:`, titulo.titulo);
  if (novo === null) {
    return; // cancelou
  }

  elemento("erro").textContent = "";
  try {
    const atualizado = await editarTitulo(titulo.id, novo.trim());
    lista = lista.map((item) => (item.id === titulo.id ? atualizado : item));
    desenhar();
  } catch (erro) {
    mostrarErro(erro);
  }
}

// O formulário: a função abaixo é um CALLBACK — quem a chama é o navegador.
elemento("formulario").addEventListener("submit", async (evento) => {
  evento.preventDefault(); // sem isto, a página recarrega e tudo se perde
  elemento("erro").textContent = "";

  try {
    const nova = await cadastrarTitulo({
      titulo: campo("titulo").value.trim(),
      formato: selecao("formato").value as Formato,
      generos: [],
      lancamento: campo("lancamento").value || null,
    });

    lista = [...lista, nova]; // acrescentar sem alterar: uma lista nova
    campo("titulo").value = "";
    campo("lancamento").value = "";
    campo("titulo").focus();
    desenhar(); // mudou a lista? desenhe de novo
  } catch (erro) {
    mostrarErro(erro);
  }
});

// Prata da Aula 3: busca um título pelo id e mostra o resultado no console
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

// Ouro da Aula 3: aviso na tela quando a API não responde
function avisarApiForaDoAr(mensagem: string): void {
  const aviso = elemento("aviso-api");
  aviso.textContent = mensagem;
  aviso.hidden = false;
}

// ---------- A tela de entrada (Aula 5) ----------

function mostrarErroEntrada(erro: unknown): void {
  if (erro instanceof TypeError) {
    elemento("erro-entrada").textContent =
      "Não foi possível falar com a API. Verifique se ela está rodando.";
    return;
  }
  elemento("erro-entrada").textContent = erro instanceof Error ? erro.message : "Erro inesperado.";
}

// Troca entre "Entrar" e "Criar conta"
function mostrarFormulario(criando: boolean): void {
  const formCriar = elemento("form-criar") as HTMLFormElement;
  const formEntrar = elemento("form-entrar") as HTMLFormElement;

  formCriar.hidden = !criando;
  formEntrar.hidden = criando;
  elemento("alternar-entrada").textContent = criando ? "Já tenho conta" : "Ainda não tenho conta";
  elemento("erro-entrada").textContent = "";
}

elemento("alternar-entrada").addEventListener("click", () => {
  mostrarFormulario(elemento("form-criar").hidden === true); // escondido? então mostra
});

elemento("form-entrar").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  elemento("erro-entrada").textContent = "";

  try {
    guardarSessao(await entrar(campo("entrar-email").value.trim(), campo("entrar-senha").value));
    campo("entrar-senha").value = ""; // a senha não fica no campo
    await iniciar();
  } catch (erro) {
    mostrarErroEntrada(erro);
  }
});

elemento("form-criar").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  elemento("erro-entrada").textContent = "";

  const email = campo("criar-email").value.trim();
  const senha = campo("criar-senha").value;

  try {
    await criarConta(campo("criar-nome").value.trim(), email, senha);
    guardarSessao(await entrar(email, senha)); // criou? já entra direto
    (elemento("form-criar") as HTMLFormElement).reset(); // não deixa a senha no campo
    await iniciar();
  } catch (erro) {
    mostrarErroEntrada(erro);
  }
});

elemento("botao-sair").addEventListener("click", () => {
  encerrarSessao();
  lista = [];
  (elemento("form-entrar") as HTMLFormElement).reset();
  (elemento("form-criar") as HTMLFormElement).reset();
  elemento("erro").textContent = "";
  elemento("erro-entrada").textContent = "";
  elemento("aviso-api").hidden = true;
  elemento("usuario-nome").textContent = "";
  mostrarFormulario(false); // volta sempre para "Entrar"
  void iniciar();
});

// O começo do programa: com sessão, mostra o sistema; sem sessão, a entrada.
async function iniciar(): Promise<void> {
  const sessao = sessaoAtual();

  elemento("tela-entrada").hidden = sessao !== undefined;
  elemento("tela-app").hidden = sessao === undefined;
  elemento("acoes-usuario").hidden = sessao === undefined;
  elemento("usuario-nome").textContent = "";

  if (!sessao) {
    return;
  }

  elemento("erro-entrada").textContent = "";
  elemento("aviso-api").hidden = true;

  try {
    // Prata: o nome mostrado vem da API, não do nome guardado na sessão.
    const eu = await buscarEu();
    elemento("usuario-nome").textContent = eu.nome;

    lista = await listarTitulos();
    desenhar();
  } catch (falha) {
    if (falha instanceof TypeError) {
      avisarApiForaDoAr(
        "Não foi possível carregar os títulos. Verifique se a API está rodando e recarregue a página."
      );
    } else {
      mostrarErro(falha);
    }
    return;
  }

  // find no banco: pode não encontrar (para o Bruno, o #3 é da Ana)
  await mostrarTitulo(3);
}

iniciar();
