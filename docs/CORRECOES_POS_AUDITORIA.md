# Directiva 02 — Correcções pós-auditoria independente

## A. Identificação

- **Projecto:** Quase Exato
- **Branch:** `feat/ui-redesign-mvp`
- **Commit inicial:** `ec9de924e5f65aeb7087a4ffcdd6950b764e601a`
- **Novo commit:** `fix: address independent UI audit findings` — o hash exacto é confirmado no `git log` e na entrega final.
- **Branch `main`:** não modificada.
- **Merge/deploy:** não realizados.

A implementação foi iniciada apenas depois de confirmar que a branch estava limpa, que o `HEAD` correspondia ao commit de referência e que a branch remota correspondia ao mesmo commit.

## B. Matriz de correcções

### A1 — Legibilidade e contraste

- **Problema original:** havia textos de 8–11 px e relações de contraste insuficientes em textos secundários.
- **Correcção:** a interface normal passou a utilizar no mínimo 12 px; `--muted`, `--ink-soft`, mensagens de ajuda, notas, resultados e estados foram ajustados para tons mais escuros, preservando violeta/lima/coral.
- **Ficheiros:** `src/styles.css`.
- **Estado:** **CORRIGIDO**.
- **Evidência:** verificação estática não encontrou `font-size` abaixo de 12 px. Cálculo WCAG das combinações principais: `--muted` sobre papel 6,06:1; `--muted` sobre fundo quente 5,75:1; `--ink-soft` sobre papel 10,06:1; branco sobre violeta 5,37:1; sucesso sobre fundo verde 5,78:1; erro sobre papel 5,02:1.

### A2 — Toolchain Vite 7

- **Problema original:** Vite 8 tinha sido substituído por Vite 7 sem justificação documental.
- **Correcção:** Vite 7.3.8 foi mantido, porque Vite 8 apresentou `Illegal instruction` no ambiente de desenvolvimento utilizado. A razão foi documentada no `README.md`; `package.json` e `package-lock.json` continuam coerentes.
- **Ficheiros:** `README.md`, `package.json`, `package-lock.json`.
- **Estado:** **CORRIGIDO**.
- **Evidência:** `npm ci`, `npm test` e `npm run build` executados com sucesso.

### A3 — Autenticação Supabase

- **Problema original:** o jogo não deve iniciar sem autenticação pronta.
- **Correcção:** a autenticação anónima, recuperação de sessão, tratamento de erros e retry foram preservados. O botão continua bloqueado até a autenticação ficar pronta. Não foi criado modo offline/local alternativo.
- **Ficheiros:** `src/main.js`, `src/auth/anonymous-auth.js`, `src/lib/supabase.js`.
- **Estado:** **CORRIGIDO**.
- **Evidência:** o fluxo continua a chamar `getSession()` antes de `signInAnonymously()`; o cliente mantém `persistSession` e `autoRefreshToken`. A execução remota contra um projecto Supabase real não foi realizada porque não havia credenciais configuradas no ambiente.

### A4 — Mensagens técnicas na interface

- **Problema original:** a interface expunha Supabase, `.env.local` e detalhes internos.
- **Correcção:** as mensagens visíveis passaram a ser naturais: “A preparar a tua entrada…”, “Tudo pronto. Podes começar.” e “Não foi possível preparar o jogo. Verifica a ligação e tenta novamente.” Os detalhes técnicos permanecem na consola através de `console.error`.
- **Ficheiros:** `index.html`, `src/main.js`.
- **Estado:** **CORRIGIDO**.
- **Evidência:** pesquisa de termos técnicos na UI não encontrou ocorrências; os identificadores internos de código permanecem apenas no módulo de integração.

### A5 — Capturas fiéis ao código real

- **Problema original:** as capturas anteriores fabricavam estados através de alteração do DOM e continham dados que não correspondiam ao código real.
- **Correcção:** nesta revisão não foram fabricados estados de pergunta, revelação ou resultados. Foram capturados apenas estados que a aplicação real alcança no ambiente disponível.
- **Ficheiros:** documentação e pacote de validação externo; nenhum estado foi injectado no código.
- **Estado:** **PARCIAL — limitação de ambiente**.
- **Evidência:** foram produzidas capturas reais de início/erro de configuração em 360×800, 390×844 e 1280×900. As capturas de pergunta, revelação, resultados e desktop com partida não puderam ser produzidas porque o ambiente não tem `.env.local` nem acesso autenticado a um projecto Supabase. Não foram simuladas.

### A6 — Fontes e desempenho em redes móveis

- **Problema original:** `@import` do Google Fonts introduzia dependência externa e possível bloqueio de renderização.
- **Correcção:** o `@import` foi removido. A interface utiliza pilhas locais de sistema para display e monospace, sem dependências, downloads ou ficheiros de fonte adicionais. A decisão está documentada no `README.md`.
- **Ficheiros:** `src/styles.css`, `README.md`.
- **Estado:** **CORRIGIDO — alternativa simples aplicada**.
- **Evidência:** pesquisa do CSS não encontrou `@import` nem `fonts.googleapis.com`.

### A7 — Foco e acessibilidade

