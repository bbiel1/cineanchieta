# CineAnchieta — guia para memorizar (Aulas 6 e 7)

> **Para que serve este arquivo:** estudar o projeto, entender o que foi feito na Aula 6 e ensaiar a apresentação da Aula 7. Se você só tiver uma hora, leia a seção **1**, a **6**, a **7** e a **10**.

**Projeto:** CineAnchieta — sistema de acompanhamento de filmes e séries
**Curso:** TaskFlow — Aula 6 (consultas e painel) e Aula 7 (apresentação)
**Apresentação:** 26/11, 7 minutos
**Versão do projeto:** v0.6.0
**Banco:** `cineanchieta` (MySQL 8; no XAMPP, MariaDB)
**Contas de exemplo:** Ana `ana@cineanchieta.com` / `senha123`; Bruno `bruno@cineanchieta.com` / `senha123`

---

## 1. O projeto em 30 segundos

> "O CineAnchieta é um sistema web para acompanhar filmes e séries. A pessoa cria uma conta, entra, cadastra títulos, escolhe o formato (filme ou série) e acompanha o status: quero ver, assistindo ou assisti. Pode editar e remover. Cada conta vê só os próprios títulos. Os gêneros ficam em tabelas separadas, numa relação N:N. A página é TypeScript + Vite; a API é Express + mysql2; o banco é MySQL. O login usa bcrypt e JWT. Na Aula 6 entraram os gêneros no cartão, os filtros, a busca e o painel calculado no banco com GROUP BY."

### As três peças

| Peça | Onde | Porta | O que faz |
| --- | --- | --- | --- |
| Página | `src/` | 5173 | HTML/CSS/TypeScript; desenha a lista e chama a API |
| API | `api/` | 3000 | Express; valida, autentica e conversa com o MySQL |
| Banco | `banco/` | 3306 | MySQL `cineanchieta`, com 4 tabelas principais |

### O caminho de um clique

1. A pessoa clica em **Concluir**.
2. `main.ts` chama `mudarStatus(id, "assisti")`.
3. `api.ts` chama `enviar("PATCH", "/api/titulos/:id/status", { status })`.
4. `enviar` pega a sessão do `localStorage` e monta `Authorization: Bearer <token>`.
5. O proxy do Vite manda `/api` para `http://localhost:3000`.
6. O middleware `exigirLogin` verifica o token e descobre o `usuarioId`.
7. A rota roda o SQL parametrizado:
   ```sql
   UPDATE titulos
      SET status = ?,
          assistido_em = IF(? = 'assisti', NOW(), NULL)
    WHERE id = ? AND usuario_id = ?
   ```
8. O MySQL confirma. Se nenhuma linha mudou, a API responde `404`; senão, `204`.
9. `main.ts` reatribui a lista e chama `desenhar()`. Só então a tela muda.

**Frase para a apresentação:** *"Nenhum clique altera só a tela: o banco confirma primeiro, a lista é reatribuída e só então a tela é redesenhada."*

---

## 2. O que já está pronto (Aulas 1–6)

| Aula | O que entrou |
| --- | --- |
| 1 | HTML, CSS, TypeScript; tipos `Titulo`, `Formato`, `Status`; lista com `map`, `filter` e `find` |
| 2 | Formulário, validação de 3 caracteres, `preventDefault`, `desenhar()` com `replaceChildren`, banco com 4 tabelas, lançamento |
| 3 | API Express + MySQL, `GET /api/titulos` e `/api/titulos/:id`, proxy do Vite, lista vinda do banco, aviso de API fora do ar |
| 4 | CRUD completo (`POST`, `PATCH`, `PUT`, `DELETE`), validação no servidor, `?` em todas as consultas, `assistido_em`, `COALESCE`, botões, painel, "Em breve" |
| 5 | Cadastro/login, bcrypt custo 10, JWT de 8h, `exigirLogin`, `GET /api/eu`, cada usuário só vê o seu, `404` para título de outra pessoa, sessão no `localStorage`, tela de entrada, **Sair** |
| 6 | Gêneros lidos do banco com `GROUP_CONCAT`, filtros por status, busca por título/gênero, painel com `GROUP BY`, ordenação, campo de gêneros no formulário |

### O que a Aula 6 acrescentou, em uma frase

*"Os gêneros voltaram para o cartão, a lista ganhou filtro e busca, e o painel deixou de ser calculado no navegador para ser calculado pelo banco."*

---

## 3. O banco de dados

