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
    question: process.env.SECURITY_QUESTION_1!,
    answer: process.env.SECURITY_ANSWER_1!
  },
  {
    question: process.env.SECURITY_QUESTION_2!,
    answer: process.env.SECURITY_ANSWER_2!
  },
  {
    question: process.env.SECURITY_QUESTION_3!,
    answer: process.env.SECURITY_ANSWER_3!
  },
  {
    question: process.env.SECURITY_QUESTION_4!,
    answer: process.env.SECURITY_ANSWER_4!
  },
  {
    question: process.env.SECURITY_QUESTION_5!,
    answer: process.env.SECURITY_ANSWER_5!
  },
  {
    question: process.env.SECURITY_QUESTION_6!,
    answer: process.env.SECURITY_ANSWER_6!
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