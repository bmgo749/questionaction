export interface IQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'numerical' | 'literacy' | 'science' | 'logic';
  difficulty: 'medium' | 'hard';
}

export const iqQuestions: IQQuestion[] = [
  // Numerical Reasoning (40%)
  {
    id: 1,
    question: "If f(x) = 2x² + 3x - 5, what is f(3)?",
    options: ["16", "22", "28", "31"],
    correctAnswer: 1,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 2,
    question: "Solve for x: 3x + 7 = 2x + 15",
    options: ["8", "6", "4", "2"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 3,
    question: "What is the area of a circle with radius 5 cm? (Use π = 3.14)",
    options: ["78.5 cm²", "157 cm²", "31.4 cm²", "15.7 cm²"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 4,
    question: "A car travels 240 km in 4 hours. What is its average speed?",
    options: ["60 km/h", "80 km/h", "50 km/h", "70 km/h"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 5,
    question: "If log₂(x) = 3, what is the value of x?",
    options: ["6", "8", "9", "16"],
    correctAnswer: 1,
    category: 'numerical',
    difficulty: 'hard'
  },
  {
    id: 6,
    question: "What is the sum of interior angles of a hexagon?",
    options: ["720°", "540°", "900°", "1080°"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 7,
    question: "If sin(θ) = 0.6, what is cos(θ)? (assuming θ is in first quadrant)",
    options: ["0.8", "0.4", "0.36", "0.64"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'hard'
  },
  {
    id: 8,
    question: "A sequence follows the pattern: 2, 6, 18, 54, ... What is the next term?",
    options: ["162", "108", "216", "144"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 9,
    question: "If 3x - 2y = 10 and x + y = 5, what is the value of x?",
    options: ["4", "5", "3", "6"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'hard'
  },
  {
    id: 10,
    question: "What is the derivative of f(x) = x³ + 2x² - 3x + 1?",
    options: ["3x² + 4x - 3", "x⁴ + 2x³ - 3x²", "3x² + 4x + 3", "x² + 4x - 3"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'hard'
  },
  {
    id: 11,
    question: "The volume of a cylinder with radius 3 cm and height 8 cm is:",
    options: ["226.08 cm³", "150.72 cm³", "113.04 cm³", "301.44 cm³"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 12,
    question: "If the probability of rain is 0.3, what is the probability of no rain?",
    options: ["0.7", "0.3", "1.3", "0.4"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 13,
    question: "Solve: 2⁴ × 2³ ÷ 2² = ?",
    options: ["32", "16", "8", "64"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 14,
    question: "What is the slope of the line passing through points (2, 3) and (6, 11)?",
    options: ["2", "3", "4", "1"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 15,
    question: "If a = 4 and b = 6, what is √(a² + b²)?",
    options: ["√52", "10", "2√13", "Both A and C"],
    correctAnswer: 3,
    category: 'numerical',
    difficulty: 'medium'
  },
  {
    id: 16,
    question: "A box contains 5 red balls and 3 blue balls. What is the probability of drawing a red ball?",
    options: ["5/8", "3/8", "5/3", "8/5"],
    correctAnswer: 0,
    category: 'numerical',
    difficulty: 'medium'
  },

  // Literacy (40%)
  {
    id: 17,
    question: "Which word best completes the analogy: Book is to Library as Painting is to ____?",
    options: ["Artist", "Canvas", "Gallery", "Frame"],
    correctAnswer: 2,
    category: 'literacy',
    difficulty: 'medium'
  },
  {
    id: 18,
    question: "What is the meaning of the word 'ubiquitous'?",
    options: ["Rare", "Present everywhere", "Ancient", "Confusing"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'hard'
  },
  {
    id: 19,
    question: "Identify the correct sentence:",
    options: ["Neither of them are coming", "Neither of them is coming", "Neither of them were coming", "Neither of them have coming"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'medium'
  },
  {
    id: 20,
    question: "What is the antonym of 'meticulous'?",
    options: ["Careful", "Careless", "Detailed", "Precise"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'medium'
  },
  {
    id: 21,
    question: "Which figure of speech is used in: 'Time is money'?",
    options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'medium'
  },
  {
    id: 22,
    question: "What is the plural form of 'criterion'?",
    options: ["Criterions", "Criteria", "Criterias", "Criterion"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'hard'
  },
  {
    id: 23,
    question: "Choose the word that doesn't belong: Democracy, Monarchy, Capitalism, Oligarchy",
    options: ["Democracy", "Monarchy", "Capitalism", "Oligarchy"],
    correctAnswer: 2,
    category: 'literacy',
    difficulty: 'medium'
  },
  {
    id: 24,
    question: "What is the meaning of 'serendipity'?",
    options: ["Bad luck", "Pleasant surprise", "Hard work", "Careful planning"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'hard'
  },
  {
    id: 25,
    question: "Which sentence uses the subjunctive mood correctly?",
    options: ["If I was you, I would go", "If I were you, I would go", "If I am you, I will go", "If I be you, I would go"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'hard'
  },
  {
    id: 26,
    question: "What is the correct spelling?",
    options: ["Recieve", "Receive", "Recieve", "Recive"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'medium'
  },
  {
    id: 27,
    question: "What type of literary device is used in 'The wind whispered through the trees'?",
    options: ["Metaphor", "Simile", "Personification", "Alliteration"],
    correctAnswer: 2,
    category: 'literacy',
    difficulty: 'medium'
  },
  {
    id: 28,
    question: "Which word is closest in meaning to 'ephemeral'?",
    options: ["Eternal", "Temporary", "Beautiful", "Mysterious"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'hard'
  },
  {
    id: 29,
    question: "What is the correct past tense of 'lie' (to recline)?",
    options: ["Lied", "Lay", "Layed", "Lain"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'hard'
  },
  {
    id: 30,
    question: "Which sentence has correct punctuation?",
    options: ["It's a beautiful day, isn't it?", "Its a beautiful day, isn't it?", "It's a beautiful day, isnt it?", "Its a beautiful day isnt it?"],
    correctAnswer: 0,
    category: 'literacy',
    difficulty: 'medium'
  },
  {
    id: 31,
    question: "What is the meaning of 'cogent'?",
    options: ["Weak", "Convincing", "Confusing", "Emotional"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'hard'
  },
  {
    id: 32,
    question: "Which prefix means 'against' or 'opposite'?",
    options: ["Pro-", "Anti-", "Pre-", "Sub-"],
    correctAnswer: 1,
    category: 'literacy',
    difficulty: 'medium'
  },

  // Science & Logic (20%)
  {
    id: 33,
    question: "What is the chemical formula for water?",
    options: ["H₂O", "CO₂", "NaCl", "CH₄"],
    correctAnswer: 0,
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 34,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 35,
    question: "What is the speed of light in vacuum?",
    options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"],
    correctAnswer: 0,
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 36,
    question: "Which element has the atomic number 6?",
    options: ["Oxygen", "Carbon", "Nitrogen", "Hydrogen"],
    correctAnswer: 1,
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 37,
    question: "What is the unit of electrical resistance?",
    options: ["Volt", "Ampere", "Ohm", "Watt"],
    correctAnswer: 2,
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 38,
    question: "Which gas makes up approximately 78% of Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    correctAnswer: 2,
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 39,
    question: "What is the pH of pure water at 25°C?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 1,
    category: 'science',
    difficulty: 'medium'
  },
  {
    id: 40,
    question: "Which organelle is known as the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Endoplasmic Reticulum"],
    correctAnswer: 2,
    category: 'science',
    difficulty: 'medium'
  }
];

export const suddenTestQuestions: IQQuestion[] = [
  {
    id: 101,
    question: "What comes next in the sequence: 2, 4, 8, 16, ?",
    options: ["24", "32", "20", "28"],
    correctAnswer: 1,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 102,
    question: "Which number is missing: 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "13", "15", "10"],
    correctAnswer: 1,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 103,
    question: "If all roses are flowers, and some flowers are red, then:",
    options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
    correctAnswer: 3,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 104,
    question: "What is the next letter in the sequence: A, C, F, J, ?",
    options: ["N", "O", "P", "M"],
    correctAnswer: 1,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 105,
    question: "If today is Wednesday, what day will it be 100 days from now?",
    options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    correctAnswer: 2,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 106,
    question: "Which shape completes the pattern: Circle, Square, Triangle, ?",
    options: ["Rectangle", "Pentagon", "Hexagon", "Circle"],
    correctAnswer: 3,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 107,
    question: "What is the missing number: 3, 6, 12, 24, ?",
    options: ["36", "48", "42", "40"],
    correctAnswer: 1,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 108,
    question: "If BOOK is coded as CPPL, then WORD is coded as:",
    options: ["XPSE", "XQSE", "YPSE", "XPTE"],
    correctAnswer: 0,
    category: 'logic',
    difficulty: 'medium'
  }
];

// Function to get random questions
export function getRandomQuestions(count: number = 10): IQQuestion[] {
  const shuffled = [...iqQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Function to get random sudden test questions
export function getRandomSuddenQuestions(count: number = 1): IQQuestion[] {
  const shuffled = [...suddenTestQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}