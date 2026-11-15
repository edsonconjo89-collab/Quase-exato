import { QUESTIONS } from './data/questions.js';
import { ensureAnonymousSession } from './auth/anonymous-auth.js';
import { isSupabaseConfigured } from './lib/supabase.js';
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
  authStatus: document.querySelector('#auth-status'),
  authStatusText: document.querySelector('#auth-status-text'),
  retryAuth: document.querySelector('#retry-auth'),
  startButton: document.querySelector('#start-game'),
  exitGame: document.querySelector('#exit-game'),
  exitDialog: document.querySelector('#exit-dialog'),
  cancelExit: document.querySelector('#cancel-exit'),
  confirmExit: document.querySelector('#confirm-exit'),
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
  revealTitle: document.querySelector('#reveal-title'),
  revealRound: document.querySelector('#reveal-round'),
  revealQuestion: document.querySelector('#reveal-question'),
  correctAnswer: document.querySelector('#correct-answer'),
  correctUnit: document.querySelector('#correct-unit'),
  yourEstimate: document.querySelector('#your-estimate'),
  yourDifference: document.querySelector('#your-difference'),
  earnedPoints: document.querySelector('#earned-points'),
  nextRoundNote: document.querySelector('#next-round-note'),
  finalTitle: document.querySelector('#final-title'),
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
  revealDeadline: null,
  timerIntervalId: null,
  revealTimeoutId: null,
  authStatus: 'loading',
};

const screenFocusTargets = {
  home: () => elements.home.querySelector('[data-screen-title]'),
  game: () => elements.questionTitle,
  reveal: () => elements.revealTitle,
  final: () => elements.finalTitle,
};

