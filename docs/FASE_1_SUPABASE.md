# Fase 1 — Preparação e ligação ao Supabase

**Estado:** código preparado; validação com projeto remoto pendente das credenciais do projeto.

## Objetivo

Ligar o frontend existente a um projeto Supabase e obter uma identidade anónima antes de permitir iniciar o protótipo individual.

## Alterações realizadas

- Adicionada a dependência oficial `@supabase/supabase-js`.
- Criado `src/lib/supabase.js` para criar uma única instância do cliente Supabase a partir de variáveis Vite.
- Criado `src/auth/anonymous-auth.js` para recuperar a sessão persistida ou criar uma sessão anónima.
- Adicionado estado de ligação na página inicial, com mensagens de carregamento, sucesso e erro.
- O botão "Jogar sozinho" permanece bloqueado até existir uma sessão válida.
- Criado `.env.example`; `.env.local` permanece ignorado pelo Git.
- Atualizado o README com os passos de configuração.

## Variáveis necessárias

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

A chave `service_role` nunca deve ser colocada no frontend. As variáveis Vite são incorporadas no bundle público.

## Configuração no painel Supabase

1. Criar um projeto.
2. Ativar **Anonymous Sign-Ins** em Authentication.
3. Copiar Project URL e Publishable key para `.env.local`.
4. Reiniciar o servidor Vite depois de alterar variáveis de ambiente.

## Testes de aceitação

- Sem `.env.local`, a aplicação informa que falta configuração e não inicia a partida.
- Com as variáveis válidas e Anonymous Sign-Ins ativo, a aplicação obtém uma sessão anónima.
- Ao recarregar a página, a sessão anterior é recuperada sem criar outro utilizador anónimo.
- Se o serviço rejeitar autenticação, a aplicação apresenta erro e permite tentar novamente.
- Nenhuma chave privilegiada é exposta ou registada.

## Limite deliberado desta fase

A autenticação não significa que a partida já esteja guardada no Supabase. O motor individual continua local até à implementação do motor server-side numa fase posterior.

## Verificação realizada nesta entrega

- Node.js: `v22.16.0`.
- npm: `10.9.2`.
- `npm test`: 11 testes aprovados, 0 falhados.
- `node --check`: os ficheiros JavaScript alterados passaram a verificação sintática.
- A integridade do ZIP de entrega foi verificada.
- A instalação de `@supabase/supabase-js` e Vite não pôde ser executada neste ambiente porque a resolução DNS de `registry.npmjs.org` falhou. Por esse motivo, não foi gerado `package-lock.json` e `npm run build` ainda não foi validado.
- Não foi possível testar autenticação remota sem o URL e a Publishable key de um projeto Supabase real.

