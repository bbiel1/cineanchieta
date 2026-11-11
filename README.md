# CineAnchieta

Sistema de acompanhamento de filmes e séries desenvolvido como projeto do grupo no curso TaskFlow.

**Aula 2** — funções, formulário de cadastro e banco de dados MySQL.

## Tema

- **Registro principal:** título (filme ou série)
- **Status:** quero ver, assistindo, assisti
- **Formato:** filme ou série
- **Gêneros:** lista de textos
- **Data:** adicionadoEm
- **Data de lançamento:** lancamento (opcional)

## O que a página faz

- Exibe o nome do sistema, a versão e a data de hoje
- Desenha os títulos com a função de alta ordem `transformar()` e `replaceChildren()`
- Mostra a barra lateral e a etiqueta coloridas conforme o status
- Conta o total de títulos e quantos estão em "quero ver"
- Usa um `while` para encontrar o primeiro título de status "quero ver" e exibir o aviso "Comece por"
- **Novo:** o formulário cadastra um título na hora, com validação de título mínimo de 3 caracteres
- **Novo:** o formulário não recarrega a página (`preventDefault()`)
- **Novo:** a lista é redesenhada por `desenhar()` sempre que um título é cadastrado

> Os títulos cadastrados na tela ficam apenas na memória do navegador. A persistência no MySQL começa na Aula 3, quando a API entrar no projeto.

## Estrutura

```
├─ index.html
├─ css/
│  └─ cineanchieta.css
├─ banco/
│  ├─ script.sql
│  ├─ testes_erros.sql
│  ├─ desafio_prata.sql
│  ├─ desafio_ouro.sql
│  └─ README.md
└─ src/
   ├─ dom.ts
   ├─ tipos.ts
   ├─ dados.ts
   ├─ servicos.ts
   └─ main.ts
```

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

Para conferir os tipos:

```bash
npm run verificar
```

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
- HTML e CSS
- MySQL 8

## Próxima aula

Na Aula 3 a lista passa a vir do banco por meio de uma API em Node.js + TypeScript.
