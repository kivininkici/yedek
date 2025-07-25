import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
<<<<<<< HEAD
  numeric,
  decimal,
=======
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

<<<<<<< HEAD
// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
=======
// Session storage table for Replit Auth
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

<<<<<<< HEAD
// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
=======
// User storage table for Replit Auth
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
<<<<<<< HEAD
  role: varchar("role", { length: 50 }).notNull().default("user"), // "user" or "admin"
  avatarId: integer("avatar_id").notNull().default(1), // 1-24 arası kedi avatar ID'si
=======
  role: varchar("role").default("free").notNull(), // free, premium, admin
  premiumUntil: timestamp("premium_until"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  checksToday: integer("checks_today").default(0).notNull(),
  lastCheckDate: timestamp("last_check_date"),
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

<<<<<<< HEAD
// Admin users table for separate admin authentication
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// Normal users table for regular user authentication
export const normalUsers = pgTable("normal_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  avatarId: integer("avatar_id").notNull().default(1), // 1-24 arası kedi avatar ID'si
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const keys = pgTable("keys", {
  id: serial("id").primaryKey(),
  value: varchar("value", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull().default("single-use"),
  category: varchar("category", { length: 100 }).notNull().default("Instagram"), // Key kategorisi
  serviceId: integer("service_id"),
  apiSettingsId: integer("api_settings_id"), // Hangi API'ye ait olduğunu belirler
  maxQuantity: integer("max_quantity"),
  usedQuantity: integer("used_quantity").notNull().default(0),
  isUsed: boolean("is_used").notNull().default(false),
  usedAt: timestamp("used_at"),
  usedBy: varchar("used_by", { length: 255 }),
  validityDays: integer("validity_days").notNull().default(7), // Key geçerlilik süresi (gün)
  expiresAt: timestamp("expires_at"), // Otomatik hesaplanan son kullanma tarihi
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  platform: varchar("platform", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  price: numeric("price", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").notNull().default(true),
  apiEndpoint: varchar("api_endpoint", { length: 500 }),
  apiMethod: varchar("api_method", { length: 10 }).default("POST"),
  apiHeaders: jsonb("api_headers"),
  requestTemplate: jsonb("request_template"),
  responseFormat: jsonb("response_format"),
  serviceId: varchar("service_id", { length: 100 }), // For external API service ID
  apiSettingsId: integer("api_settings_id"), // Hangi API'den geldiğini belirler
  category: varchar("category", { length: 100 }),
  minQuantity: integer("min_quantity").default(1),
  maxQuantity: integer("max_quantity").default(10000),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 50 }).notNull().unique(), // Random order ID like #32390242
  keyId: integer("key_id").notNull(),
  serviceId: integer("service_id").notNull(),
  targetUrl: varchar("target_url", { length: 500 }),
  quantity: integer("quantity").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed
  response: jsonb("response"),
  message: text("message"), // Status message for user
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  userId: varchar("user_id", { length: 255 }),
  keyId: integer("key_id"),
  orderId: integer("order_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiSettings = pgTable("api_settings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  apiUrl: varchar("api_url", { length: 500 }).notNull(),
  apiKey: varchar("api_key", { length: 500 }),
  isActive: boolean("is_active").notNull().default(true),
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0.00"), // API bakiyesi
  lastBalanceCheck: timestamp("last_balance_check"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bildirim sistemi için notification tablosu
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // 'order_cancelled', 'order_completed', 'order_failed'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  orderId: varchar("order_id", { length: 50 }), // Sipariş ID'si
  orderData: jsonb("order_data"), // Sipariş detayları
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Login attempts table for admin security
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(), // IPv6 support
  username: varchar("username", { length: 50 }),
  attemptType: varchar("attempt_type", { length: 20 }).notNull(), // 'success', 'failed_password', 'failed_security', 'blocked'
  userAgent: text("user_agent"),
  country: varchar("country", { length: 100 }), // Ülke bilgisi
  city: varchar("city", { length: 100 }), // Şehir bilgisi
  region: varchar("region", { length: 100 }), // Bölge bilgisi
  timezone: varchar("timezone", { length: 50 }), // Saat dilimi
  createdAt: timestamp("created_at").defaultNow(),
});

// Master password for admin panel access
export const adminMasterPassword = pgTable("admin_master_password", {
  id: serial("id").primaryKey(),
  password: varchar("password", { length: 255 }).notNull(), // hashed master password
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User feedback table
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email", { length: 255 }),
  userName: varchar("user_name", { length: 255 }),
  orderId: varchar("order_id", { length: 50 }), // Related order if any
  message: text("message").notNull(),
  satisfactionLevel: varchar("satisfaction_level", { length: 20 }), // 'unsatisfied', 'neutral', 'satisfied'
  ipAddress: varchar("ip_address", { length: 45 }),
  isRead: boolean("is_read").notNull().default(false),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Complaints table for unsatisfied users
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email", { length: 255 }),
  userName: varchar("user_name", { length: 255 }),
  orderId: varchar("order_id", { length: 50 }).notNull(), // Required order ID to access complaint form
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 'service_quality', 'delivery_time', 'billing', 'other'
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status", { length: 20 }).notNull().default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  ipAddress: varchar("ip_address", { length: 45 }),
  isRead: boolean("is_read").notNull().default(false),
  adminResponse: text("admin_response"),
  adminNotes: text("admin_notes"), // Internal admin notes
  assignedAdmin: varchar("assigned_admin", { length: 100 }), // Admin username
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  resolvedAt: timestamp("resolved_at"),
});

// Schema exports
export const insertKeySchema = createInsertSchema(keys).omit({
  id: true,
  createdAt: true,
}).extend({
  maxQuantity: z.number().min(1, "Miktar en az 1 olmalı"),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  createdAt: true,
});

export const insertApiSettingsSchema = createInsertSchema(apiSettings).omit({
  id: true,
  balance: true,
  lastBalanceCheck: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertLoginAttemptSchema = createInsertSchema(loginAttempts).omit({
  id: true,
  createdAt: true,
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
  isRead: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
  resolvedAt: true,
  isRead: true,
  adminResponse: true,
  adminNotes: true,
  assignedAdmin: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertNormalUserSchema = createInsertSchema(normalUsers).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
  isActive: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const adminLoginSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  securityQuestion: z.string().min(1, "Güvenlik sorusu gerekli"),
  securityAnswer: z.string().min(1, "Güvenlik sorusu cevabı gerekli"),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertNormalUser = z.infer<typeof insertNormalUserSchema>;
export type NormalUser = typeof normalUsers.$inferSelect;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
export type InsertKey = z.infer<typeof insertKeySchema>;
export type Key = typeof keys.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertApiSettings = z.infer<typeof insertApiSettingsSchema>;
export type ApiSettings = typeof apiSettings.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertLoginAttempt = z.infer<typeof insertLoginAttemptSchema>;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
=======
// Premium keys for manual activation
export const premiumKeys = pgTable("premium_keys", {
  id: serial("id").primaryKey(),
  key: varchar("key").unique().notNull(),
  duration: integer("duration").notNull(), // duration in days
  isUsed: boolean("is_used").default(false).notNull(),
  usedBy: varchar("used_by").references(() => users.id),
  usedAt: timestamp("used_at"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Token check history
export const tokenChecks = pgTable("token_checks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tokenType: varchar("token_type").notNull(), // outlook, token, all
  tokenInput: text("token_input").notNull(),
  result: jsonb("result").notNull(), // validation results
  status: varchar("status").notNull(), // valid, invalid, checking, error
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPremiumKey = typeof premiumKeys.$inferInsert;
export type PremiumKey = typeof premiumKeys.$inferSelect;
export type InsertTokenCheck = typeof tokenChecks.$inferInsert;
export type TokenCheck = typeof tokenChecks.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const insertPremiumKeySchema = createInsertSchema(premiumKeys).omit({
  id: true,
  createdAt: true,
});
export const insertTokenCheckSchema = createInsertSchema(tokenChecks).omit({
  id: true,
  createdAt: true,
});
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
