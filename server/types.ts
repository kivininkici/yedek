// Extended session interface for security
declare module 'express-session' {
  interface SessionData {
    adminId?: number;
    adminUsername?: string;
    loginIP?: string;
    createdAt?: number;
    userId?: number;
    username?: string;
    isAdmin?: boolean;
  }
}

export {};