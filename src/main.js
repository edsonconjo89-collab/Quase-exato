import { QUESTIONS } from './data/questions.js';
import {
  ANSWER_TIME_SECONDS,
  QUESTIONS_PER_GAME,
  REVEAL_TIME_SECONDS,
  calculateScore,
  parseEstimate,
  selectQuestions,
} from './game/rules.js';

const elements = {
  home: document.querySelector('#home-screen'),
  game: document.querySelector('#game-screen'),
  reveal: document.querySelector('#reveal-screen'),
  final: document.querySelector('#final-screen'),
  startForm: document.querySelector('#start-form'),
  nickname: document.querySelector('#nickname'),
  nicknameError: document.querySelector('#nickname-error'),
  exitGame: document.querySelector('#exit-game'),
  roundCounter: document.querySelector('#round-counter'),
  progressBar: document.querySelector('#progress-bar'),
  questionCategory: document.querySelector('#question-category'),
  questionTitle: document.querySelector('#question-title'),
  questionUnit: document.querySelector('#question-unit'),
  timerValue: document.querySelector('#timer-value'),
  timerBar: document.querySelector('#timer-bar'),
  answerForm: document.querySelector('#answer-form'),
  estimateInput: document.querySelector('#estimate-input'),
  answerError: document.querySelector('#answer-error'),
  submitAnswer: document.querySelector('#submit-answer'),
  submittedMessage: document.querySelector('#submitted-message'),
  revealRound: document.querySelector('#reveal-round'),
  revealQuestion: document.querySelector('#reveal-question'),
  correctAnswer: document.querySelector('#correct-answer'),
  correctUnit: document.querySelector('#correct-unit'),
  yourEstimate: document.querySelector('#your-estimate'),
  yourDifference: document.querySelector('#your-difference'),
  earnedPoints: document.querySelector('#earned-points'),
  nextRoundNote: document.querySelector('#next-round-note'),
  finalNickname: document.querySelector('#final-nickname'),
  finalScore: document.querySelector('#final-score'),
  finalResultsList: document.querySelector('#final-results-list'),
  playAgain: document.querySelector('#play-again'),
  backHome: document.querySelector('#back-home'),
};

const state = {
  nickname: '',
  questions: [],
  results: [],
  roundIndex: 0,
  phase: 'home',
  estimate: null,
  answerDeadline: null,
  timerIntervalId: null,
  revealTimeoutId: null,
};

function showScreen(screenName) {
  const screens = {
    home: elements.home,
    game: elements.game,
    reveal: elements.reveal,
    final: elements.final,
  };

  for (const [name, screen] of Object.entries(screens)) {
    screen.hidden = name !== screenName;
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-PT', {
    maximumFractionDigits: 3,
  }).format(value);
}

function formatPoints(value) {
  return new Intl.NumberFormat('pt-PT').format(value);
}

function clearClocks() {
  if (state.timerIntervalId !== null) {
    window.clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }

  if (state.revealTimeoutId !== null) {
    window.clearTimeout(state.revealTimeoutId);
    state.revealTimeoutId = null;
  }
}

function resetRoundInterface() {
  elements.answerForm.hidden = false;
  elements.estimateInput.disabled = false;
  elements.submitAnswer.disabled = false;
  elements.estimateInput.value = '';
  elements.answerError.textContent = '';
  elements.submittedMessage.hidden = true;
}

function validateNickname(rawNickname) {
  const nickname = rawNickname.trim().replace(/\s+/g, ' ');
  if (nickname.length < 2 || nickname.length > 16) return null;
  return nickname;
}

function startGame() {
  clearClocks();
  state.questions = selectQuestions(QUESTIONS, QUESTIONS_PER_GAME);
  state.results = [];
  state.roundIndex = 0;
  state.estimate = null;
  state.phase = 'answering';
  showQuestion();
}

function showQuestion() {
  const question = state.questions[state.roundIndex];
  state.phase = 'answering';
  state.estimate = null;
  state.answerDeadline = Date.now() + ANSWER_TIME_SECONDS * 1000;

  resetRoundInterface();
  showScreen('game');

  elements.roundCounter.textContent = `PERGUNTA ${state.roundIndex + 1}/${QUESTIONS_PER_GAME}`;
  elements.progressBar.style.width = `${(state.roundIndex / QUESTIONS_PER_GAME) * 100}%`;
  elements.questionCategory.textContent = question.category;
  elements.questionTitle.textContent = question.prompt;
  elements.questionUnit.textContent = `Unidade: ${question.unit}`;
  elements.timerBar.style.width = '100%';
  elements.timerBar.classList.remove('timer-warning');

  updateAnswerTimer();
  state.timerIntervalId = window.setInterval(updateAnswerTimer, 100);
}

function updateAnswerTimer() {
  if (state.phase !== 'answering') return;

  const millisecondsLeft = Math.max(0, state.answerDeadline - Date.now());
  const secondsLeft = Math.ceil(millisecondsLeft / 1000);
  const percentageLeft = (millisecondsLeft / (ANSWER_TIME_SECONDS * 1000)) * 100;

  elements.timerValue.textContent = `${secondsLeft}s`;
  elements.timerBar.style.width = `${percentageLeft}%`;
  elements.timerBar.classList.toggle('timer-warning', secondsLeft <= 5);

  if (millisecondsLeft <= 0) {
    beginReveal();
  }
}

