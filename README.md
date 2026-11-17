# CineAnchieta

Sistema de acompanhamento de filmes e séries desenvolvido como projeto do grupo no curso TaskFlow.

**Aula 4** — CRUD no MySQL: cadastrar, mudar status, editar e remover títulos.

## Tema

- **Registro principal:** título (filme ou série)
- **Status:** quero ver, assistindo, assisti
- **Formato:** filme ou série
- **Gêneros:** lista de textos (a API ainda devolve uma lista vazia; entra na Aula 6)
- **Data:** adicionadoEm
- **Data de lançamento:** lancamento (opcional)
- **Dono:** por enquanto, a Ana (`usuario_id = 1`); na Aula 5 o dono passa a ser quem fez login

## O que a página faz

- Exibe o nome do sistema, a versão e a data de hoje
- Busca os títulos da Ana na API (`/api/titulos`) e desenha a lista com `map()` e `replaceChildren()`
- Conta o total e os títulos por status com `filter()`: quero ver, assistindo e assistidos
- Usa `find()` para achar o primeiro título de status "quero ver" e exibir o aviso "Comece por"
- Mostra a barra lateral e a etiqueta coloridas conforme o status e o formato
- **Novo:** o formulário cadastra um título no MySQL e a lista continua atualizada
- **Novo:** os botões **Começar**, **Concluir**, **Quero ver** e **Reabrir** mudam o status no banco
- **Novo:** **Editar** troca o título usando `prompt()` (desafio Prata)
- **Novo:** **Remover** apaga o título do banco
- **Novo:** o campo **Lançamento** guarda a data e destaca com **"Em breve"** os títulos que ainda não estrearam (desafio Ouro)
- **Novo:** se a API estiver fora do ar, uma mensagem amigável aparece na tela
- O console ainda mostra o resultado de `mostrarTitulo(3)` (desafio Prata da Aula 3)

> A lista agora é lida e escrita no MySQL. Cadastrar, mudar o status, editar e remover continuam valendo depois de recarregar a página.

## Estrutura

```
├─ index.html
├─ vite.config.ts
├─ css/
│  └─ cineanchieta.css
├─ api/
│  ├─ src/
│  │  ├─ banco.ts
│  │  ├─ servidor.ts
│  │  └─ tipos.ts
│  ├─ .env.exemplo
│  ├─ package.json
│  └─ tsconfig.json
├─ banco/
│  ├─ script.sql
│  ├─ testes_erros.sql
│  ├─ desafio_prata.sql
│  ├─ desafio_ouro.sql
│  └─ README.md
└─ src/
   ├─ api.ts
   ├─ dom.ts
   ├─ tipos.ts
   ├─ servicos.ts
   └─ main.ts
```

## Como rodar

O projeto tem dois programas: a API (porta 3000) e a página (porta 5173).

### 1. Banco de dados

O MySQL precisa estar rodando. Se o banco `cineanchieta` ainda não existir, rode `banco/script.sql` no Workbench (ele recria o banco do zero).

### 2. API

```bash
cd api
npm install
# copie .env.exemplo para .env e preencha DB_SENHA
npm run dev
```

A API responde em `http://localhost:3000`.

### 3. Página

Em outro terminal, na raiz do projeto:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

Para conferir os tipos:

```bash
npm run verificar
cd api
npm run verificar
```

## Checklist da Aula 4

- Cadastrar um título: ele aparece na lista e continua depois de apertar F5.
- Clicar em **Começar**, **Concluir**, **Quero ver** ou **Reabrir**: o status muda no banco e o painel acompanha.
- Concluir grava `assistido_em`; reabrir apaga a data (confira no Workbench).
- **Editar** troca o título; **Remover** tira o título da lista e do banco.
- Um título de duas letras mostra a mensagem que veio da API, em vermelho.
- Um título com lançamento futuro ganha a etiqueta **"Em breve"**.
- `npm run verificar` passa sem erros nas duas pastas.

## API

A API tem uma dona fixa nesta aula: a Ana (`usuario_id = 1`). Por isso, a lista mostra 6 títulos; o Oppenheimer (#7) é do Bruno e responde `404`.

| Rota | O que faz | Sucesso |
| --- | --- | --- |
| `GET /api/titulos` | Lista os títulos da Ana, em ordem de id | `200` + os títulos |
| `GET /api/titulos/:id` | Devolve um título da Ana | `200` + o título |
| `POST /api/titulos` | Cadastra um título | `201` + o título criado |
| `PATCH /api/titulos/:id/status` | Muda só o status | `204`, sem conteúdo |
| `PUT /api/titulos/:id` | Edita só o título (Prata) | `200` + o título atualizado |
| `DELETE /api/titulos/:id` | Remove o título | `204`, sem conteúdo |

Quando dá errado: `400` se o pedido veio errado (título curto, formato, status ou data inválidos), `404` se o título não existe (ou é de outra pessoa) e `500` se o servidor quebrou.

Exemplos:

- `http://localhost:3000/api/titulos` → 6 títulos da Ana
- `http://localhost:3000/api/titulos/3` → Duna: Parte Dois
- `http://localhost:3000/api/titulos/7` → 404 (Oppenheimer é do Bruno)
- `http://localhost:3000/api/titulos/99` → 404

Para testar um `POST` antes de mexer na página, abra o console do navegador (F12) e cole:

```js
fetch("/api/titulos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    titulo: "Testar o POST",
    formato: "filme",
    lancamento: "2027-01-15",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

Depois rode `SELECT * FROM titulos;` no Workbench: o título estará lá. Tente também com `titulo: "ab"` e leia a resposta.

Enquanto os gêneros não são lidos da tabela `titulo_genero` (Aula 6), a API devolve `generos: []` em cada título.

## Banco de dados

O script `banco/script.sql` cria o banco `cineanchieta` com as tabelas `usuarios`, `titulos`, `generos` e `titulo_genero`.

1. Abra o MySQL Workbench e conecte com o usuário `root`.
2. Vá em **File → Open SQL Script** e escolha `banco/script.sql`.
3. Clique no botão do raio para executar tudo.
4. Na aba **Schemas**, clique em **Refresh**: o banco `cineanchieta` deve aparecer.

Conferência:

```sql
USE cineanchieta;

-- 7 linhas: 6 da Ana e 1 do Bruno
SELECT * FROM titulos;

-- Painel da Ana: 2 quero_ver, 2 assistindo, 2 assisti
SELECT status, COUNT(*) AS quantidade
FROM titulos
WHERE usuario_id = 1
GROUP BY status;

-- Concluir preenche assistido_em; reabrir apaga a data
SELECT id, titulo, status, assistido_em
FROM titulos
WHERE usuario_id = 1
ORDER BY id;

-- Ninguém lê a senha: o banco guarda só o hash
SELECT email, senha_hash FROM usuarios;
```

Os usuários de exemplo são **Ana** e **Bruno**, ambos com a senha `senha123` (o banco guarda apenas o hash bcrypt).

O `UPDATE` e o `DELETE` da API filtram por `id` **e** `usuario_id`. Por isso, tentar mexer no título #7 (do Bruno) devolve `404`, mesmo ele existindo no banco.

Detalhes do modelo, DER, testes de erro e desafios: [`banco/README.md`](banco/README.md).

## Tecnologias

- TypeScript
- Vite
- Node.js e Express
- mysql2
- HTML e CSS
- MySQL 8

## Próxima aula

Na Aula 5 o `USUARIO_FIXO` some: cada pessoa passa a ter a sua conta e só mexe nos próprios títulos. Na Aula 6 os gêneros passam a ser lidos de `titulo_genero`.
