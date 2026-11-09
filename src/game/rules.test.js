import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  parseEstimate,
  selectQuestions,
} from './rules.js';

test('calcula 1000 pontos para uma estimativa exata', () => {
  assert.equal(calculateScore(100, 100), 1000);
});

test('calcula 900 pontos para um erro relativo de 10%', () => {
  assert.equal(calculateScore(90, 100), 900);
});

test('aplica a mesma penalização para estimativas acima e abaixo', () => {
  assert.equal(calculateScore(50, 100), 500);
  assert.equal(calculateScore(150, 100), 500);
});

test('não permite pontuações negativas', () => {
  assert.equal(calculateScore(250, 100), 0);
});

test('aceita zero como estimativa', () => {
  assert.equal(calculateScore(0, 100), 0);
});

test('rejeita resposta correta igual a zero', () => {
  assert.throws(() => calculateScore(10, 0), TypeError);
});

test('interpreta decimais com vírgula ou ponto', () => {
  assert.equal(parseEstimate('12,5'), 12.5);
  assert.equal(parseEstimate('12.5'), 12.5);
});

test('aceita números inteiros e zero', () => {
  assert.equal(parseEstimate('1250'), 1250);
  assert.equal(parseEstimate('0'), 0);
});

test('rejeita entrada vazia, negativa, texto e mais de duas casas decimais', () => {
  assert.equal(parseEstimate(''), null);
  assert.equal(parseEstimate('   '), null);
  assert.equal(parseEstimate('-5'), null);
  assert.equal(parseEstimate('dez'), null);
  assert.equal(parseEstimate('1.234'), null);
  assert.equal(parseEstimate('1,234'), null);
  assert.equal(parseEstimate('1e3'), null);
});

test('seleciona cinco perguntas distintas sem alterar a lista original', () => {
  const questions = Array.from({ length: 7 }, (_, index) => ({ id: index }));
  const original = [...questions];
  const selected = selectQuestions(questions, 5, () => 0.5);

  assert.equal(selected.length, 5);
  assert.equal(new Set(selected.map((question) => question.id)).size, 5);
  assert.deepEqual(questions, original);
});

test('rejeita banco com menos perguntas do que o necessário', () => {
  assert.throws(() => selectQuestions([{ id: 1 }], 5), RangeError);
});
