# CineAnchieta

Sistema de acompanhamento de filmes e séries desenvolvido como projeto do grupo na Aula 1 do curso TaskFlow.

## Tema

- **Registro principal:** título (filme ou série)
- **Status:** quero ver, assistindo, assisti
- **Formato:** filme ou série
- **Gêneros:** lista de textos
- **Data:** adicionadoEm

## O que a página faz

- Exibe o nome do sistema, a versão e a data de hoje
- Desenha os 6 títulos de exemplo com laço `for...of`
- Mostra a barra lateral e a etiqueta coloridas conforme o status
- Conta o total de títulos e quantos estão em "quero ver" com um `for` com índice
- Usa um `while` para encontrar o primeiro título de status "quero ver" e exibir o aviso "Comece por"

## Estrutura

```
├─ index.html
├─ css/cineanchieta.css
└─ src/
   ├─ dom.ts
   ├─ tipos.ts
   ├─ dados.ts
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

## Tecnologias

- TypeScript
- Vite
- HTML e CSS
