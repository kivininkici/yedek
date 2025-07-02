// Security configuration file - Keep this file secure and separate
export const MASTER_PASSWORD = 'm;rf_oj78cMGbO+0)Ai8e@JAAq=C2Wl)6xoQ_K42mQivX1DjvJ)';

// Admin account credentials
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // This should be hashed in production
};

// Security questions for admin login
export const SECURITY_QUESTIONS = [
  {
    question: "Kiwi'nin doğum tarihi? (GG/AA/YYYY)",
    answer: "29/05/2020"
  },
  {
    question: "Anne adı?",
    answer: "Halime"
  },
  {
    question: "Anne kızlık soyadı?",
    answer: "Bahat"
  },
  {
    question: "Anne doğum tarihi? (GG/AA/YYYY)",
    answer: "17/12/1978"
  },
  {
    question: "Baba adı?",
    answer: "Muhammed"
  },
  {
    question: "Baba soyadı?",
    answer: "Yazar"
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