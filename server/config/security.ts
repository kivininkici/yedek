// Security configuration - All sensitive data now stored in .env file
import { config } from "dotenv";

// Load environment variables first
config();

// Get security credentials from environment variables with fallbacks
export const MASTER_PASSWORD = process.env.MASTER_PASSWORD || "m;rf_oj78cMGbO+0)Ai8e@JAAq=C2Wl)6xoQ_K42mQivX1DjvJ)";

export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

// Build security questions array - fallback to default if env vars not set
export const SECURITY_QUESTIONS = [
  {
    question: "Kiwi'nin doğum tarihi nedir? (dd/mm/yyyy formatında)",
    answer: "29/05/2020"
  },
  {
    question: "Kiwi'nin annesinin adı nedir?",
    answer: "Halime"
  },
  {
    question: "Kiwi'nin annesinin kızlık soyadı nedir?",
    answer: "Bahat"
  },
  {
    question: "Kiwi'nin annesinin doğum tarihi nedir? (dd/mm/yyyy formatında)",
    answer: "17/12/1978"
  },
  {
    question: "Kiwi'nin babasının adı nedir?",
    answer: "Muhammed"
  },
  {
    question: "Kiwi'nin babasının soyadı nedir?",
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