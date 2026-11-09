# Quase Exato — Auditoria independente do protótipo

**Data da auditoria:** 9 de novembro de 2026  
**Pacote analisado:** `quase-exato-prototipo-com-relatorio.zip`  
**Versão declarada:** `0.1.0`  
**Âmbito:** inspeção estática do código, execução de testes, build de produção e verificação HTTP básica.  
**Nota:** a auditoria foi realizada numa cópia extraída para análise. O ZIP original não foi modificado.

## 1. Conclusão executiva

O pacote entregue é um protótipo local funcional do modo individual. A mecânica principal — nome, seleção de cinco perguntas, temporização local, submissão única, revelação e pontuação — está implementada de forma simples e coerente, e os testes de regras passam.

O pacote **não é ainda um jogo multiplayer** e não contém a arquitetura multiplayer descrita no briefing. Não existem backend, salas, WebSockets, Workers, Durable Objects, SQLite, autenticação, persistência, sincronização ou testes de integração. A pontuação e o temporizador são controlados pelo navegador, pelo que esta versão não pode ser considerada segura para competição online.

**Decisão recomendada:** aceitar o protótipo como base de validação da mecânica individual, mas não iniciar a implementação multiplayer sem primeiro aprovar a arquitetura alvo e fechar as decisões de autoridade do servidor, modelo de sala, ciclo de vida da partida e armazenamento.

## 2. Conteúdo efetivamente entregue

Ficheiros principais encontrados:

- `index.html` — estrutura dos quatro ecrãs da aplicação.
- `src/main.js` — estado da partida e interação da interface.
- `src/game/rules.js` — constantes, parsing, pontuação e seleção de perguntas.
- `src/game/rules.test.js` — testes unitários da lógica pura.
- `src/data/questions.js` — seis perguntas temporárias.
- `src/styles.css` — estilos responsivos sem framework.
- `README.md` — instruções de execução e limites conhecidos.
- `docs/RELATORIO_TECNICO_ETAPA_1.md` — relatório da etapa experimental.
- `package.json` — scripts de desenvolvimento, build e testes.

O pacote original não contém `node_modules`, `package-lock.json`, configuração Vite explícita, configuração Cloudflare, código de Worker, Durable Object, schema SQLite, migrations, servidor WebSocket ou repositório `.git`. O `package-lock.json` presente na cópia de auditoria foi criado pelo comando `npm install` durante esta verificação; não fazia parte do ZIP original.

## 3. Funcionalidades implementadas e verificadas

### Interface e fluxo local

- Ecrã inicial com nome do jogador.
- Normalização de espaços consecutivos no nome.
- Validação do nome entre 2 e 16 caracteres.
- Início de partida individual local.
- Cinco perguntas por partida.
- Seleção aleatória sem repetição dentro da partida.
- Exibição de categoria, pergunta e unidade.
- Campo de estimativa com `inputmode="decimal"`.
- Aceitação de ponto ou vírgula decimal, até duas casas.
- Uma submissão por pergunta.
- Bloqueio do campo e botão após submissão.
- Expiração automática após 20 segundos.
- Revelação durante cinco segundos.
- Resultado final com pontuação e resumo das cinco rondas.
- Recomeço da partida e regresso ao início.
- Layout responsivo e preferência por movimento reduzido.

### Regras de jogo

As funções puras em `src/game/rules.js` implementam:

- `parseEstimate()` para validar estimativas não negativas.
- `calculateScore()` com a fórmula `round(1000 * max(0, 1 - abs(E - R) / R))`.
- `selectQuestions()` usando Fisher–Yates sobre uma cópia do array.
- Constantes de cinco perguntas, 20 segundos, cinco segundos de revelação e 1000 pontos máximos por pergunta.

## 4. Verificações executadas

### Dependências

```text
npm install
Resultado: concluído
Vulnerabilidades reportadas pelo npm: 0
Vite resolvido: 8.3.7
Node utilizado pelo ambiente: versão disponível no sandbox
```

