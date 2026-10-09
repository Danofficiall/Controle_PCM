# FleetOps PCM — Frontend demonstrativo

Este projeto contém uma interface inicial do FleetOps PCM desenvolvida com HTML5, CSS3 e JavaScript puro.

## Como executar no Visual Studio Code

1. Extraia a pasta `fleetops-pcm-frontend`.
2. Abra a pasta no Visual Studio Code.
3. Instale a extensão **Live Server** (opcional, mas recomendada).
4. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.
5. Navegue pelas abas e cadastre registros de teste.

Também é possível abrir `index.html` diretamente no navegador, mas o Live Server oferece uma experiência de desenvolvimento melhor.

## Organização

- `index.html`: estrutura semântica da interface e pontos de montagem.
- `css/styles.css`: cores, layout, responsividade, tabelas, formulários e componentes.
- `js/app.js`: navegação, módulos, validação básica, CRUD demonstrativo, filtros, exportação CSV e parâmetros.

## Funcionalidades desta versão

- Painel inicial com indicadores.
- Abas independentes para os módulos operacionais.
- Formulários dinâmicos de criação e edição.
- Pesquisa por texto e exportação CSV.
- Parâmetros configuráveis para tipos de frota, status, responsáveis e fornecedores.
- Bloqueio de exclusão de frota quando houver registros vinculados.
- Persistência local por `localStorage`.
- Identidade visual corporativa em azul-marinho (`#102F50`), amarelo (`#FFC928`), branco (`#FFFFFF`) e cinza-claro (`#EDF2F7`).
- Upload de imagens institucionais no cabeçalho e rodapé, com validação de tipo e limite de 2 MB; imagens salvas localmente no navegador atual.

## Limitações críticas

**Esta é uma demonstração de frontend, não um sistema profissional multiusuário pronto para produção.**

Os dados e as imagens institucionais ficam no navegador atual e não são compartilhados entre usuários ou computadores. A tela de usuários é apenas demonstrativa. Não existe autenticação, autorização real, auditoria centralizada ou conexão com PostgreSQL nesta versão.

Para transformar em sistema profissional:
1. Criar a API backend com FastAPI.
2. Conectar PostgreSQL e implementar migrações Alembic.
3. Implementar autenticação e permissões no servidor.
4. Migrar as operações de leitura e gravação do `localStorage` para endpoints da API.
5. Implementar auditoria, testes, backups, HTTPS e implantação controlada.

Não inserir informações operacionais confidenciais ou dados pessoais reais nesta versão.
