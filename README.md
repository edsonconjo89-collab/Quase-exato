# Quase Exato

Jogo web mobile-first de estimativas numéricas. O jogador recebe cinco perguntas, dispõe de vinte segundos para estimar cada resposta e descobre a solução e a pontuação após a revelação.

A interface usa HTML, CSS e JavaScript ES Modules com Vite. A identidade anónima está integrada com Supabase através do SDK oficial; o motor individual permanece local nesta fase e nenhuma lógica autoritativa de pontuação é simulada no frontend.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm
- Navegador moderno
- Projeto Supabase com Anonymous Sign-Ins ativado

## Instalação

```bash
npm install
```

## Configuração do Supabase

Copia `.env.example` para `.env.local` e preenche apenas os valores públicos do projeto:

```env
VITE_SUPABASE_URL=https://o-teu-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

A chave `service_role` nunca deve ser colocada numa variável `VITE_`, no frontend ou no GitHub. O `.env.local` está excluído pelo `.gitignore`.

No painel Supabase, ativa **Authentication → Anonymous Sign-Ins**. A aplicação recupera uma sessão anónima existente ou cria uma nova antes de desbloquear o início do jogo.

## Desenvolvimento

```bash
npm run dev
```

O servidor Vite fica normalmente disponível em `http://localhost:5173`.

## Testes e build

```bash
npm test
npm run build
npm run preview
```

## Redesign UI/UX

A branch `feat/ui-redesign-mvp` contém o redesign visual mobile-first dos seis ecrãs previstos: início, entrada/início do modo individual, pergunta, revelação e resultados. O redesign introduz uma identidade editorial/arcade própria, tipografia com hierarquia reforçada, componentes de toque maiores, estados visuais mais claros e melhor composição em ecrãs verticais.

O redesign não altera as regras de jogo, a fórmula de pontuação, os temporizadores, o fluxo individual ou a autenticação Supabase.

## Estado do projeto

- [x] Vite e JavaScript modular
- [x] Supabase Anonymous Auth integrado
- [x] Sessão anónima recuperada ou criada automaticamente
- [x] Motor individual local com cinco perguntas e revelação
- [x] Redesign visual mobile-first
- [x] Testes automatizados das regras
- [ ] Persistência server-side da partida
- [ ] Salas multiplayer privadas
- [ ] Realtime e cálculo autoritativo no backend
- [ ] Deploy de produção
