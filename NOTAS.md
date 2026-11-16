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