function submitEstimate(event) {
  event.preventDefault();
  if (state.phase !== 'answering' || state.estimate !== null) return;

  // A verificação do prazo é feita novamente no momento da submissão.
  if (Date.now() >= state.answerDeadline) {
    beginReveal();
    return;
  }

  const estimate = parseEstimate(elements.estimateInput.value);
  if (estimate === null) {
    elements.answerError.textContent = 'Introduz um número válido, sem valores negativos e com até duas casas decimais.';
    elements.estimateInput.focus();
    return;
  }

  state.estimate = estimate;
  elements.estimateInput.disabled = true;
  elements.submitAnswer.disabled = true;
  elements.submittedMessage.hidden = false;
  elements.answerError.textContent = '';
}

function beginReveal() {
  if (state.phase !== 'answering') return;

  state.phase = 'revealing';
  if (state.timerIntervalId !== null) {
    window.clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }

  const question = state.questions[state.roundIndex];
  const score = state.estimate === null ? 0 : calculateScore(state.estimate, question.correctAnswer);
  const difference = state.estimate === null
    ? null
    : Math.abs(state.estimate - question.correctAnswer);

  const result = {
    questionId: question.id,
    prompt: question.prompt,
    correctAnswer: question.correctAnswer,
    unit: question.unit,
    estimate: state.estimate,
    difference,
    score,
  };

  state.results.push(result);
  renderReveal(result);

  state.revealTimeoutId = window.setTimeout(advanceAfterReveal, REVEAL_TIME_SECONDS * 1000);
}

function renderReveal(result) {
  showScreen('reveal');
  elements.revealRound.textContent = String(state.roundIndex + 1);
  elements.revealQuestion.textContent = result.prompt;
  elements.correctAnswer.textContent = formatNumber(result.correctAnswer);
  elements.correctUnit.textContent = result.unit;
  elements.yourEstimate.textContent = result.estimate === null ? 'Sem resposta' : formatNumber(result.estimate);
  elements.yourDifference.textContent = result.difference === null ? '—' : formatNumber(result.difference);
  elements.earnedPoints.textContent = formatPoints(result.score);
  elements.nextRoundNote.textContent = state.roundIndex + 1 < QUESTIONS_PER_GAME
    ? `Próxima pergunta em ${REVEAL_TIME_SECONDS} segundos…`
    : `Resultado final em ${REVEAL_TIME_SECONDS} segundos…`;
}

function advanceAfterReveal() {
  state.revealTimeoutId = null;
  if (state.phase !== 'revealing') return;

  state.roundIndex += 1;
  if (state.roundIndex >= QUESTIONS_PER_GAME) {
    showFinalResults();
    return;
  }

  showQuestion();
}

function showFinalResults() {
  state.phase = 'finished';
  clearClocks();
  showScreen('final');

  const totalScore = state.results.reduce((total, result) => total + result.score, 0);
  elements.finalNickname.textContent = state.nickname;
  elements.finalScore.textContent = formatPoints(totalScore);
  elements.finalResultsList.replaceChildren();

  state.results.forEach((result, index) => {
    const row = document.createElement('div');
    row.className = 'final-result-row';

    const title = document.createElement('span');
    title.className = 'final-result-title';
    title.textContent = `Pergunta ${index + 1}`;

    const detail = document.createElement('span');
    detail.className = 'final-result-detail';
    detail.textContent = result.estimate === null
      ? 'Sem resposta'
      : `Estimativa: ${formatNumber(result.estimate)}`;

    const points = document.createElement('strong');
    points.className = 'final-result-points';
    points.textContent = `${formatPoints(result.score)} pts`;

    row.append(title, detail, points);
    elements.finalResultsList.append(row);
  });
}

function returnHome() {
  clearClocks();
  state.phase = 'home';
  state.questions = [];
  state.results = [];
  state.estimate = null;
  showScreen('home');
}

function handleStart(event) {
  event.preventDefault();
  const nickname = validateNickname(elements.nickname.value);

  if (!nickname) {
    elements.nicknameError.textContent = 'O nome deve ter entre 2 e 16 caracteres.';
    elements.nickname.focus();
    return;
  }

  elements.nicknameError.textContent = '';
  state.nickname = nickname;
  startGame();
}

function handleExit() {
  const shouldExit = window.confirm('Queres mesmo sair desta partida? O progresso atual será perdido.');
  if (shouldExit) returnHome();
}

function handlePlayAgain() {
  startGame();
}

function initialize() {
  elements.startForm.addEventListener('submit', handleStart);
  elements.answerForm.addEventListener('submit', submitEstimate);
  elements.exitGame.addEventListener('click', handleExit);
  elements.playAgain.addEventListener('click', handlePlayAgain);
  elements.backHome.addEventListener('click', returnHome);

  elements.nickname.addEventListener('input', () => {
    elements.nicknameError.textContent = '';
  });

  elements.estimateInput.addEventListener('input', () => {
    elements.answerError.textContent = '';
  });

  // Proteção simples para não deixar temporizadores ativos ao sair da página.
  window.addEventListener('pagehide', clearClocks);

  showScreen('home');
}

initialize();
