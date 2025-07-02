// Security configuration - All sensitive data now stored in .env file
import { config } from "dotenv";

// Load environment variables first
config();

// Get security credentials from environment variables
export const MASTER_PASSWORD = process.env.MASTER_PASSWORD || "5c2z6D1UicpYVvPBQkeoPy0OMsDgxAobfke1Hv5FoV9CwLhuxh";

export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

// Build security questions array from environment variables
export const SECURITY_QUESTIONS = [
  {
    question: process.env.SECURITY_QUESTION_1 || "Kiwi'nin doğum tarihi nedir? (gg/aa/yyyy)",
    answer: process.env.SECURITY_ANSWER_1 || "29/05/2020"
  },
  {
    question: process.env.SECURITY_QUESTION_2 || "Annenizin adı nedir?",
    answer: process.env.SECURITY_ANSWER_2 || "Halime"
  },
  {
    question: process.env.SECURITY_QUESTION_3 || "Annenizin kızlık soyadı nedir?",
    answer: process.env.SECURITY_ANSWER_3 || "Bahat"
  },
  {
    question: process.env.SECURITY_QUESTION_4 || "Annenizin doğum tarihi nedir? (gg/aa/yyyy)",
    answer: process.env.SECURITY_ANSWER_4 || "17/12/1978"
  },
  {
    question: process.env.SECURITY_QUESTION_5 || "Babanızın adı nedir?",
    answer: process.env.SECURITY_ANSWER_5 || "Muhammed"
  },
  {
    question: process.env.SECURITY_QUESTION_6 || "Babanızın soyadı nedir?",
    answer: process.env.SECURITY_ANSWER_6 || "Yazar"
  }
].filter(q => q.question && q.answer); // Filter out empty questions

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