### Testes automatizados

```text
npm test
11 testes aprovados
0 falhados
0 cancelados
```

Os testes cobrem:

- pontuação exata;
- erro relativo de 10%;
- simetria acima/abaixo da resposta;
- limite inferior de zero pontos;
- estimativa zero;
- rejeição de resposta correta zero;
- vírgula e ponto decimal;
- inteiros e zero;
- entradas inválidas;
- seleção sem repetição e sem mutação da lista original;
- banco com perguntas insuficientes.

### Build de produção

```text
npm run build
Resultado: concluído
7 módulos transformados
dist/index.html gerado
assets JavaScript e CSS gerados
```

### Verificação HTTP básica

Foi iniciado o servidor de preview do Vite e feita uma requisição HTTP à raiz. A resposta foi `200 OK` e o HTML continha o título `Quase Exato`, o botão `Jogar sozinho` e o asset JavaScript compilado.

Esta verificação confirma que o build serve HTML, mas **não substitui um teste de navegador real** nem valida todos os fluxos de interação.

## 5. Problemas identificados

### Críticos para multiplayer

#### P1 — Não existe backend nem multiplayer

Não há código ou configuração para Cloudflare Workers, Durable Objects, SQLite ou WebSockets. Também não há criação/entrada em salas, identidade de jogadores, lobby ou sincronização.

**Impacto:** o objetivo multiplayer ainda não começou tecnicamente. O protótipo só pode ser usado por um jogador no mesmo navegador.

#### P1 — O cliente é a autoridade da pontuação

`main.js` calcula a pontuação com `calculateScore()` no browser e guarda todos os resultados em memória.

**Impacto:** num cenário online, um jogador poderia alterar o estado, o relógio, a resposta, a pontuação ou a sequência da partida através das ferramentas do navegador. Não há qualquer garantia de integridade competitiva.

#### P1 — O temporizador é local

O prazo é calculado com `Date.now()` no cliente e atualizado por `setInterval()`.

**Impacto:** diferentes dispositivos não partilhariam uma referência temporal autoritativa; suspensões da aba, alterações no relógio e manipulação do JavaScript podem afetar o resultado. Para multiplayer, o servidor deve controlar o início e fim da ronda.

#### P1 — Não há recuperação de sessão

O estado existe apenas no objeto `state` em memória. `pagehide` apenas limpa temporizadores; não guarda nem recupera a partida.

**Impacto:** atualizar, fechar ou perder a ligação elimina o progresso. Não há base para reconexão ou reentrada numa sala.

### Importantes para o MVP

#### P2 — Banco de perguntas insuficiente

Existem apenas seis perguntas de demonstração para selecionar cinco. O próprio relatório indica que o GDD prevê pelo menos 60 perguntas verificadas.

**Impacto:** variedade muito reduzida, repetição entre partidas e risco de conteúdo insuficiente para uma experiência pública.

#### P2 — Ausência de testes de interface e de integração

Os 11 testes existentes cobrem apenas funções puras. Não há testes para temporizador, transições de ecrãs, submissão, expiração, recomeço, acessibilidade, build em navegador, WebSocket, reconexão ou concorrência.

**Impacto:** regressões na experiência podem passar sem deteção; o comportamento real do browser ainda não está certificado.

#### P2 — Sem lockfile no artefacto original

O `package.json` usa `"vite": "^8.3.0"` e o ZIP não traz `package-lock.json`.

**Impacto:** instalações futuras podem resolver versões transitivas diferentes. O build desta auditoria resolveu Vite 8.3.7, mas isso não era garantido pelo pacote entregue.

#### P2 — Sem controlo de versão no pacote

Não existe diretório `.git`, histórico, branches ou commits.

**Impacto:** não é possível reconstruir a evolução, comparar alterações ou aplicar uma estratégia de commits organizada a partir deste ZIP sem inicializar/importar um repositório.

