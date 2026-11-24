# Aula 1 → Aula 2

- Formulário para cadastrar título e formato.
- Regras e validação (mínimo 3 caracteres) em `src/servicos.ts`.
- Lista redesenhada por `desenhar()` com `replaceChildren()`.
- `preventDefault()` para a página não recarregar.
- Script do banco `cineanchieta` em `banco/script.sql`, com 4 tabelas, 2 ENUM e chaves estrangeiras.
- Data de lançamento (`lancamento`) adicionada ao tipo `Titulo`.
- Versão atualizada para `v0.2.0`.

> Na Aula 2, os títulos cadastrados ficavam só na memória do navegador. A leitura do MySQL começou na Aula 3.

# Aula 2 → Aula 3

- API Express + MySQL na pasta `api/`, com pool `mysql2` e `.env`.
- Rotas `GET /api/titulos` e `GET /api/titulos/:id` (404 quando não existir).
- Proxy do Vite em `vite.config.ts`.
- `src/api.ts` com `listarTitulos()` e `buscarTitulo()`; `adicionadoEm` vira `Date`.
- `main.ts` desenha com `map`, conta com `filter` e busca com `find`.
- `mostrarTitulo(3)` no console (Prata) e aviso na tela quando a API está fora do ar (Ouro).
- `src/dados.ts` removido; a lista agora vem do MySQL.
- Versão atualizada para `v0.3.0`.

> O cadastro do formulário ainda fica só na memória do navegador; a escrita no banco começa na Aula 4.

# Aula 3 → Aula 4

- A API ganhou uma dona fixa (`USUARIO_FIXO = 1`, a Ana): a lista mostra 6 títulos; o #7 do Bruno responde 404.
- Rotas novas: `POST /api/titulos`, `PATCH /api/titulos/:id/status`, `PUT /api/titulos/:id` (Prata) e `DELETE /api/titulos/:id`.
- `api/src/tipos.ts` com `DadosTitulo`, `FORMATOS` e `STATUS`; a API valida antes de gravar.
- Todas as consultas usam `?`; nenhum texto do navegador vira parte do SQL.
- `PATCH` grava `assistido_em = IF(? = 'assisti', NOW(), NULL)`: concluir preenche a data, reabrir apaga.
- `PUT` usa `COALESCE(?, titulo)` para manter o título antigo quando nenhum novo é enviado.
- Tratador de erros com quatro parâmetros no fim do `servidor.ts`, devolvendo 500 sem vazar detalhes.
- `servicos.ts` ficou só com `transformar`; `gerarId` e `adicionarTitulo` saíram porque o id vem do banco.
- `api.ts` ganhou `enviar`, `cadastrarTitulo`, `alterarStatus`, `editarTitulo` e `removerTitulo`.
- `main.ts` tem botões **Começar**, **Concluir**, **Quero ver**, **Reabrir**, **Editar** e **Remover**, sempre no trio: banco confirma → lista reatribuída → `desenhar()`.
- **Prata:** botão **Editar** com `prompt()` e rota `PUT`.
- **Ouro:** campo de lançamento no formulário, etiqueta com a data e destaque **"Em breve"** para lançamento futuro.
- Painel agora mostra total, quero ver, assistindo e assistidos.
- Versão atualizada para `v0.4.0`.

# Aula 4 → Aula 5

