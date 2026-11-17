# CineAnchieta

Sistema de acompanhamento de filmes e séries desenvolvido como projeto do grupo no curso TaskFlow.

**Aula 5** — cadastro, login com bcrypt e JWT, e cada pessoa vê e mexe só nos próprios títulos.

## Tema

- **Registro principal:** título (filme ou série)
- **Status:** quero ver, assistindo, assisti
- **Formato:** filme ou série
- **Gêneros:** lista de textos (a API ainda devolve uma lista vazia; entra na Aula 6)
- **Data:** adicionadoEm
- **Data de lançamento:** lancamento (opcional)
- **Dono:** quem fez login — o `usuario_id` vem do token JWT, nunca da página
- **Conta:** nome, e-mail único e senha (o banco guarda só o hash bcrypt)

## O que a página faz

- Abre na tela de entrada, com **Entrar** e **Criar conta**
- Depois do login, guarda o token em `localStorage` e mostra no cabeçalho o nome vindo de `GET /api/eu`
- Busca na API só os títulos de quem entrou (`/api/titulos`) e desenha a lista com `map()` e `replaceChildren()`
- Conta o total e os títulos por status com `filter()`: quero ver, assistindo e assistidos
- Usa `find()` para achar o primeiro título de status "quero ver" e exibir o aviso "Comece por"
- Mostra a barra lateral e a etiqueta coloridas conforme o status e o formato
- O formulário cadastra um título no MySQL, sempre com o dono que veio do token
- Os botões **Começar**, **Concluir**, **Quero ver** e **Reabrir** mudam o status no banco
- **Editar** troca o título usando `prompt()` (desafio Prata)
- **Remover** apaga o título do banco
- O campo **Lançamento** guarda a data e destaca com **"Em breve"** os títulos que ainda não estrearam (desafio Ouro)
- Se a API estiver fora do ar, uma mensagem amigável aparece na tela
- **Sair** apaga a sessão do navegador e volta para a tela de entrada
- O console mostra o resultado de `mostrarTitulo(3)` depois do login (desafio Prata da Aula 3)

> A lista é lida e escrita no MySQL. Cada conta enxerga apenas os próprios títulos; cadastrar, mudar o status, editar e remover continuam valendo depois de recarregar a página.

## Estrutura

```
├─ index.html
├─ vite.config.ts
├─ css/
│  └─ cineanchieta.css
├─ api/
│  ├─ src/
│  │  ├─ autenticacao.ts
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
# copie .env.exemplo para .env e preencha DB_SENHA e JWT_SEGREDO
npm run dev
```

O `JWT_SEGREDO` é a frase que assina os tokens. Use algo longo e só seu; se ele mudar, todas as sessões existentes param de valer.

A API responde em `http://localhost:3000`.

### 3. Página

Em outro terminal, na raiz do projeto:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador. A primeira tela é a de entrada.

### Contas de exemplo

