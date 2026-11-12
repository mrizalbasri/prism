/**
 * Static grammar exercise bank.
 * No DB needed — exercises are versioned here and loaded at request time.
 * ponytail: JSON bank is simpler than a migration; add DB model if exercises grow > 500.
 */

export type ExerciseType = 'fill_blank' | 'error_correction' | 'sentence_transform';
export type GrammarLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface GrammarExercise {
  id: string;
  type: ExerciseType;
  level: GrammarLevel;
  topic: string;
  questionText: string;
  /** For fill_blank and error_correction: 4 choices (A–D). Null for sentence_transform. */
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
}

export const exercises: GrammarExercise[] = [
  // ───── BEGINNER ─────
  {
    id: 'g001',
    type: 'fill_blank',
    level: 'BEGINNER',
    topic: 'Simple Present',
    questionText: 'She ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
    correctAnswer: 'goes',
    explanation: 'Kata kerja untuk subjek orang ketiga tunggal (she/he/it) ditambah -s atau -es dalam Simple Present.',
  },
  {
    id: 'g002',
    type: 'fill_blank',
    level: 'BEGINNER',
    topic: 'Simple Present',
    questionText: 'They ___ basketball after school.',
    options: ['plays', 'play', 'played', 'playing'],
    correctAnswer: 'play',
    explanation: 'Untuk subjek jamak (they/we/you) tidak ada tambahan -s pada Simple Present.',
  },
  {
    id: 'g003',
    type: 'error_correction',
    level: 'BEGINNER',
    topic: 'Articles',
    questionText: 'He wants to be a engineer.',
    options: ['a engineer', 'an engineer', 'the engineer', 'engineer'],
    correctAnswer: 'an engineer',
    explanation: 'Gunakan "an" sebelum kata yang diawali bunyi vokal (engineer dimulai bunyi /ɛ/).',
  },
  {
    id: 'g004',
    type: 'fill_blank',
    level: 'BEGINNER',
    topic: 'Past Simple',
    questionText: 'I ___ the movie last night.',
    options: ['watch', 'watches', 'watched', 'watching'],
    correctAnswer: 'watched',
    explanation: 'Gunakan bentuk past tense (V2) untuk kejadian di masa lalu.',
  },
  {
    id: 'g005',
    type: 'fill_blank',
    level: 'BEGINNER',
    topic: 'Pronouns',
    questionText: 'This is my book. Can you give it to ___?',
    options: ['I', 'my', 'me', 'mine'],
    correctAnswer: 'me',
    explanation: '"Me" adalah object pronoun yang digunakan setelah kata kerja atau preposisi.',
  },
  // ───── INTERMEDIATE ─────
  {
    id: 'g006',
    type: 'fill_blank',
    level: 'INTERMEDIATE',
    topic: 'Present Perfect',
    questionText: 'She has ___ here for three years.',
    options: ['live', 'lives', 'lived', 'living'],
    correctAnswer: 'lived',
    explanation: 'Present Perfect menggunakan have/has + past participle (V3). "lived" adalah V3 dari "live".',
  },
  {
    id: 'g007',
    type: 'error_correction',
    level: 'INTERMEDIATE',
    topic: 'Conditionals',
    questionText: 'If I will study harder, I will pass the exam.',
    options: [
      'If I will study harder',
      'If I study harder',
      'If I studied harder',
      'If I had studied harder',
    ],
    correctAnswer: 'If I study harder',
    explanation: 'Conditional Type 1 menggunakan Simple Present di klausa "if", bukan "will". Pola: If + Present, will + infinitive.',
  },
  {
    id: 'g008',
    type: 'fill_blank',
    level: 'INTERMEDIATE',
    topic: 'Passive Voice',
    questionText: 'The report ___ by the team yesterday.',
    options: ['wrote', 'is written', 'was written', 'has written'],
    correctAnswer: 'was written',
    explanation: 'Passive Voice di past tense: was/were + past participle. "yesterday" menandakan past tense.',
  },
  {
    id: 'g009',
    type: 'fill_blank',
    level: 'INTERMEDIATE',
    topic: 'Modal Verbs',
    questionText: 'You ___ wear a helmet when riding a motorcycle. It\'s the law.',
    options: ['can', 'might', 'must', 'should'],
    correctAnswer: 'must',
    explanation: '"Must" digunakan untuk menyatakan kewajiban atau keharusan yang bersifat wajib.',
  },
  {
    id: 'g010',
    type: 'sentence_transform',
    level: 'INTERMEDIATE',
    topic: 'Reported Speech',
    questionText: 'Direct: "I am tired," she said.\nWhich is the correct reported speech?',
    options: [
      'She said that she is tired.',
      'She said that she was tired.',
      'She said that I am tired.',
      'She said that I was tired.',
    ],
    correctAnswer: 'She said that she was tired.',
    explanation: 'Dalam reported speech, Present Simple (am) berubah menjadi Past Simple (was). Pronoun "I" berubah menjadi "she".',
  },
  // ───── ADVANCED ─────
  {
    id: 'g011',
    type: 'fill_blank',
    level: 'ADVANCED',
    topic: 'Subjunctive',
    questionText: 'The professor recommended that every student ___ the textbook.',
    options: ['reads', 'read', 'reading', 'has read'],
    correctAnswer: 'read',
    explanation: 'Setelah ekspresi permintaan/saran (recommend, suggest, insist), gunakan bare infinitive (subjunctive) tanpa -s.',
  },
  {
    id: 'g012',
    type: 'error_correction',
    level: 'ADVANCED',
    topic: 'Inversion',
    questionText: 'Hardly I had arrived when it started raining.',
    options: [
      'Hardly I had arrived',
      'Hardly had I arrived',
      'Hardly I arrived',
      'Hardly did I arrive',
    ],
    correctAnswer: 'Hardly had I arrived',
    explanation: 'Setelah "hardly" di awal kalimat, lakukan inversion (auxiliary + subject). "Hardly had I arrived" adalah pola yang benar.',
  },
  {
    id: 'g013',
    type: 'fill_blank',
    level: 'ADVANCED',
    topic: 'Conditionals',
    questionText: '___ she known about the meeting, she would have attended.',
    options: ['If', 'Had', 'Should', 'Were'],
    correctAnswer: 'Had',
    explanation: '"Had she known" adalah inversi dari "If she had known" (Conditional Type 3 tanpa "if").',
  },
  {
    id: 'g014',
    type: 'sentence_transform',
    level: 'ADVANCED',
    topic: 'Cleft Sentences',
    questionText: 'John broke the window.\nWhich cleft sentence emphasizes "John"?',
    options: [
      'It was the window that John broke.',
      'It was John who broke the window.',
      'What John broke was the window.',
      'The window was broken by John.',
    ],
    correctAnswer: 'It was John who broke the window.',
    explanation: 'Cleft sentence "It was + X + who/that" digunakan untuk menekankan subjek. "who" digunakan untuk orang.',
  },
  {
    id: 'g015',
    type: 'fill_blank',
    level: 'ADVANCED',
    topic: 'Gerund vs Infinitive',
    questionText: 'I regret ___ him the bad news. He looked devastated.',
    options: ['tell', 'to tell', 'telling', 'told'],
    correctAnswer: 'telling',
    explanation: '"Regret + gerund (-ing)" berarti menyesali sesuatu yang sudah terjadi. "Regret + infinitive" berarti ingin menyampaikan kabar buruk.',
  },
];

export function getExercisesByLevel(level?: GrammarLevel): GrammarExercise[] {
  if (!level) return exercises;
  return exercises.filter((e) => e.level === level);
}

export function getExerciseById(id: string): GrammarExercise | undefined {
  return exercises.find((e) => e.id === id);
}

export const TOPICS = [...new Set(exercises.map((e) => e.topic))];