- `USUARIO_FIXO` removido: o dono de cada título passa a ser quem fez login.
- Cadastro em `POST /api/usuarios`: a senha vira hash bcrypt (custo 10) antes de ir ao banco; e-mail repetido responde 409.
- Login em `POST /api/login`: `bcrypt.compare` confere a senha e a API assina um JWT de 8 horas com o id do usuário.
- `api/src/autenticacao.ts` com `exigirLogin` (middleware) e `usuarioDe(res)`; toda rota de título exige `Authorization: Bearer <token>`.
- `GET /api/eu` (Prata) devolve só `id`, `nome` e `email`; o hash nunca sai do banco.
- Todas as consultas de títulos filtram por `usuario_id = ?`, com o id vindo do token — nunca do corpo do pedido.
- `PUT` e `DELETE` que não encontram o título do dono respondem 404: o Bruno não apaga o #3 da Ana, e vice-versa.
- `src/api.ts` guarda a sessão em `localStorage` (`cineanchieta:sessao`) e manda o token em todas as chamadas; um 401 apaga a sessão e volta para a entrada.
- `main.ts` ganhou a tela de entrada (Entrar/Criar conta), o nome no cabeçalho vindo de `/api/eu` e o botão **Sair**.
- `index.html` e o CSS ganharam a tela de entrada, as ações do usuário e a regra `[hidden]`.
- Hashes de exemplo do `script.sql` corrigidos para casar com a senha `senha123`.
- Versão atualizada para `v0.5.0`; `api/package.json` em `0.5.0`, com `bcryptjs` e `jsonwebtoken`.

> Na Aula 6 os gêneros saem de `titulo_genero` e passam a vir do banco em cada título.

# Aula 5 → Aula 6

- O `SELECT_TITULOS` ganhou o alias `t` e uma subconsulta com `GROUP_CONCAT`: os gêneros de cada título chegam em uma linha só, como `"drama,ficção científica"`.
- `paraTitulo()` desfaz o `GROUP_CONCAT` com `split(",")` e devolve `[]` quando o banco manda `NULL`.
- `buscarUm` usa `t.id` e `t.usuario_id` e devolve o título já com os gêneros.
- `GET /api/titulos` aceita `?status=` e `?busca=`; a busca usa `LIKE` no título e `EXISTS` nos gêneros. A lista sai com `ORDER BY t.titulo`.
- Rota nova `GET /api/estatisticas`: `GROUP BY status` + `COUNT(*)`, começando com `{ quero_ver: 0, assistindo: 0, assisti: 0 }` porque status sem título não aparece.
- `POST /api/titulos` aceita `generos`; a API valida (até 10 gêneros, cada um com 1 a 40 caracteres) e grava com `ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)` + `INSERT IGNORE` em `titulo_genero`.
- `src/tipos.ts` ganhou `Contagem = Record<Status, number>`.
- `src/api.ts` ganhou `buscarEstatisticas()`; `converter()` normaliza `generos` para nunca chegar `undefined` à tela.
- `src/servicos.ts` ganhou `filtrarPorStatus`, `pesquisarTitulos` (título + gênero), `existeEmBreve`, `todasAssistidas`, `contarPorStatus` e `ordenarPorTitulo`; `transformar` continua para comparar com o `map`.
- `main.ts` ganhou `statusSelecionado`, `termoDeBusca`, `titulosVisiveis()`, `atualizarPainel()` e os ouvintes dos filtros e da busca.
- **Prata:** o painel usa `buscarEstatisticas` (GROUP BY) e cai para `contarPorStatus` (reduce) se a rota falhar; o comentário no código explica quando cada versão é melhor.
- **Ouro:** campo de gêneros no formulário, leitura dos gêneros no cartão e busca encontrando também pelos gêneros.
- `index.html` e o CSS ganharam filtros, busca, mensagem de lista vazia, aviso "Em breve" e a etiqueta de gênero.
- `README.md` atualizado; criado `GUIA_AULAS_6_7.md` com o roteiro da apresentação, perguntas da banca e cola de estudo.
- DER em imagem gerado em `banco/der-cineanchieta.png` (4 tabelas base), ligado no `banco/README.md`.
- Versão atualizada para `v0.6.0`; `api/package.json` e `api/package-lock.json` em `0.6.0`.

> Na Aula 7 não há conteúdo novo: é a apresentação do projeto do grupo, com 7 minutos de demonstração, banco, código e defesa das decisões.
