export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToSolve: number;
}

export interface MockTest {
  id: string;
  name: string;
  questions: Question[];
  duration: number;
  totalMarks: number;
}

export interface TestResult {
  id: string;
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  accuracy: number;
  date: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  streak: number;
  totalPractice: number;
  accuracy: number;
}

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ProgressData {
  date: string;
  accuracy: number;
  questionsAttempted: number;
  timeSpent: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  accuracy: number;
  avatar?: string;
}

export interface Bookmark {
  id: string;
  questionId: string;
  question: Question;
  notes?: string;
  createdAt: Date;
}