### As 4 tabelas

| Tabela | Guarda | Ligação |
| --- | --- | --- |
| `usuarios` | id, nome, e-mail único, `senha_hash` (60 caracteres), criado_em | — |
| `titulos` | id, dono, título, descrição, formato, status, lançamento, datas | `usuario_id` → `usuarios` (1:N) |
| `generos` | id, dono, nome do gênero | `usuario_id` → `usuarios` (1:N) |
| `titulo_genero` | qual gênero está em qual título | `titulo_id` → `titulos` e `genero_id` → `generos` (N:N) |

### Restrições para citar na apresentação

- `ENUM` em `formato` (`filme`, `serie`) e em `status` (`quero_ver`, `assistindo`, `assisti`).
- `CHECK` de título com pelo menos 3 caracteres.
- `UNIQUE` no e-mail e em `(usuario_id, nome)` dos gêneros.
- Chaves estrangeiras com `ON DELETE CASCADE`.

### Por que gêneros em duas tabelas?

Porque um título tem vários gêneros e um gênero aparece em vários títulos. Uma coluna só guarda um valor. A tabela `titulo_genero` resolve a relação N:N: cada linha liga um título a um gênero. Isso permite reutilizar o gênero e consultar com `JOIN`.

### Números do script

- 2 usuários: Ana (id 1) e Bruno (id 2).
- 7 títulos: 6 da Ana + 1 do Bruno (Oppenheimer, #7).
- 8 gêneros e 14 ligações N:N.
- Painel da Ana: **6 no total, 2 quero ver, 2 assistindo, 2 assisti**.
- Título #3: **Duna: Parte Dois** (da Ana).
- Com o token da Ana, `GET /api/titulos/7` responde **404** (é do Bruno).

### DER

O diagrama está em `banco/README.md` (Mermaid). A versão em imagem já está pronta em **`banco/der-cineanchieta.png`**, com as 4 tabelas base e as ligações — é essa que você leva para a apresentação (slide, Word ou PDF).

Se quiser gerar outra versão pelo Workbench:

1. Abra o MySQL Workbench.
2. **Database → Reverse Engineer**.
3. Selecione `cineanchieta` e siga até o diagrama.
4. Exporte em PNG ou PDF.

> O PNG pronto mostra só as 4 tabelas base. Se quiser exibir a tabela `comentarios` (desafio Ouro da Aula 2), rode `banco/desafio_ouro.sql` antes e gere o DER pelo Workbench.

---

## 4. Aula 6: as funções de array

| Função | Pergunta que responde | Devolve | Cuidado |
| --- | --- | --- | --- |
| `filter` | Quais passam no teste? | novo array | não altera o original |
| `find` | Qual é o primeiro? | item ou `undefined` | para no primeiro |
| `some` | Existe pelo menos um? | `true`/`false` | para no primeiro que atende |
| `every` | Todos atendem? | `true`/`false` | para no primeiro que falha; lista vazia dá `true` |
| `reduce` | Qual é o acumulado? | um valor | precisa de `return acumulador` |
| `sort` | Em que ordem ficam? | array ordenado | **altera o original**; use `[...lista]` |

### `reduce` — o painel no navegador

```ts
const contagem = lista.reduce<Contagem>((acc, titulo) => {
  acc[titulo.status]++;
  return acc; // sem este return, o próximo acc é undefined
}, { quero_ver: 0, assistindo: 0, assisti: 0 });
```

### `sort` — ordenar sem estragar a lista

```ts
const ordenada = [...lista].sort((a, b) =>
  a.titulo.localeCompare(b.titulo, "pt-BR")
);
```

O comparador precisa devolver **número**: negativo se `a` vem antes, positivo se `b` vem antes, zero no empate. Se devolver `true`/`false`, a ordem fica errada.

### `Record<Status, number>`

```ts
export type Contagem = Record<Status, number>;
```

`Record` obriga o objeto a ter todas as chaves do tipo `Status`. O painel começa com zeros porque o `GROUP BY` não devolve linha para um status sem nenhum título.

### Onde cada função aparece no projeto

| Função | Onde está | Para que serve |
| --- | --- | --- |
| `filter` | `filtrarPorStatus` | mostrar só um status |
| `includes` | `pesquisarTitulos` | buscar no título e nos gêneros |
| `some` | `existeEmBreve` | mostrar o aviso "Em breve" |
| `every` | `todasAssistidas` | avisar no console quando tudo foi assistido |
| `reduce` | `contarPorStatus` | painel local (reserva do desafio Prata) |
| `sort` | `ordenarPorTitulo` | ordenar a lista sem alterar a original |

---

## 5. Aula 6: o irmão SQL de cada função

| Pergunta | Navegador | Banco |
| --- | --- | --- |
| Só os de um status | `filter` | `WHERE status = ?` |
| Título contém "duna" | `toLowerCase().includes` | `WHERE titulo LIKE ?` com `%duna%` |
| O título #3 | `find` | `WHERE id = ?` |
| Existe algum em breve? | `some` | `EXISTS(SELECT 1 ...)` |
| Quantos por status | `reduce` | `GROUP BY status` + `COUNT(*)` |
| Ordenar | `[...lista].sort` | `ORDER BY ...` |
| Gêneros de cada título | `map` + `split` | `JOIN` + `GROUP_CONCAT` |

### `GROUP BY` + `COUNT(*)`

```sql
SELECT status, COUNT(*) AS quantidade
FROM titulos
WHERE usuario_id = ?
GROUP BY status;
```

### `GROUP_CONCAT`: várias linhas viram uma

```sql
(SELECT GROUP_CONCAT(g.nome ORDER BY g.nome SEPARATOR ',')
   FROM titulo_genero tg
   JOIN generos g ON g.id = tg.genero_id
  WHERE tg.titulo_id = t.id) AS generos
```

O banco devolve `"drama,terror"` ou `NULL`. A função `paraTitulo` faz o caminho de volta:

```ts
generos: linha.generos ? String(linha.generos).split(",") : []
```

### Onde calcular: navegador ou banco?

- **Filtro de status e busca:** no **navegador**, sobre a lista já carregada. A lista é pequena, a resposta é instantânea e não usa a rede.
- **Painel:** no **banco**, com `GROUP BY`. Conta todos os títulos do usuário, inclusive os que o filtro esconde, e o banco resolve em uma consulta só.
- **Gêneros:** no **banco**, com `JOIN` + `GROUP_CONCAT`, porque estão em outra tabela (N:N) e já vêm junto com cada título.

**Frase-chave:** *"O filtro muda o que é mostrado, nunca o que existe."*

---

## 6. O que foi feito na Aula 6 (mapa do código)

### API (`api/src/servidor.ts`)

- `SELECT_TITULOS` com alias `t` e subconsulta `GROUP_CONCAT`.
- `paraTitulo()` faz `split(",")` e devolve `[]` quando o banco manda `NULL`.
- `buscarUm()` usa `t.id` e `t.usuario_id` e devolve o título com gêneros.
- `GET /api/titulos` aceita `?status=` e `?busca=`; a busca usa `LIKE` no título e `EXISTS` nos gêneros.
- `GET /api/estatisticas` usa `GROUP BY` e começa com zeros.
- `POST /api/titulos` aceita `generos`; `salvarGeneros()` grava em `generos` e `titulo_genero` com `ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)` + `INSERT IGNORE`.
- Validação: até 10 gêneros, cada um com 1 a 40 caracteres.

### Front (`src/`)

- `src/tipos.ts`: `Contagem = Record<Status, number>`.
- `src/api.ts`: `buscarEstatisticas()`; `converter()` normaliza `generos`.
- `src/servicos.ts`: `filtrarPorStatus`, `pesquisarTitulos`, `existeEmBreve`, `todasAssistidas`, `contarPorStatus`, `ordenarPorTitulo`.
- `src/main.ts`: `statusSelecionado`, `termoDeBusca`, `titulosVisiveis()`, `mostrarContagem()`, `atualizarPainel()`, `desenhar()`, ouvintes dos filtros e da busca.
- **Prata:** `atualizarPainel()` usa `buscarEstatisticas()` (GROUP BY) e cai para `contarPorStatus(lista)` (reduce) se a rota falhar; o comentário explica quando cada versão é melhor.
- **Ouro:** campo de gêneros no formulário, gêneros no cartão e busca encontrando também pelos gêneros.

### HTML e CSS

- Filtros: **Todas**, **Quero ver**, **Assistindo**, **Assisti**.
- Campo de busca: "Pesquisar por título ou gênero...".
- Mensagem `Nenhum título encontrado.` quando o filtro não acha nada.
- Aviso "Atenção: há títulos com lançamento futuro na sua lista."
- Etiqueta de gênero com cor própria.

---

## 7. Aula 7: o roteiro de 7 minutos

| Momento | Tempo | O que mostrar |
| --- | --- | --- |
| **Demonstração** | 2 min | Criar conta, entrar, cadastrar, filtrar, editar e remover |
| **Banco** | 2 min | O DER e uma decisão de modelagem (por que gêneros em tabela separada) |
| **Código** | 2 min | Uma rota da API e o SQL que ela executa, do clique até o banco |
| **Dificuldade** | 1 min | Um problema real que o grupo enfrentou e como resolveu |

**Regras:** todos os integrantes falam; se passar de 7 minutos, corte a demonstração, não a explicação; leve o projeto aberto e rodando; deixe o DER (PNG) aberto numa aba; console (F12) sem erros vermelhos.

### Demonstração sugerida (2 min)

1. Abra `http://localhost:5173` e entre como Ana.
2. Mostre o painel **6 / 2 / 2 / 2** e diga: *"Os números vêm do banco com GROUP BY."*
3. Mostre os gêneros nos cartões (Interestelar: drama e ficção científica).
4. Clique em **Quero ver**: a lista filtra, o painel continua 6.
5. Digite `terror` na busca: aparecem Stranger Things e The Last of Us.
6. Cadastre um título com gêneros (ex.: "Duna: Parte Três", lançamento 2027, gêneros "drama, ficção científica"). Mostre a etiqueta "Em breve" e o total indo para 7.
7. Clique em **Editar** e troque o nome; depois **Remover** e mostre o total voltando para 6.

### Código sugerido (2 min)

Abra `api/src/servidor.ts` e mostre, na ordem:

1. `SELECT_TITULOS` com `GROUP_CONCAT`.
2. `paraTitulo` com `split(",")`.
3. `GET /api/estatisticas` com `GROUP BY`.
4. O `WHERE id = ? AND usuario_id = ?` de uma escrita.

Diga: *"O usuário manda o token; a API descobre o id; o SQL usa ? para o texto nunca virar comando."*

### Dificuldade sugerida (1 min)

Conte um problema real, por exemplo: *"Os gêneros chegavam como um texto só; a lista ficava com uma string em vez de vários gêneros. A solução foi o GROUP_CONCAT no banco e o split no front."* Ou: *"O sort embaralhava a lista original; a solução foi copiar com [...lista] antes de ordenar."*

---

## 8. Requisitos mínimos e rubrica

### Requisitos mínimos (10)

1. Pelo menos **3 tabelas**, com uma **chave estrangeira** e um **ENUM ou CHECK**.
2. **DER** em imagem ou PDF.
3. **Cadastro e login**, com senha em hash.
4. **CRUD completo** da entidade principal gravando no MySQL.
5. **Tela de listagem** com filtro ou busca.
6. **Painel** com pelo menos dois números calculados.
7. Pelo menos uma consulta com **JOIN ou GROUP BY**.
8. Consultas sempre **parametrizadas** (`?`), sem concatenar texto em SQL.
9. `npm run verificar` sem erros **nas duas pastas**.
10. **README.md** com os passos para rodar e **`.env.exemplo`** no repositório.

### O CineAnchieta atende

| Requisito | Situação |
| --- | --- |
| 1. Tabelas, FK, ENUM/CHECK | 4 tabelas, 3 FKs, 2 ENUM, 1 CHECK, 2 UNIQUE |
| 2. DER | Diagrama em `banco/README.md` + imagem pronta em `banco/der-cineanchieta.png` |
| 3. Login com hash | `bcrypt.hash` + `bcrypt.compare` |
| 4. CRUD | POST, GET, PATCH, PUT e DELETE no MySQL |
| 5. Filtro ou busca | Filtros por status + busca por título/gênero |
| 6. Painel | 4 números com `GROUP BY` |
| 7. JOIN ou GROUP BY | `GROUP BY` no painel e `JOIN` no `GROUP_CONCAT` |
| 8. Consultas parametrizadas | Todas usam `?` |
| 9. `npm run verificar` | Passa nas duas pastas |
| 10. README + `.env.exemplo` | Atualizados |

### Rubrica (10 pontos)

| Critério | Pontos | O que conta |
| --- | --- | --- |
| Modelagem do banco | 2,0 | DER coerente, FKs, tipos adequados, restrição (ENUM, CHECK ou UNIQUE) |
| Funcionamento | 2,5 | Login e CRUD completos no MySQL, sem erros no console |
| Qualidade do TypeScript | 2,0 | Tipos e interfaces, funções de array com propósito, `npm run verificar` limpo |
| Segurança | 1,5 | Senha em hash, consultas parametrizadas, cada usuário vê só o seu, `.env` fora do Git |
| Apresentação e defesa | 2,0 | Explica as escolhas e responde às perguntas; todos os integrantes falam |

---

## 9. Perguntas da banca (com respostas prontas)

**"Por que esse filtro está no navegador e aquele está no WHERE?"**

> "O filtro de status e a busca rodam no navegador porque a lista do usuário já foi carregada e é pequena; queremos resposta instantânea, sem uma requisição a cada tecla. O painel é calculado no banco com `GROUP BY` porque precisa contar todos os títulos do usuário, não só os visíveis, e o banco resolve isso em uma consulta. Os gêneros vêm do banco com `JOIN` e `GROUP_CONCAT` porque estão em tabelas separadas pela relação N:N."

**"Mostre no código onde a senha vira hash. Por que não guardar a senha?"**

> "No `POST /api/usuarios`, `bcrypt.hash(senha, 10)` transforma a senha em hash antes do `INSERT`. O banco guarda só `senha_hash`; o login usa `bcrypt.compare`. Se o banco vazar, ninguém lê a senha."

**"O que impede um usuário de apagar o registro de outro?"**

> "Todas as consultas de títulos filtram por `id = ? AND usuario_id = ?`. O `usuario_id` vem do token JWT, não do corpo do pedido. Se não encontrar, a API responde `404` — a mesma resposta de um título inexistente."

**"O que acontece se eu digitar `' OR '1'='1` no campo de busca?"**

> "Nada. As consultas usam `?`; o `mysql2` envia o comando e os valores separados, então o texto vira valor, não SQL. Se a busca for feita no navegador, é só `includes` e nem chega ao banco."

**"Por que essa informação ficou numa tabela separada, e não numa coluna?"**

> "Porque é uma relação N:N: um título tem vários gêneros e um gênero aparece em vários títulos. Uma coluna guarda um valor só. `generos` + `titulo_genero` permitem reutilizar o gênero e consultar com `JOIN`."

**"Se o banco cair agora, o que o usuário vê na tela?"**

> "A API responde `500` (ou o proxy `502/504`), e a página mostra uma mensagem amigável: 'Não foi possível falar com a API. Verifique se ela está rodando.' O console mostra o erro, mas a página não quebra. O painel ainda tem a versão local com `reduce` como reserva."

**"Por que o `.env` não está no repositório?"**

> "Porque tem a senha do MySQL e o `JWT_SEGREDO`. Ele está no `.gitignore`; no lugar dele, o repositório traz o `.env.exemplo`, sem valores."

**Outras respostas curtas:**

- **PUT x PATCH:** `PATCH` muda só o status; `PUT` edita o título. Cada rota tem uma responsabilidade.
- **201 x 204:** `201` = criado, devolve o registro; `204` = sucesso sem conteúdo.
- **`assistido_em`:** data em que o título foi concluído; o `PATCH` grava `NOW()` ao marcar `assisti` e `NULL` ao reabrir.
- **`COALESCE`:** devolve o primeiro valor não nulo; no `PUT`, mantém o título antigo se nenhum novo for enviado.
- **Por que validar no servidor se o HTML já valida?** Porque a API pode ser chamada direto; a validação do servidor é a que vale.
- **O que falta?** Gêneros, filtros, busca e painel do banco já estão; faltam o commit, o ensaio e o backup.

---

## 10. Números, URLs e comandos (cola final)

| Item | Valor |
| --- | --- |
| Banco | `cineanchieta` |
| Tabelas | 4: `usuarios`, `titulos`, `generos`, `titulo_genero` |
| Usuários | 2: Ana (id 1) e Bruno (id 2) |
| Títulos | 7 no script: 6 da Ana + 1 do Bruno |
| Gêneros / ligações | 8 gêneros / 14 ligações N:N |
| Painel da Ana | 6 no total: 2 quero ver, 2 assistindo, 2 assisti |
| Título #3 | Duna: Parte Dois (da Ana) |
| Título #7 | Oppenheimer (do Bruno) — com o token da Ana, 404 |
| Portas | MySQL 3306, API 3000, página 5173 |
| Versão | v0.6.0 (UI e API) |
| Contas | Ana `ana@cineanchieta.com` / `senha123`; Bruno `bruno@cineanchieta.com` / `senha123` |
| Página | `http://localhost:5173` |
| API | `http://localhost:3000/api/titulos` |
| Comandos | `cd api && npm run dev`; `npm run dev`; `npm run verificar` (raiz e api); `npx vite build` |

### Rotas atuais

- `POST /api/usuarios`
- `POST /api/login`
- `GET /api/eu`
- `GET /api/estatisticas` ← Aula 6
- `GET /api/titulos` (aceita `?status=` e `?busca=`) ← Aula 6
- `GET /api/titulos/:id`
- `POST /api/titulos` (aceita `generos`) ← Aula 6
- `PATCH /api/titulos/:id/status`
- `PUT /api/titulos/:id`
- `DELETE /api/titulos/:id`

### Frases de emergência

- "Não implementei isso ainda; o próximo passo seria..."
- "Essa decisão foi para manter o escopo da Aula 6."
- "Os gêneros existem no banco, mas a leitura entrou na Aula 6."
- "O 404 é proposital para não revelar títulos de outra pessoa."
- "A validação principal é no servidor."
- "O filtro muda o que é mostrado, não o que existe."
- "O banco confirma antes de a tela mudar."

---

## 11. Plano de estudo: 24, 25 e 26/11

### Hoje, 24/11 (terça)

- [ ] Rodar `banco/script.sql` do zero (se puder; ele apaga o banco).
- [ ] Subir a API (`cd api && npm run dev`) e a página (`npm run dev`).
- [ ] Entrar como Ana e conferir o checklist da Aula 6.
- [x] Passar `npm run verificar` nas duas pastas.
- [x] Fazer o commit da Aula 6.

### Amanhã, 25/11 (quarta)

- [x] DER em imagem pronto: `banco/der-cineanchieta.png` (4 tabelas base).
- [ ] Clonar o repositório numa pasta nova e seguir o README ao pé da letra.
- [ ] Fazer backup com `mysqldump` e levar num pen drive.
- [ ] Ensaiar com cronômetro: 2 + 2 + 2 + 1.
- [ ] Decorar os números e as respostas da seção 9.

### 26/11 (quinta)

- [ ] Chegar com banco, API e página rodando **antes** de o grupo ser chamado.
- [ ] Entregar o endereço do repositório no começo da aula.
- [ ] DER (PNG) aberto numa aba; console (F12) sem erros vermelhos.
- [ ] Se der erro ao vivo: leia a mensagem em voz alta e explique o que ela significa.

---

## 12. Checklist antes de ser chamado

- [ ] O endereço do repositório foi entregue ao professor.
- [ ] O banco, a API e a página estão rodando.
- [ ] O DER (PNG) está aberto numa aba.
- [ ] O console do navegador está sem erros em vermelho.
- [ ] Todos os integrantes sabem explicar qualquer parte do projeto.
- [ ] O cronômetro fechou em 7 minutos no ensaio.
- [ ] O README permite que outra pessoa rode o projeto.

---

## 13. Glossário rápido

| Termo | O que é |
| --- | --- |
| **TypeScript** | JavaScript com tipos; o `tsc` confere os tipos sem gerar arquivo (`--noEmit`) |
| **Vite** | Ferramenta que roda a página em desenvolvimento e faz o build |
| **API** | Programa que recebe pedidos HTTP e responde JSON |
| **Express** | Framework que cria as rotas da API |
| **MySQL** | Banco de dados relacional |
| **SQL** | Linguagem das consultas (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) |
| **Query parametrizada** | Consulta com `?`; o valor vai separado do comando |
| **JOIN** | Junta linhas de duas tabelas por uma ligação |
| **GROUP BY** | Agrupa linhas para contar/resumir |
| **GROUP_CONCAT** | Junta vários valores em um texto só |
| **Subconsulta** | Consulta dentro de outra consulta |
| **JWT** | Token assinado que prova quem fez login |
| **bcrypt** | Algoritmo que transforma a senha em hash |
| **Hash** | Texto irreversível que representa a senha |
| **Middleware** | Função que roda antes da rota (o `exigirLogin`) |
| **localStorage** | Memória do navegador onde a sessão fica guardada |
| **CRUD** | Create, Read, Update, Delete (criar, ler, editar, apagar) |
| **DER** | Diagrama entidade-relacionamento do banco |
| **ENUM** | Tipo do MySQL que aceita só os valores listados |
| **CHECK** | Restrição que valida uma regra (título com 3+ caracteres) |
| **FK** | Chave estrangeira; liga uma tabela à outra |
| **N:N** | Muitos-para-muitos; precisa de uma tabela de ligação |