- **Problema original:** mudança de ecrã sem gestão de foco, revelação/resultados sem anúncio adequado e indicadores de foco insuficientes.
- **Correcção:** `showScreen()` foca o título do novo ecrã; perguntas focam o campo de estimativa; revelação e resultados têm regiões `aria-live`; títulos de ecrã têm destinos de foco; botões, links e inputs têm `:focus-visible`; o diálogo de saída é não bloqueante e acessível.
- **Ficheiros:** `index.html`, `src/main.js`, `src/styles.css`.
- **Estado:** **CORRIGIDO**.
- **Evidência:** inspecção de sintaxe e markup concluída; os títulos possuem `tabindex="-1"`, os formulários têm mensagens associadas e os estados de revelação/final têm `aria-live="polite"`.

## A8 — Correcções adicionais

| Item | Correcção | Estado |
|---|---|---|
| 3.1 Espaçamento do contador | Contador mantido como `PERGUNTA 1/5`, sem espaço indevido. | **CORRIGIDO** |
| 3.2 Temporizador | O `s` do valor não é transformado em maiúscula; apenas o rótulo recebe capitalização. | **CORRIGIDO** |
| 3.3 Artefacto Manus | `public/manus-routes.json` removido; após build, não existe em `dist`. | **CORRIGIDO** |
| 3.4 Link sem destino | `href="#inicio"` substituído por `href="/"`. | **CORRIGIDO** |
| 3.5 Mensagem numérica | Mensagem explica que não são permitidos espaços e dá exemplos válidos com ponto/vírgula. | **CORRIGIDO** |
| 3.6 Validação nativa | `novalidate` aplicado aos formulários; a validação manual existente cobre nome e estimativa. | **CORRIGIDO** |
| 3.7 Saída da partida | `window.confirm()` substituído por `<dialog>` não bloqueante; o prazo absoluto continua a decorrer. | **CORRIGIDO** |
| 3.8 bfcache | `pagehide` limpa apenas handles; `pageshow.persisted` reconstrói os temporizadores a partir dos prazos absolutos. | **CORRIGIDO** |
| 3.9 Favicon | Adicionado `public/favicon.svg` coerente com a identidade. | **CORRIGIDO** |
| 3.10 `detectSessionInUrl` | Opção removida do cliente Supabase, pois não há fluxo OAuth. | **CORRIGIDO** |
| 3.11 Pergunta demonstrativa | A pergunta de conversão exacta continua nos dados temporários; não foi inventada uma substituição sem investigação adicional. | **NÃO CORRIGIDO — pendente documentado** |

## C. Testes

Comandos executados nesta revisão:

- `npm ci` — executado sem erros na validação da entrega base.
- `npm test` — 11 testes aprovados, 0 falhados.
- `npm audit --audit-level=high` — 0 vulnerabilidades encontradas.
- `npm run build` — concluído com Vite 7.3.8.
- `node --check src/main.js` — concluído.
- `node --check src/auth/anonymous-auth.js` — concluído.
- `node --check src/lib/supabase.js` — concluído.
- `git diff --check` — passou.
- Verificação package/lock — dependências e versões coerentes.
- Verificação de referências `manus-routes.json` — nenhuma referência no código; ficheiro removido.
- Verificação de fontes externas — nenhum `@import` ou Google Fonts no CSS.
- Verificação de segredos — nenhum `.env.local` versionado ou credencial real incluída.

Não foi possível testar uma sessão Supabase real, nem executar a partida autenticada, por falta de configuração/credenciais no ambiente. Essa limitação não foi contornada com mocks ou estados fabricados.

## D. Capturas reais

Produzidas através do Chromium contra a build real em preview local, sem alteração do DOM e sem injecção de dados:

- `360x800-inicio-erro-configuracao.png` — ecrã inicial com estado de erro de ligação/configuração.
- `390x844-inicio-erro-configuracao.png` — ecrã inicial com estado de erro de ligação/configuração.
- `desktop-inicio-erro-configuracao.png` — ecrã inicial com estado de erro de ligação/configuração em 1280×900.

Não foram produzidas capturas de pergunta, revelação, resultados ou pergunta desktop autenticada, porque o fluxo real ficou correctamente bloqueado pela autenticação indisponível. Essas capturas exigem configuração Supabase e devem ser feitas numa segunda validação com ambiente configurado.

## E. Pendências

- Validar autenticação anónima real com um projecto Supabase de teste configurado.
- Executar o fluxo completo autenticado em Android real, incluindo foco, teclado virtual, diálogo de saída e retorno por bfcache.
- Capturar os estados de pergunta, revelação e resultados através do fluxo real autenticado.
- Decidir, numa tarefa de conteúdo separada, se a pergunta exacta dos metros por quilómetro deve ser substituída.
- Fazer uma segunda auditoria independente, especialmente sobre leitores de ecrã e contraste em dispositivos reais.

## F. Declaração final

A branch está pronta para uma segunda auditoria independente das correcções implementadas, com a ressalva de que a autenticação Supabase e o fluxo completo de partida ainda precisam de validação num ambiente configurado. Não houve merge, deploy, migrations ou alterações à branch `main`.
