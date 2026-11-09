# Quase Exato — Relatório técnico da implementação experimental

**Versão do protótipo:** 0.1.0  
**Data do relatório:** 9 de novembro de 2026  
**Estado:** Protótipo experimental — sujeito a auditoria independente e validação manual  
**Referência de design:** GDD — Quase Exato, versão 1.0, aprovado em 8 de novembro de 2026.

## 1. Objetivo e âmbito

Este relatório descreve o código produzido para a primeira etapa do Quase Exato. A implementação cobre apenas uma experiência local do modo individual, para experimentar o ciclo de perguntas, temporização, submissão e pontuação.

Este protótipo não é o MVP completo, não é uma versão multiplayer e não está ligado a qualquer backend. O GDD aprovado continua a ser a referência funcional. O protótipo não altera nem substitui as decisões do GDD.

## 2. GDD de referência

O documento de referência é o **Game Design Document — QUASE EXATO, versão 1.0**, aprovado em 8 de novembro de 2026. O GDD integral permanece no documento de design desta conversa.

Parâmetros da mecânica relevantes para esta implementação:

- Cinco perguntas por partida.
- Vinte segundos para responder a cada pergunta.
- Cinco segundos de revelação entre perguntas.
- Estimativas não negativas; resposta correta positiva.
- Inteiros e decimais com até duas casas, aceitando ponto ou vírgula.
- Uma submissão por pergunta.
- Ausência de resposta vale zero pontos.
- Pontuação máxima de 1000 por pergunta e 5000 por partida.
- Fórmula: `round(1000 * max(0, 1 - abs(E - R) / R))`.
- Seleção de perguntas sem repetição dentro da partida.

O GDD também prevê multiplayer privado, Supabase, identidade anónima, sincronização e um banco inicial de 60 perguntas verificadas. Esses elementos não foram implementados nesta etapa.

## 3. Estrutura dos ficheiros

```text
quase-exato/
├── .gitignore
├── README.md
├── index.html
├── package.json
├── docs/
│   └── RELATORIO_TECNICO_ETAPA_1.md
└── src/
    ├── main.js
    ├── styles.css
    ├── data/
    │   └── questions.js
    └── game/
        ├── rules.js
        └── rules.test.js
```

### Responsabilidade de cada ficheiro

| Ficheiro | Responsabilidade |
|---|---|
| `index.html` | Estrutura semântica dos ecrãs, formulários e elementos da interface. |
| `src/styles.css` | Estilos, disposição responsiva, estados visuais e adaptação a ecrãs pequenos. |
| `src/main.js` | Estado local da partida, navegação entre ecrãs, temporizadores, submissão, revelação e resultado final. |
| `src/data/questions.js` | Seis perguntas de demonstração e respetivos metadados de referência. |
| `src/game/rules.js` | Constantes da mecânica, validação/parsing da estimativa, cálculo de pontos e seleção aleatória sem repetição. |
| `src/game/rules.test.js` | Testes automatizados da lógica pura do jogo. |
| `package.json` | Metadados do projeto, scripts e dependência de desenvolvimento. |
| `README.md` | Requisitos, comandos de instalação/execução/testes e âmbito desta etapa. |
| `.gitignore` | Exclusões habituais de dependências e artefactos locais. |

## 4. Tecnologias e versões

| Tecnologia | Utilização | Versão/declaração disponível |
|---|---|---|
| HTML | Estrutura da aplicação | HTML5 |
| CSS | Apresentação responsiva | CSS nativo, sem framework |
| JavaScript | Lógica e interface | ES Modules; sem framework |
| Node.js | Execução dos testes e ferramentas | `v22.16.0` no ambiente onde os testes foram executados |
| npm | Gestão de dependências e scripts | `10.9.0` no ambiente de teste |
| Vite | Servidor de desenvolvimento e build | `^8.3.0` declarado em `package.json`; versão efetivamente instalada não confirmada |
| Node Test Runner | Testes automatizados | `node:test`, integrado no Node.js |

**Nota de reprodutibilidade:** não existe `package-lock.json` nesta entrega. Assim, a versão exata resolvida de Vite e das dependências transitivas não está congelada. O intervalo declarado é `^8.3.0`. Não se deve afirmar uma versão instalada exata sem instalar dependências e verificar `npm ls vite`.

Scripts definidos:

- `npm run dev` — inicia Vite com acesso pela rede local (`--host 0.0.0.0`).
- `npm run build` — solicita a compilação de produção.
- `npm run preview` — serve localmente a compilação produzida.
- `npm test` — executa os testes através de `node --test`.

## 5. Funcionalidades implementadas

1. Ecrã inicial com campo de nome.
2. Validação do nome entre 2 e 16 caracteres, com normalização de espaços consecutivos.
3. Início de uma partida individual local.
4. Seleção aleatória de cinco perguntas, sem repetição dentro da partida.
5. Apresentação da categoria, pergunta e unidade.
6. Temporizador visual de 20 segundos, calculado localmente a partir de um prazo (`Date.now()`).
7. Aceitação de números inteiros e decimais, ponto ou vírgula, até duas casas decimais.
8. Rejeição de entrada vazia, negativa, textual, notação científica e mais de duas casas decimais.
9. Uma submissão por pergunta; após submissão, o campo e o botão são bloqueados.
10. Ausência de resposta contabilizada como zero pontos.
11. Revelação da resposta correta, estimativa, diferença absoluta e pontos durante cinco segundos.
12. Cálculo local de pontuação segundo a fórmula do GDD.
13. Resultado final com pontuação total e detalhe das cinco rondas.
14. Ação para jogar novamente e ação para regressar ao início.
15. Interface responsiva orientada a ecrãs móveis.