| Nome | E-mail | Senha | Títulos |
| --- | --- | --- | --- |
| Ana Souza | `ana@cineanchieta.com` | `senha123` | 6 |
| Bruno Lima | `bruno@cineanchieta.com` | `senha123` | 1 (Oppenheimer, #7) |

Também é possível criar uma conta nova pelo botão **Criar conta**; ela começa com a lista vazia.

Para conferir os tipos:

```bash
npm run verificar
cd api
npm run verificar
```

## Checklist da Aula 5

- A página abre na tela de entrada; o sistema só aparece depois do login.
- Senha errada mostra **"E-mail ou senha inválidos."** e não entra.
- Entrar como Ana mostra o nome dela no cabeçalho, 6 títulos e o painel `6 / 2 / 2 / 2`.
- Recarregar a página mantém a sessão (F5 continua logado).
- **Sair** apaga a sessão e volta para a tela de entrada.
- **Criar conta** entra direto no sistema, mostra o nome novo e uma lista vazia.
- Entrar como Bruno mostra só o Oppenheimer; tentar abrir o título #3 da Ana devolve `404`.
- Sem `Authorization: Bearer <token>`, as rotas de títulos respondem `401`.
- `GET /api/eu` devolve só `id`, `nome` e `email` — nunca a senha nem o hash.
- `npm run verificar` passa sem erros nas duas pastas.

### O que continua valendo das Aulas 1–4

- Cadastrar um título: ele aparece na lista e continua depois de apertar F5.
- **Começar**, **Concluir**, **Quero ver** e **Reabrir** mudam o status; concluir grava `assistido_em`.
- **Editar** troca o título; **Remover** tira o título da lista e do banco.
- O `find` mostra **"Comece por"** e o console executa `mostrarTitulo(3)`.
- Lançamento futuro ganha a etiqueta **"Em breve"**.
- O aviso de API fora do ar continua funcionando.
- O painel mostra total, quero ver, assistindo e assistidos.

## API

A partir da Aula 5, o dono é **quem fez login**. O navegador manda o token no cabeçalho `Authorization`; a API descobre o `usuario_id` pela assinatura do JWT, não por um campo enviado pela página.

### Contas e sessão

| Rota | O que faz | Sucesso |
| --- | --- | --- |
| `POST /api/usuarios` | Cria uma conta; a senha vira hash bcrypt antes de ir ao banco | `201` + `{ id }` |
| `POST /api/login` | Confere e-mail e senha e devolve um token válido por 8 horas | `200` + `{ token, nome }` |
| `GET /api/eu` | Devolve quem está logado: `id`, `nome` e `email` (Prata) | `200` + o usuário |

### Títulos (todas exigem login)

| Rota | O que faz | Sucesso |
| --- | --- | --- |
| `GET /api/titulos` | Lista os títulos do usuário logado, em ordem de id | `200` + os títulos |
| `GET /api/titulos/:id` | Devolve um título do usuário logado | `200` + o título |
| `POST /api/titulos` | Cadastra um título para o usuário logado | `201` + o título criado |
| `PATCH /api/titulos/:id/status` | Muda só o status | `204`, sem conteúdo |
| `PUT /api/titulos/:id` | Edita só o título (Prata) | `200` + o título atualizado |
| `DELETE /api/titulos/:id` | Remove o título | `204`, sem conteúdo |

Quando dá errado: `400` se o pedido veio errado (título curto, formato, status, data ou cadastro inválido), `401` sem token, com token vencido/inválido ou com e-mail/senha errados, `404` se o título não existe **ou é de outra pessoa**, `409` se o e-mail já está cadastrado e `500` se o servidor quebrou.

### Exemplos

Entre como Ana e guarde o token no console do navegador:

```js
const { token } = await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "ana@cineanchieta.com", senha: "senha123" }),
}).then((r) => r.json());

const meusTitulos = await fetch("/api/titulos", {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());

console.log(meusTitulos);
```

- `GET /api/titulos` com o token da Ana → 6 títulos
- `GET /api/titulos/3` com o token da Ana → Duna: Parte Dois
- `GET /api/titulos/7` com o token da Ana → 404 (Oppenheimer é do Bruno)
- `GET /api/titulos` sem o cabeçalho `Authorization` → 401
- `GET /api/eu` com o token da Ana → `{ id: 1, nome: "Ana Souza", email: "ana@cineanchieta.com" }`

Para testar um `POST` autenticado:

```js
await fetch("/api/titulos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    titulo: "Testar o POST",
    formato: "filme",
    lancamento: "2027-01-15",
  }),
}).then((r) => r.json());
```

Depois rode `SELECT * FROM titulos;` no Workbench: o título estará lá, com o `usuario_id` de quem fez o pedido. Tente também com `titulo: "ab"` e leia a resposta.

Enquanto os gêneros não são lidos da tabela `titulo_genero` (Aula 6), a API devolve `generos: []` em cada título.

### Por que ninguém apaga o título de outra pessoa? (Ouro)

Toda escrita filtra por **id e dono**:

```sql
DELETE FROM titulos
 WHERE id = ?
   AND usuario_id = ?;
```

O `usuario_id` vem do token, não do corpo do pedido. Se o Bruno (id 2) tentar apagar o título #3 da Ana, o MySQL procura uma linha com `id = 3 AND usuario_id = 2` e não encontra nenhuma. O `DELETE` afeta **0 linhas**, e a API responde `404` — a mesma resposta de um título inexistente. O mesmo vale para `GET`, `PATCH` e `PUT`: saber o id de outra pessoa não basta.

## Banco de dados

O script `banco/script.sql` cria o banco `cineanchieta` com as tabelas `usuarios`, `titulos`, `generos` e `titulo_genero`.

1. Abra o MySQL Workbench e conecte com o usuário `root`.
2. Vá em **File → Open SQL Script** e escolha `banco/script.sql`.
3. Clique no botão do raio para executar tudo.
4. Na aba **Schemas**, clique em **Refresh**: o banco `cineanchieta` deve aparecer.

Conferência:

```sql
USE cineanchieta;

-- 7 linhas: 6 da Ana e 1 do Bruno; cada uma com o seu dono
SELECT u.nome AS dono, t.id, t.titulo, t.status
FROM titulos AS t
JOIN usuarios AS u ON u.id = t.usuario_id
ORDER BY t.id;

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

-- Ninguém lê a senha: o banco guarda só o hash bcrypt de 60 caracteres
SELECT id, nome, email, CHAR_LENGTH(senha_hash) AS tamanho_hash
FROM usuarios;
```

Os usuários de exemplo são **Ana** e **Bruno**, ambos com a senha `senha123` (o banco guarda apenas o hash bcrypt).

O login não compara senha em SQL: ele busca o hash pelo e-mail, usa `bcrypt.compare` e só então assina o token. O `UPDATE` e o `DELETE` da API filtram por `id` **e** `usuario_id`. Por isso, tentar mexer no título #7 (do Bruno) devolve `404`, mesmo ele existindo no banco.

Detalhes do modelo, DER, testes de erro e desafios: [`banco/README.md`](banco/README.md).

## Tecnologias

- TypeScript
- Vite
- Node.js e Express
- mysql2
- bcryptjs
- jsonwebtoken (JWT)
- HTML e CSS
- MySQL 8

## Próxima aula

Na Aula 6 os gêneros saem de `titulo_genero` e passam a vir do banco em cada título, substituindo o `generos: []` atual.