### Menores / melhorias de qualidade

#### P3 — Barra de progresso visual não chega a 100% na última pergunta

`progressBar` usa `roundIndex / QUESTIONS_PER_GAME`; na quinta pergunta o valor é 80%. O resultado final aparece depois da revelação, por isso a barra não representa o fim da última ronda.

#### P3 — Validação de nome usa comprimento de string JavaScript

O limite usa `nickname.length`, que conta unidades UTF-16 e não necessariamente caracteres visuais. É um detalhe de baixa prioridade para nomes com emoji ou certos caracteres compostos.

#### P3 — Conteúdo não foi verificado independentemente nesta auditoria

As perguntas incluem fontes e URLs, mas esta auditoria concentrou-se no código e na execução local. A existência, atualidade, formulação e adequação editorial das seis perguntas ainda requerem revisão de conteúdo.

#### P3 — Não há estratégia explícita de acessibilidade para mudanças de ecrã

Existem labels, alguns `role="alert"` e `aria-live`, mas não há gestão explícita de foco quando muda o ecrã nem confirmação de navegação completa por teclado/leitor de ecrã.

## 6. Avaliação da arquitetura atual

### Aspetos positivos

- Separação razoável entre interface, regras e dados.
- Dependências mínimas.
- JavaScript nativo compatível com a arquitetura frontend prevista.
- Regras puras fáceis de testar e transferir para uma camada de servidor.
- Uso de timestamps para calcular o prazo local, melhor do que simplesmente decrementar um contador.
- Manipulação do DOM com `textContent` em vez de inserir conteúdo de pergunta com HTML arbitrário.
- Build pequeno e rápido.
- Interface responsiva sem framework adicional.

### Aspetos que não estão alinhados com o objetivo final

- O frontend atual não tem uma camada de transporte ou estado remoto.
- A lógica de partida está acoplada ao DOM em `main.js`.
- Não existe contrato de mensagens para WebSocket.
- Não existe máquina de estados autoritativa no servidor.
- Não existe modelo de dados para salas, jogadores, rondas, respostas ou resultados.
- Não existe estratégia para identidade anónima, autorização, reconexão ou idempotência.
- O desenho atual só contempla um jogador e não renderiza estados de lobby/classificação multiplayer.

A arquitetura local é adequada como protótipo de mecânica, mas insuficiente para o produto alvo. Não há fundamento no pacote para afirmar que a arquitetura Cloudflare + Durable Objects + SQLite já está implementada.

## 7. Funcionalidades em falta face ao objetivo multiplayer

1. Criação de sala privada.
2. Código ou link de convite.
3. Entrada numa sala existente.
4. Limite e gestão de 2–6 jogadores.
5. Nome/identidade anónima por jogador.
6. Lobby com presença e estado de pronto.
7. Dono/anfitrião e início autoritativo da partida.
8. Estado de partida persistente no servidor.
9. Banco de perguntas verificado e seleção controlada pelo servidor.
10. Broadcast de estado via WebSocket.
11. Temporizador baseado em prazos do servidor.
12. Aceitação de uma resposta por jogador e ronda.
13. Validação server-side de estimativas.
14. Cálculo server-side de pontuação.
15. Revelação sincronizada.
16. Classificação e desempates.
17. Desconexão, reconexão e recuperação de sessão.
18. Encerramento, expiração e limpeza de salas.
19. Proteção contra replay, respostas duplicadas e mensagens fora de ordem.
20. Limites de abuso/rate limiting e validação de payloads.
21. Persistência mínima e/ou histórico, conforme decisão de produto.
22. Testes de integração, concorrência, reconexão e carga.
23. Observabilidade, logging e tratamento de erros de produção.
24. Deploy e configuração de ambientes.

## 8. Plano recomendado por etapas

### Etapa 0 — Decisões e preparação

