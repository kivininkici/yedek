// Security configuration file - Now reading from environment variables
export const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'm;rf_oj78cMGbO+0)Ai8e@JAAq=C2Wl)6xoQ_K42mQivX1DjvJ)';

// Admin account credentials from environment
export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

// Security questions for admin login from environment
export const SECURITY_QUESTIONS = [
  {
    question: process.env.SECURITY_QUESTION_1 || "Kiwi'nin doğum tarihi? (GG/AA/YYYY)",
    answer: process.env.SECURITY_ANSWER_1 || "29/05/2020"
  },
  {
    question: process.env.SECURITY_QUESTION_2 || "Anne adı?",
    answer: process.env.SECURITY_ANSWER_2 || "Halime"
  },
  {
    question: process.env.SECURITY_QUESTION_3 || "Anne kızlık soyadı?",
    answer: process.env.SECURITY_ANSWER_3 || "Bahat"
  },
  {
    question: process.env.SECURITY_QUESTION_4 || "Anne doğum tarihi? (GG/AA/YYYY)",
    answer: process.env.SECURITY_ANSWER_4 || "17/12/1978"
  },
  {
    question: process.env.SECURITY_QUESTION_5 || "Baba adı?",
    answer: process.env.SECURITY_ANSWER_5 || "Muhammed"
  },
  {
    question: process.env.SECURITY_QUESTION_6 || "Baba soyadı?",
    answer: process.env.SECURITY_ANSWER_6 || "Yazar"
  }
];

// Get random security question
export function getRandomSecurityQuestion() {
  const randomIndex = Math.floor(Math.random() * SECURITY_QUESTIONS.length);
  return SECURITY_QUESTIONS[randomIndex];
}

// Validate security answer
export function validateSecurityAnswer(question: string, answer: string): boolean {
  const securityQuestion = SECURITY_QUESTIONS.find(q => q.question === question);
  if (!securityQuestion) return false;
  
  return answer.toLowerCase().trim() === securityQuestion.answer.toLowerCase().trim();
}

// Update master password (for admin panel)
let currentMasterPassword = MASTER_PASSWORD;

export function getCurrentMasterPassword(): string {
  return currentMasterPassword;
}

export function updateMasterPassword(newPassword: string): void {
  currentMasterPassword = newPassword;
}