# CineAnchieta

Sistema de acompanhamento de filmes e séries desenvolvido como projeto do grupo no curso TaskFlow.

**Aula 3** — API Express + MySQL, lista vinda do banco com `map`, `filter` e `find`.

## Tema

- **Registro principal:** título (filme ou série)
- **Status:** quero ver, assistindo, assisti
- **Formato:** filme ou série
- **Gêneros:** lista de textos (a API ainda devolve uma lista vazia; entra na Aula 6)
- **Data:** adicionadoEm
- **Data de lançamento:** lancamento (opcional)

## O que a página faz

- Exibe o nome do sistema, a versão e a data de hoje
- Busca os títulos na API (`/api/titulos`) e desenha a lista com `map()` e `replaceChildren()`
- Conta o total e quantos estão em "quero ver" com `filter()`
- Usa `find()` para achar o primeiro título de status "quero ver" e exibir o aviso "Comece por"
- Mostra a barra lateral e a etiqueta coloridas conforme o status e o formato
- **Novo:** o formulário cadastra um título na hora, com validação de título mínimo de 3 caracteres
- **Novo:** o console mostra o resultado de `mostrarTitulo(3)` (desafio Prata)
- **Novo:** se a API estiver fora do ar, uma mensagem amigável aparece na tela (desafio Ouro)

> A lista já é lida do MySQL. O cadastro do formulário ainda fica só na memória do navegador; a escrita no banco começa na Aula 4.

## Estrutura

```
├─ index.html
├─ vite.config.ts
├─ css/
│  └─ cineanchieta.css
├─ api/
│  ├─ src/
│  │  ├─ banco.ts
│  │  └─ servidor.ts
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

## API

| Rota | O que faz |
| --- | --- |
| `GET /api/titulos` | Devolve todos os títulos do banco, em ordem de id |
| `GET /api/titulos/:id` | Devolve um título ou `404` com uma mensagem |

Exemplos:

- `http://localhost:3000/api/titulos`
- `http://localhost:3000/api/titulos/3` → Duna: Parte Dois
- `http://localhost:3000/api/titulos/99` → 404

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

-- Ninguém lê a senha: o banco guarda só o hash
SELECT email, senha_hash FROM usuarios;
```

Os usuários de exemplo são **Ana** e **Bruno**, ambos com a senha `senha123` (o banco guarda apenas o hash bcrypt).

Detalhes do modelo, DER, testes de erro e desafios: [`banco/README.md`](banco/README.md).

## Tecnologias

- TypeScript
- Vite
- Node.js e Express
- mysql2
- HTML e CSS
- MySQL 8

## Próxima aula

Na Aula 4 o cadastro, a conclusão e a remoção de títulos passam a gravar no banco.
