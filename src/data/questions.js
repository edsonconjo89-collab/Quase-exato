/**
 * Perguntas temporárias para validar a mecânica do jogo.
 * Não representam ainda o banco final de 60 perguntas do lançamento.
 * Cada resposta está acompanhada por uma fonte de referência.
 */
export const QUESTIONS = [
  {
    id: 'demo-001',
    category: 'Ciência e Tecnologia',
    prompt: 'Qual é a velocidade da luz no vácuo, aproximadamente?',
    unit: 'quilómetros por segundo (km/s)',
    correctAnswer: 299792.458,
    sourceName: 'NIST — Speed of light in vacuum',
    sourceUrl: 'https://physics.nist.gov/cgi-bin/cuu/Value?c',
    referenceDate: 'Constante física',
  },
  {
    id: 'demo-002',
    category: 'Mundo e Geografia',
    prompt: 'Quantos metros existem em um quilómetro?',
    unit: 'metros (m)',
    correctAnswer: 1000,
    sourceName: 'BIPM — Sistema Internacional de Unidades',
    sourceUrl: 'https://www.bipm.org/en/measurement-units',
    referenceDate: 'Definição do prefixo quilo',
  },
  {
    id: 'demo-003',
    category: 'Desporto e Cultura Geral',
    prompt: 'Quantos minutos tem o tempo regulamentar de um jogo de futebol, sem compensação?',
    unit: 'minutos',
    correctAnswer: 90,
    sourceName: 'IFAB — Law 7: The Duration of the Match',
    sourceUrl: 'https://www.theifab.com/laws/latest/the-duration-of-the-match/',
    referenceDate: 'Duas partes de 45 minutos',
  },
  {
    id: 'demo-004',
    category: 'Ciência e Tecnologia',
    prompt: 'Quantos planetas são reconhecidos no Sistema Solar?',
    unit: 'planetas',
    correctAnswer: 8,
    sourceName: 'NASA — Solar System: Overview',
    sourceUrl: 'https://science.nasa.gov/solar-system/',
    referenceDate: 'Classificação atual da NASA',
  },
  {
    id: 'demo-005',
    category: 'Mundo e Geografia',
    prompt: 'Quantos segundos existem numa hora?',
    unit: 'segundos (s)',
    correctAnswer: 3600,
    sourceName: 'NIST — SI Units',
    sourceUrl: 'https://www.nist.gov/pml/owm/si-units-time',
    referenceDate: '1 hora = 60 minutos; 1 minuto = 60 segundos',
  },
  {
    id: 'demo-006',
    category: 'Moçambique e África',
    prompt: 'Quantos Estados-membros fazem parte da União Africana?',
    unit: 'Estados-membros',
    correctAnswer: 55,
    sourceName: 'União Africana — Member States of the AU',
    sourceUrl: 'https://www.au.int/en/AU_Member_States',
    referenceDate: 'Consulta em novembro de 2026',
  },
];