- Confirmar a arquitetura definitiva: Cloudflare Worker + Durable Object por sala + SQLite integrado.
- Definir o contrato de mensagens WebSocket e versões de payload.
- Definir estados da partida: `waiting`, `countdown`, `answering`, `revealing`, `finished`, `closed`.
- Definir regras para anfitrião, saída, reconexão e abandono.
- Inicializar Git e adicionar lockfile.
- Separar regras puras reutilizáveis entre testes e servidor.

### Etapa 1 — Núcleo de salas

- Implementar criação de sala com código seguro.
- Implementar entrada por código/link.
- Implementar identidade anónima e identificador de sessão.
- Implementar lobby, presença e remoção de jogadores desconectados.
- Implementar mensagens de erro e estados de ligação.

### Etapa 2 — Partida autoritativa

- Mover seleção da sequência de perguntas para o servidor.
- Guardar estado da sala e ronda no Durable Object.
- Controlar prazos com relógio do servidor.
- Validar uma única resposta por jogador/ronda.
- Calcular pontuação exclusivamente no servidor.
- Emitir snapshots de estado sem expor a resposta correta antes da revelação.

### Etapa 3 — Revelação e classificação

- Sincronizar revelação para todos os jogadores.
- Exibir respostas e diferenças conforme as regras aprovadas.
- Implementar classificação, empates e pontuação total.
- Implementar final da partida e opção de repetir na mesma sala.

### Etapa 4 — Persistência e robustez

- Definir schema SQLite e migrações.
- Guardar metadados necessários de sala/partida/resultados.
- Implementar reconexão e recuperação de snapshot.
- Tornar mensagens e comandos idempotentes.
- Adicionar expiração e limpeza de salas.

### Etapa 5 — Conteúdo e qualidade

- Expandir para pelo menos 60 perguntas verificadas.
- Rever fontes, unidades, idioma e ambiguidade.
- Adicionar testes de integração e testes de contrato.
- Validar mobile, teclado, leitor de ecrã e navegadores suportados.
- Executar testes de concorrência e cenários de perda/reentrada de ligação.

### Etapa 6 — Deploy controlado

- Configurar ambientes de desenvolvimento/staging/produção.
- Configurar segredos e observabilidade.
- Fazer deploy de staging.
- Realizar playtest com vários dispositivos.
- Só depois publicar produção.

## 9. Complexidade e riscos

| Área | Complexidade | Risco principal |
|---|---:|---|
| Criação/entrada em salas | Média | colisões, expiração e abuso de códigos |
| Lobby/presença | Média | estados divergentes e desconexões |
| Estado autoritativo da partida | Alta | condições de corrida e transições inválidas |
| Temporizadores sincronizados | Alta | drift, reconexão e mensagens atrasadas |
| Pontuação segura | Média | manipulação de payloads e duplicação de respostas |
| Reconexão | Alta | recuperar o jogador correto sem duplicar ações |
| SQLite/persistência | Média | schema, migrações e consistência |
| Conteúdo de perguntas | Média | precisão, fontes e ambiguidade |
| Testes multiplayer | Alta | concorrência, timing e reprodutibilidade |
| Deploy/observabilidade | Média | diagnóstico de falhas em produção |

O maior risco não é a fórmula de pontuação; é a sincronização correta da máquina de estados distribuída, sobretudo quando jogadores entram, saem ou reconectam durante uma ronda.

## 10. Recomendação de aprovação

A aprovação recomendada para avançar é limitada a uma próxima etapa de desenho técnico e implementação do núcleo multiplayer, mantendo o protótipo individual como referência visual e funcional.

Antes de alterar significativamente o projeto, devem ser aprovados explicitamente:

- contrato de mensagens WebSocket;
- modelo de estado da sala;
- política de reconexão;
- persistência necessária;
- regra de autoridade do servidor;
- política de encerramento/expiração das salas;
- fonte e processo de verificação das perguntas.

Não foram feitas alterações no projeto original e não foram implementadas funcionalidades novas nesta auditoria.
