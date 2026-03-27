# Site Atletica Magnatas

Projeto React criado a partir dos arquivos soltos enviados, agora com estrutura real para navegar, testar carrinho e simular rota administrativa protegida.

## Como rodar

1. Instale o Node.js 20 ou superior.
2. No terminal, entre na pasta do projeto.
3. Rode `npm install`.
4. Rode `npm.cmd run dev` no PowerShell, ou execute `start-dev.cmd`.
5. Abra o endereco que o Vite mostrar no terminal.

## Observacao para Windows PowerShell

Se `npm run dev` falhar com erro de politica de execucao do `npm.ps1`, use `npm.cmd run dev` ou o arquivo `start-dev.cmd`. Os scripts do projeto tambem foram ajustados para usar um modo de carregamento do Vite compativel com este ambiente.

## O que foi organizado

- Estrutura de projeto com `src/`, `App.tsx`, rotas e `package.json`.
- Navbar, footer e layout com contexto de carrinho em `localStorage`.
- Loja demo com filtros por categoria e selecao de tamanho.
- Rota `/admin` protegida com tela de login e tratamento para usuario nao cadastrado.

## Proximos passos recomendados

- Trocar os produtos demo por dados reais.
- Conectar login real e permissao administrativa.
- Ajustar textos, imagens e links oficiais da atletica.