function showScreen(screenName, { focus = true } = {}) {
  const screens = {
    home: elements.home,
    game: elements.game,
    reveal: elements.reveal,
    final: elements.final,
  };

  for (const [name, screen] of Object.entries(screens)) {
    screen.hidden = name !== screenName;
  }

  if (focus) {
    window.requestAnimationFrame(() => screenFocusTargets[screenName]?.()?.focus());
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

function clearClockHandles() {
  if (state.timerIntervalId !== null) {
    window.clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }

  if (state.revealTimeoutId !== null) {
    window.clearTimeout(state.revealTimeoutId);
    state.revealTimeoutId = null;
  }
}

function clearClocks() {
  clearClockHandles();
  state.answerDeadline = null;
  state.revealDeadline = null;
}

function scheduleRevealAdvance() {
  if (state.phase !== 'revealing' || state.revealDeadline === null) return;

  const millisecondsLeft = Math.max(0, state.revealDeadline - Date.now());
  if (millisecondsLeft === 0) {
    advanceAfterReveal();
    return;
  }

  state.revealTimeoutId = window.setTimeout(advanceAfterReveal, millisecondsLeft);
}

function restoreClocks() {
  clearClockHandles();

  if (state.phase === 'answering' && state.answerDeadline !== null) {
    updateAnswerTimer();
    if (state.phase === 'answering') {
      state.timerIntervalId = window.setInterval(updateAnswerTimer, 100);
    }
  }

  if (state.phase === 'revealing' && state.revealDeadline !== null) {
    scheduleRevealAdvance();
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
  state.revealDeadline = null;

  resetRoundInterface();
  showScreen('game', { focus: false });

  elements.roundCounter.textContent = `PERGUNTA ${state.roundIndex + 1}/${QUESTIONS_PER_GAME}`;
  elements.progressBar.style.width = `${(state.roundIndex / QUESTIONS_PER_GAME) * 100}%`;
  elements.questionCategory.textContent = question.category;
  elements.questionTitle.textContent = question.prompt;
  elements.questionUnit.textContent = `Unidade: ${question.unit}`;
  elements.timerBar.style.width = '100%';
  elements.timerBar.classList.remove('timer-warning');

  updateAnswerTimer();
  if (state.phase === 'answering') {
    state.timerIntervalId = window.setInterval(updateAnswerTimer, 100);
    window.requestAnimationFrame(() => elements.estimateInput.focus());
  }
}

function updateAnswerTimer() {
  if (state.phase !== 'answering' || state.answerDeadline === null) return;

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

  if (Date.now() >= state.answerDeadline) {
    beginReveal();
    return;
  }

  const estimate = parseEstimate(elements.estimateInput.value);
  if (estimate === null) {
    elements.answerError.textContent = 'Introdu um número sem espaços, como 300000, 300000.50 ou 300000,50.';
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
  clearClockHandles();
  state.answerDeadline = null;
  state.revealDeadline = Date.now() + REVEAL_TIME_SECONDS * 1000;

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
  scheduleRevealAdvance();
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
  state.revealDeadline = null;
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

async function handleStart(event) {
  event.preventDefault();
  const nickname = validateNickname(elements.nickname.value);

  if (!nickname) {
    elements.nicknameError.textContent = 'O nome deve ter entre 2 e 16 caracteres.';
    elements.nickname.focus();
    return;
  }

  elements.nicknameError.textContent = '';
  elements.startButton.disabled = true;

  try {
    await ensureAnonymousSession();
  } catch (error) {
    console.error('Não foi possível confirmar a sessão de jogo:', error);
    setAuthenticationStatus('error', 'Não foi possível preparar o jogo. Verifica a ligação e tenta novamente.');
    return;
  }

  setAuthenticationStatus('ready', 'Tudo pronto. Podes começar.');
  elements.startButton.disabled = false;
  state.nickname = nickname;
  startGame();
}

function setAuthenticationStatus(status, message) {
  state.authStatus = status;
  elements.authStatus.dataset.state = status;
  elements.authStatusText.textContent = message;
  elements.retryAuth.hidden = status !== 'error';
  elements.startButton.disabled = status !== 'ready';
}

async function initializeAnonymousAuthentication() {
  if (!isSupabaseConfigured) {
    setAuthenticationStatus('error', 'Não foi possível preparar o jogo. Verifica a ligação e tenta novamente.');
    return;
  }

  setAuthenticationStatus('loading', 'A preparar a tua entrada…');

  try {
    await ensureAnonymousSession();
    setAuthenticationStatus('ready', 'Tudo pronto. Podes começar.');
  } catch (error) {
    console.error('Falha ao preparar a entrada do jogador:', error);
    setAuthenticationStatus('error', 'Não foi possível preparar o jogo. Verifica a ligação e tenta novamente.');
  }
}

function openExitDialog() {
  if (typeof elements.exitDialog.showModal === 'function') {
    elements.exitDialog.showModal();
  }
}

function closeExitDialog() {
  if (elements.exitDialog.open) elements.exitDialog.close();
}

function handleExitConfirmation() {
  closeExitDialog();
  returnHome();
}

function handlePlayAgain() {
  startGame();
}

function initialize() {
  elements.startForm.addEventListener('submit', handleStart);
  elements.retryAuth.addEventListener('click', initializeAnonymousAuthentication);
  elements.answerForm.addEventListener('submit', submitEstimate);
  elements.exitGame.addEventListener('click', openExitDialog);
  elements.cancelExit.addEventListener('click', closeExitDialog);
  elements.confirmExit.addEventListener('click', handleExitConfirmation);
  elements.playAgain.addEventListener('click', handlePlayAgain);
  elements.backHome.addEventListener('click', returnHome);

  elements.nickname.addEventListener('input', () => {
    elements.nicknameError.textContent = '';
  });

  elements.estimateInput.addEventListener('input', () => {
    elements.answerError.textContent = '';
  });

  window.addEventListener('pagehide', clearClockHandles);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) restoreClocks();
  });

  showScreen('home');
  initializeAnonymousAuthentication();
}

initialize();
