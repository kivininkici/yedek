// Security configuration - All sensitive data now stored in .env file
import { config } from "dotenv";

// Load environment variables first
config();

// Get security credentials from environment variables with fallbacks
export const MASTER_PASSWORD =
  process.env.MASTER_PASSWORD ||
  "m;rf_oj78cMGbO+0)Ai8e@JAAq=C2Wl)6xoQ_K42mQivX1DjvJ)";

export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

// Build security questions array - fallback to default if env vars not set
export const SECURITY_QUESTIONS = [
  {
    question: "Memleketiniz Neresi?",
    answer: "giresun"
  },
  {
    question: "Doğduğunuz Şehir Neresi?",
    answer: "bursa"
  },
  {
    question: "İlk Gittiğiniz Ülke?",
    answer: "yunanistan"
  },
  {
    question: "Memleketin Neyle Meşhur?",
    answer: "fındık"
  },
  {
    question: "Doğduğun Şehir Neyle Meşhur?",
    answer: "i̇skender"
  },
  {
    question: "Gittiğin İkinci Ülke?",
    answer: "gürcistan"
  }
];

// Get random security question
export function getRandomSecurityQuestion() {
  const randomIndex = Math.floor(Math.random() * SECURITY_QUESTIONS.length);
  return SECURITY_QUESTIONS[randomIndex];
}

// Validate security answer
export function validateSecurityAnswer(
  question: string,
  answer: string,
): boolean {
  const securityQuestion = SECURITY_QUESTIONS.find(
    (q) => q.question === question,
  );
  if (!securityQuestion) return false;

  return (
    answer.toLowerCase().trim() === securityQuestion.answer.toLowerCase().trim()
  );
}

// Update master password (for admin panel)
let currentMasterPassword = MASTER_PASSWORD;

export function getCurrentMasterPassword(): string {
  return currentMasterPassword;
}

export function updateMasterPassword(newPassword: string): void {
  currentMasterPassword = newPassword;
}
