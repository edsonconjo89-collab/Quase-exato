# Quase Exato

Jogo web de perguntas numéricas: estima a resposta, aproxima-te o mais possível e descobre quantos pontos conquistaste.

Esta baseline corresponde à versão **v0.1.0**, um protótipo experimental do modo individual local. O código preserva a mecânica atual e serve como ponto de partida auditado para o desenvolvimento futuro do modo multiplayer.

## Estado atual

A versão presente inclui:

- modo individual local;
- cinco perguntas por partida;
- seleção aleatória sem repetição dentro da partida;
- 20 segundos para responder a cada pergunta;
- respostas inteiras ou decimais com até duas casas;
- ponto ou vírgula como separador decimal;
- uma submissão por pergunta;
- cinco segundos de revelação;
- pontuação segundo a fórmula definida no GDD;
- resultado final e opção de jogar novamente;
- interface responsiva para ecrãs pequenos.

Esta versão **não inclui ainda multiplayer, salas, autenticação, persistência, WebSockets ou backend**. As seis perguntas presentes são conteúdo temporário de demonstração; não substituem o banco inicial de perguntas verificadas previsto para o produto.

## Tecnologias

- HTML5
- CSS nativo
- JavaScript com ES Modules
- Vite 8
- Node.js Test Runner (`node:test`)

A baseline não introduz frameworks de frontend nem dependências desnecessárias.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm
- navegador moderno

## Instalação

Na raiz do projeto:

```bash
npm install
```

O `package-lock.json` está incluído para reproduzir as dependências resolvidas.

## Desenvolvimento local

```bash
npm run dev
```

Abre o endereço indicado pelo Vite, normalmente `http://localhost:5173`.

Para permitir acesso a partir de outro dispositivo na mesma rede, o script já inicia o Vite com `--host 0.0.0.0`.

## Testes

Executa os testes automatizados da lógica de jogo:

```bash
npm test
```

A baseline auditada tem 11 testes aprovados, cobrindo a fórmula de pontuação, validação de estimativas e seleção de perguntas sem repetição.

## Build e preview de produção

```bash
npm run build
npm run preview
```

O comando `build` gera a pasta `dist/`. Os artefactos de build e as dependências instaladas são ignorados pelo Git.

## Estrutura

```text
.
├── docs/
│   ├── AUDITORIA_INDEPENDENTE_ETAPA_1.md
│   └── RELATORIO_TECNICO_ETAPA_1.md
├── src/
│   ├── data/questions.js
│   ├── game/rules.js
│   ├── game/rules.test.js
│   ├── main.js
│   └── styles.css
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## Regras preservadas

A pontuação de cada pergunta mantém a fórmula:

```text
round(1000 * max(0, 1 - abs(estimativa - resposta) / resposta))
```

A resposta correta deve ser positiva. As estimativas aceites são não negativas, com ponto ou vírgula decimal e até duas casas decimais. Uma pergunta sem resposta vale zero pontos.

## Documentação

- [`docs/RELATORIO_TECNICO_ETAPA_1.md`](docs/RELATORIO_TECNICO_ETAPA_1.md) — relatório técnico original do protótipo.
- [`docs/AUDITORIA_INDEPENDENTE_ETAPA_1.md`](docs/AUDITORIA_INDEPENDENTE_ETAPA_1.md) — auditoria independente, resultados de validação, problemas e plano recomendado.

## Próximas etapas

O desenvolvimento multiplayer deverá ser iniciado apenas após aprovação específica da arquitetura e do plano técnico. Entre os temas previstos estão salas privadas, sincronização em tempo real, estado autoritativo no servidor, reconexão, persistência, classificação e segurança contra manipulação de resultados.
