export const QUESTIONS_PER_GAME = 5;
export const ANSWER_TIME_SECONDS = 20;
export const REVEAL_TIME_SECONDS = 5;
export const MAX_POINTS_PER_QUESTION = 1000;
export const MAX_DECIMAL_PLACES = 2;

/**
 * Converte uma entrada do utilizador num número válido.
 * Aceita inteiros e decimais com ponto ou vírgula, até 2 casas decimais.
 * Devolve null quando a entrada é inválida.
 */
export function parseEstimate(rawValue) {
  if (typeof rawValue !== 'string') return null;

  const value = rawValue.trim();
  if (!value) return null;

  // Não permite negativos, separadores de milhares ou notação científica.
  const decimalPattern = new RegExp(`^\\d+(?:[.,]\\d{1,${MAX_DECIMAL_PLACES}})?$`);
  if (!decimalPattern.test(value)) return null;

  const parsed = Number(value.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  return parsed;
}

/**
 * Calcula a pontuação segundo o GDD.
 * A resposta correta tem de ser positiva.
 */
export function calculateScore(estimate, correctAnswer) {
  if (!Number.isFinite(estimate) || estimate < 0) {
    throw new TypeError('A estimativa deve ser um número finito não negativo.');
  }

  if (!Number.isFinite(correctAnswer) || correctAnswer <= 0) {
    throw new TypeError('A resposta correta deve ser um número finito positivo.');
  }

  const relativeError = Math.abs(estimate - correctAnswer) / correctAnswer;
  const rawScore = MAX_POINTS_PER_QUESTION * Math.max(0, 1 - relativeError);

  return Math.round(rawScore);
}

/**
 * Seleciona perguntas sem repetição dentro da partida.
 * Por defeito, utiliza Math.random; o parâmetro rng facilita testes.
 */
export function selectQuestions(questions, count = QUESTIONS_PER_GAME, rng = Math.random) {
  if (!Array.isArray(questions)) {
    throw new TypeError('A lista de perguntas deve ser um array.');
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('A quantidade de perguntas deve ser um inteiro positivo.');
  }
  if (questions.length < count) {
    throw new RangeError(`São necessárias pelo menos ${count} perguntas.`);
  }

  const shuffled = [...questions];

  // Fisher-Yates: embaralhamento sem modificar a lista original.
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}