## 6. Conteúdo de demonstração

O ficheiro `src/data/questions.js` contém seis perguntas temporárias. Cada registo inclui identificador, categoria, texto, unidade, resposta numérica, nome da fonte, URL e referência temporal/explicativa.

A seleção exige pelo menos cinco perguntas e escolhe cinco sem repetição. As seis perguntas atuais não equivalem ao banco de 60 perguntas verificadas previsto no GDD. A exatidão, atualidade, redação e adequação de cada pergunta ainda devem ser verificadas na auditoria de conteúdo.

## 7. Decisões técnicas tomadas

- Utilização de HTML, CSS e JavaScript nativos, sem React ou outro framework de interface.
- Utilização de Vite como ferramenta de desenvolvimento/build.
- Separação entre interface (`main.js`), regras (`rules.js`) e dados (`questions.js`).
- Uso de `node:test` para testar funções sem dependência do navegador.
- Uso do algoritmo Fisher–Yates para baralhar perguntas sem modificar o array original.
- Uso de prazo baseado em timestamp local para atualizar o temporizador, em vez de decrementar simplesmente um contador.
- Manutenção do estado da partida apenas em memória JavaScript; não há persistência.
- A pontuação é calculada no cliente nesta versão experimental.
- Não foram adicionados Supabase, autenticação, salas, Realtime, Cloudflare Pages ou GitHub como integrações executáveis nesta etapa.

## 8. Funcionalidades em falta face ao GDD

- Modo multiplayer privado para 2–6 jogadores.
- Criação e gestão de salas.
- Código de sala de seis caracteres e entrada por código/link.
- Sala de espera e gestão de participantes.
- Identidade/autenticação anónima.
- Backend autoritativo e cálculo seguro da pontuação.
- Base de dados e persistência.
- Sincronização em tempo real entre dispositivos.
- Reconexão e recuperação do estado da partida.
- Temporização controlada pelo servidor.
- Revelação das estimativas dos restantes participantes.
- Classificação multiplayer e tratamento de empates.
- Repetição de partida em sala.
- Partilha de convite e partilha de resultado.
- Banco inicial de pelo menos 60 perguntas verificadas.
- Políticas de segurança, autorização, RLS e proteção contra abuso.
- Publicação/hosting de produção.

## 9. Limitações conhecidas

1. **Apenas local e individual:** não há comunicação entre jogadores nem persistência remota.
2. **Cliente como autoridade:** o utilizador pode alterar estado ou pontuação através das ferramentas do navegador; não é seguro para competição online.
3. **Temporizador local:** depende do relógio e da execução do navegador; não oferece garantias de sincronização ou autoridade temporal.
4. **Sem recuperação de sessão:** atualizar ou fechar a página perde a partida em curso.
5. **Banco reduzido:** seis perguntas de demonstração, não o banco de lançamento.
6. **Sem testes automatizados de interface:** os testes existentes cobrem funções de regras, não interação real no navegador.
7. **Build ainda não confirmado:** a execução de `npm run build` não foi validada nesta auditoria documental; a instalação de dependências e a execução local pelo utilizador continuam pendentes.
8. **Dependências não congeladas:** não foi incluído `package-lock.json`.
9. **Compatibilidade visual não certificada:** a interface foi concebida para ser responsiva, mas ainda precisa de validação manual em dispositivos e navegadores reais.

## 10. Testes realizados e resultados

### Testes automatizados de regras

Executado em 9 de novembro de 2026 com Node.js `v22.16.0` e npm `10.9.0`:

| Teste | Resultado |
|---|---|
| Estimativa exata produz 1000 pontos | PASSOU |
| Erro relativo de 10% produz 900 pontos | PASSOU |
| Estimativas 50 e 150 para resposta 100 produzem 500 pontos | PASSOU |
| Pontuação não fica negativa | PASSOU |
| Zero é aceite como estimativa | PASSOU |
| Resposta correta igual a zero é rejeitada | PASSOU |
| Vírgula e ponto decimal são interpretados | PASSOU |
| Inteiros e zero são aceites | PASSOU |
| Entradas inválidas são rejeitadas | PASSOU |
| Cinco perguntas distintas são selecionadas sem alterar a lista original | PASSOU |
| Banco com menos de cinco perguntas é rejeitado | PASSOU |

**Resultado: 11 testes aprovados, 0 falhados.**

### Testes não realizados/não confirmados

- Execução manual completa no computador do utilizador: pendente.
- Teste em smartphone Android real: pendente.
- Teste em navegadores diferentes: pendente.
- Teste de instalação limpa (`npm install`): pendente no computador do utilizador.
- Build de produção (`npm run build`): não confirmado.
- Testes multiplayer, reconexão, segurança e carga: não aplicáveis ainda, pois essas partes não existem.

## 11. Estado de validação

O protótipo é adequado para uma **auditoria independente do código e validação manual inicial da mecânica local**. Não deve ser considerado MVP concluído nem estar preparado para lançamento público.

O próximo passo definido pelo responsável do projeto é exclusivamente:

1. Auditoria independente do código pelo Gemini.
2. Validação manual no computador do utilizador.
3. Registo dos problemas encontrados e respetiva avaliação.

**Não está autorizada a implementação de novas funcionalidades, a integração do Supabase ou o início de uma nova etapa até autorização explícita.**
