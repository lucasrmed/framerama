# Filme Frame Game

Um jogo de adivinhação de filmes baseado em frames/imagens de filmes populares. Teste seu conhecimento cinematográfico!

## Sobre o Projeto

Filme Frame Game é uma aplicação web desenvolvida com Next.js que desafia os jogadores a identificar filmes a partir de imagens. O jogo começa com uma imagem borrada e, a cada tentativa incorreta, a imagem se torna mais clara, aumentando a chance de acerto mas reduzindo a pontuação possível.

## Funcionalidades

- **Níveis de Dificuldade Dinâmicos**: As imagens começam muito borradas e vão ficando mais nítidas a cada tentativa incorreta.
- **Sistema de Pontuação**: Ganhe mais pontos por adivinhar filmes com imagens mais borradas.
- **Histórico de Palpites**: Acompanhe seus acertos e erros no histórico de palpites.
- **Estatísticas Detalhadas**: Veja sua taxa de acerto, sequência atual, pontuação total e mais.
- **Autocompletar na Busca**: Receba sugestões de nomes de filmes enquanto digita.
- **Armazenamento Local**: Seu progresso é salvo localmente, então você pode continuar de onde parou.

## Tecnologias

- [Next.js](https://nextjs.org/) - Framework React
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI reutilizáveis
- [TMDb API](https://www.themoviedb.org/documentation/api) - API para dados de filmes

## Configuração do Projeto

### Pré-requisitos

- Node.js 18.0.0 ou superior
- Chave de API do TMDb

### Configuração de Ambiente

1. Clone o repositório
2. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`
3. Crie um arquivo `.env.local` na raiz do projeto e adicione sua chave da API TMDb:
   \`\`\`
   TMDB_API_KEY=sua_chave_api_aqui
   \`\`\`

### Executando o Projeto

\`\`\`bash
npm run dev
\`\`\`

Acesse `http://localhost:3000` para jogar.

## Como Jogar

1. O jogo mostrará uma imagem borrada de um filme.
2. Digite o nome do filme no campo de busca e clique em "Adivinhar" ou pressione Enter.
3. Se errar, a imagem ficará menos borrada, dando mais uma chance.
4. Se acertar, você ganhará pontos baseados no nível de dificuldade atual.
5. Após acertar ou esgotar todas as tentativas, detalhes do filme serão mostrados.
6. Clique em "Próximo Filme" para continuar jogando.

## Estrutura do Projeto

- `/app/page.tsx` - Página principal do jogo
- `/app/components/` - Componentes React reutilizáveis
- `/app/hooks/` - Hooks personalizados para lógica reutilizável
- `/app/api/` - Rotas da API para interagir com a TMDb API
- `/app/utils/` - Funções utilitárias

## Créditos

Este projeto utiliza dados da API do TMDb (The Movie Database) mas não é endossado ou certificado pelo TMDb.
