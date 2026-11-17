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

> Na Aula 5 o dono fixo some: o `usuario_id` passa a ser quem fez login. Na Aula 6 os gêneros saem de `titulo_genero`.
