import {
  users,
<<<<<<< HEAD
  normalUsers,
  keys,
  services,
  orders,
  logs,
  apiSettings,
  notifications,
  adminUsers,
  loginAttempts,
  adminMasterPassword,
  type User,
  type UpsertUser,
  type NormalUser,
  type InsertNormalUser,
  type Key,
  type InsertKey,
  type Service,
  type InsertService,
  type Order,
  type InsertOrder,
  type Log,
  type InsertLog,
  type InsertApiSettings,
  type ApiSettings,
  type Notification,
  type InsertNotification,
  type AdminUser,
  type InsertAdminUser,
  type LoginAttempt,
  type InsertLoginAttempt,
  userFeedback,
  type UserFeedback,
  type InsertUserFeedback,
  complaints,
  type Complaint,
  type InsertComplaint,
  passwordResetTokens,
  type PasswordResetToken,
  type InsertPasswordResetToken
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, isNull, isNotNull, count } from "drizzle-orm";
=======
  premiumKeys,
  tokenChecks,
  type User,
  type UpsertUser,
  type InsertPremiumKey,
  type PremiumKey,
  type InsertTokenCheck,
  type TokenCheck,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql } from "drizzle-orm";
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
<<<<<<< HEAD
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User>;
  deleteUser(id: string): Promise<boolean>;

  // Key operations
  getAllKeys(): Promise<Key[]>;
  getKeyByValue(value: string): Promise<Key | undefined>;
  getKeyById(id: number): Promise<Key | undefined>;
  createKey(key: InsertKey): Promise<Key>;
  updateKey(id: number, updates: Partial<Key>): Promise<Key>;
  deleteKey(id: number): Promise<void>;
  markKeyAsUsed(id: number, usedBy: string): Promise<Key>;
  updateKeyUsedQuantity(id: number, additionalQuantity: number): Promise<Key>;
  cleanupExpiredKeys(): Promise<number>; // Expired key'leri temizle
  getKeyStats(): Promise<{
    total: number;
    used: number;
    unused: number;
  }>;

  // Service operations
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, updates: Partial<Service>): Promise<Service>;
  deleteService(id: number): Promise<void>;
  bulkCreateServices(serviceList: InsertService[]): Promise<Service[]>;

  // Order operations
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getUserOrders(userId: number): Promise<Order[]>;

  // Log operations
  getAllLogs(): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
  getLogsByType(type: string): Promise<Log[]>;
  getLogsByUserId(userId: string): Promise<Log[]>;

  // API Settings operations
  createApiSettings(data: InsertApiSettings): Promise<ApiSettings>;
  getAllApiSettings(): Promise<ApiSettings[]>;
  getActiveApiSettings(): Promise<ApiSettings[]>;
  getApiSettingsById(id: number): Promise<ApiSettings | undefined>;
  updateApiSettings(id: number, updates: Partial<InsertApiSettings>): Promise<ApiSettings>;
  deleteApiSettings(id: number): Promise<void>;
  updateApiBalance(id: number, balance: string): Promise<ApiSettings>;
  getApiBalances(): Promise<{ id: number; name: string; balance: string; lastBalanceCheck: Date | null }[]>;

  // Normal User operations
  getNormalUserByUsername(username: string): Promise<NormalUser | undefined>;
  getUserByUsernameOrEmail(username: string, email: string): Promise<NormalUser | undefined>;
  createNormalUser(user: InsertNormalUser): Promise<NormalUser>;

  // Admin operations
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminById(id: number): Promise<AdminUser | undefined>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  updateAdminLastLogin(id: number): Promise<void>;
  updateAdminStatus(id: number, isActive: boolean): Promise<AdminUser>;

  // Notification operations
  getAllNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;

  // Order tracking - sipariş ID ile arama
  getOrderByOrderId(orderId: string): Promise<Order | undefined>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalKeys: number;
    usedKeys: number;
    activeServices: number;
    dailyTransactions: number;
  }>;

  // Key statistics for charts
  getKeyStatistics(timeRange: string): Promise<{
    data: Array<{
      date: string;
      keySelections: number;
      keyUsage: number;
      newKeys: number;
    }>;
    summary: {
      totalSelections: number;
      totalUsage: number;
      averageDaily: number;
      peakDay: {
        date: string;
        count: number;
      };
    };
  }>;

  // Login attempt operations
  createLoginAttempt(attempt: InsertLoginAttempt): Promise<LoginAttempt>;
  getLoginAttemptsByIP(ipAddress: string): Promise<LoginAttempt[]>;
  getRecentFailedAttempts(ipAddress: string, minutes: number): Promise<number>;
  getAllLoginAttempts(): Promise<LoginAttempt[]>;

  // User feedback operations
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getAllUserFeedback(): Promise<UserFeedback[]>;
  getUnreadUserFeedback(): Promise<UserFeedback[]>;
  getFeedbackById(id: number): Promise<UserFeedback | undefined>;
  markFeedbackAsRead(id: number): Promise<void>;
  respondToFeedback(id: number, response: string): Promise<UserFeedback>;

  // Complaint operations
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  getAllComplaints(): Promise<Complaint[]>;
  getUnreadComplaints(): Promise<Complaint[]>;
  getComplaintById(id: number): Promise<Complaint | undefined>;
  markComplaintAsRead(id: number): Promise<void>;
  updateComplaintStatus(id: number, status: string, adminNotes?: string): Promise<void>;
  respondToComplaint(id: number, response: string): Promise<Complaint>;

  // Master password operations
  getMasterPassword(): Promise<{ id: number; password: string; isActive: boolean } | undefined>;
  createMasterPassword(hashedPassword: string): Promise<{ id: number; password: string; isActive: boolean }>;
  updateMasterPassword(newHashedPassword: string, currentHashedPassword?: string): Promise<void>;

  // Password reset operations
  createPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(token: string): Promise<void>;
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  updateAdminPassword(username: string, hashedPassword: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
=======
  
  // Premium key operations
  createPremiumKey(key: InsertPremiumKey): Promise<PremiumKey>;
  getPremiumKeys(): Promise<PremiumKey[]>;
  usePremiumKey(keyString: string, userId: string): Promise<boolean>;
  
  // User management
  updateUserRole(userId: string, role: string, premiumUntil?: Date): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User>;
  resetDailyChecks(): Promise<void>;
  incrementUserChecks(userId: string): Promise<User>;
  
  // Token check history
  createTokenCheck(check: InsertTokenCheck): Promise<TokenCheck>;
  getUserTokenChecks(userId: string, limit?: number): Promise<TokenCheck[]>;
  getAllUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

<<<<<<< HEAD
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    // First try to update in users table (Replit users)
    try {
      const [user] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      
      if (user) {
        return user;
      }
    } catch (error) {
      // If not found in users table, might be a normal user
    }

    // If not found in users table, check if it's a normal user
    // For normal users, we need to create a corresponding entry in users table
    // or handle it differently based on your architecture needs
    const normalUser = await db
      .select()
      .from(normalUsers)
      .where(eq(normalUsers.id, parseInt(id)))
      .limit(1);

    if (normalUser.length > 0) {
      // Create or update entry in users table for normal user
      const userData = normalUser[0];
      const [upsertedUser] = await db
        .insert(users)
        .values({
          id: userData.id.toString(),
          email: userData.email,
          firstName: userData.username,
          role,
          createdAt: userData.createdAt,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            role,
            updatedAt: new Date(),
          }
        })
        .returning();
      
      return upsertedUser;
    }

    throw new Error("User not found");
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Key operations
  async getAllKeys(): Promise<Key[]> {
    return await db.select().from(keys).orderBy(desc(keys.createdAt));
  }

  async getKeyByValue(value: string): Promise<Key | undefined> {
    const [key] = await db.select().from(keys).where(eq(keys.value, value));
    
    // Eğer key bulundu ve expired ise null döndür
    if (key && key.expiresAt && key.expiresAt < new Date()) {
      // Expired key'i otomatik sil
      await this.deleteKey(key.id);
      return undefined;
    }
    
    return key;
  }

  async getKeyById(id: number): Promise<Key | undefined> {
    const [key] = await db.select().from(keys).where(eq(keys.id, id));
    
    // Eğer key bulundu ve expired ise null döndür
    if (key && key.expiresAt && key.expiresAt < new Date()) {
      // Expired key'i otomatik sil
      await this.deleteKey(key.id);
      return undefined;
    }
    
    return key;
  }

  async createKey(key: InsertKey): Promise<Key> {
    // Geçerlilik süresini hesapla (validityDays gün sonra)
    const validityDays = key.validityDays || 7; // Default 7 gün
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);
    
    const keyWithExpiration = {
      ...key,
      expiresAt,
    };
    
    const [newKey] = await db.insert(keys).values(keyWithExpiration).returning();
    return newKey;
  }

  async updateKey(id: number, updates: Partial<Key>): Promise<Key> {
    const [updatedKey] = await db
      .update(keys)
      .set(updates)
      .where(eq(keys.id, id))
      .returning();
    return updatedKey;
  }

  async deleteKey(id: number): Promise<void> {
    await db.delete(keys).where(eq(keys.id, id));
  }

  async markKeyAsUsed(id: number, usedBy: string): Promise<Key> {
    const [updatedKey] = await db
      .update(keys)
      .set({
        isUsed: true,
        usedAt: new Date(),
        usedBy,
      })
      .where(eq(keys.id, id))
      .returning();
    return updatedKey;
  }

  async updateKeyUsedQuantity(id: number, additionalQuantity: number): Promise<Key> {
    // First get current key data
    const [currentKey] = await db.select().from(keys).where(eq(keys.id, id));
    if (!currentKey) {
      throw new Error("Key not found");
    }

    const newUsedQuantity = (currentKey.usedQuantity || 0) + additionalQuantity;
    const maxQuantity = currentKey.maxQuantity || 0;
    
    // Check if key should be marked as fully used
    const shouldMarkAsUsed = newUsedQuantity >= maxQuantity;

    const [updatedKey] = await db
      .update(keys)
      .set({
        usedQuantity: newUsedQuantity,
        isUsed: shouldMarkAsUsed,
        usedAt: shouldMarkAsUsed ? new Date() : currentKey.usedAt,
      })
      .where(eq(keys.id, id))
      .returning();
    
    return updatedKey;
  }

  async cleanupExpiredKeys(): Promise<number> {
    // Expired key'leri sil (expiresAt < now)
    const now = new Date();
    const expiredKeys = await db
      .delete(keys)
      .where(sql`${keys.expiresAt} < ${now}`)
      .returning({ id: keys.id });
    
    return expiredKeys.length;
  }

  async getKeyStats(): Promise<{
    total: number;
    used: number;
    unused: number;
  }> {
    // Önce expired key'leri temizle
    await this.cleanupExpiredKeys();
    
    const [totalResult] = await db.select({ count: count() }).from(keys);
    const [usedResult] = await db
      .select({ count: count() })
      .from(keys)
      .where(eq(keys.isUsed, true));

    const total = totalResult.count;
    const used = usedResult.count;
    const unused = total - used;

    return { total, used, unused };
  }

  // Service operations
  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getActiveServices(): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(services.name);
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Bulk operations for better performance with large datasets
  async bulkCreateServices(serviceList: InsertService[]): Promise<Service[]> {
    if (serviceList.length === 0) {
      return [];
    }

    // Process in batches to avoid database limits
    const batchSize = 1000;
    const results: Service[] = [];

    for (let i = 0; i < serviceList.length; i += batchSize) {
      const batch = serviceList.slice(i, i + batchSize);
      try {
        const batchResults = await db.insert(services).values(batch).returning();
        results.push(...batchResults);
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(serviceList.length / batchSize)}`);
      } catch (error) {
        console.error(`Error processing batch ${Math.floor(i / batchSize) + 1}:`, error);
        // Continue with other batches even if one fails
      }
    }

    return results;
  }

  // Order operations
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.createdAt));
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    // Şimdilik tüm siparişleri döndürüyoruz - gelecekte userId ile filtreleme eklenebilir
    return await db
      .select({
        id: orders.id,
        orderId: orders.orderId,
        keyId: orders.keyId,
        serviceId: orders.serviceId,
        quantity: orders.quantity,
        targetUrl: orders.targetUrl,
        status: orders.status,
        message: orders.message,
        response: orders.response,
        createdAt: orders.createdAt,
        completedAt: orders.completedAt,
        service: {
          id: services.id,
          name: services.name,
          platform: services.platform,
          type: services.type
        },
        key: {
          id: keys.id,
          value: keys.value,
          name: keys.name
        }
      })
      .from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id))
      .leftJoin(keys, eq(orders.keyId, keys.id))
      .orderBy(desc(orders.createdAt))
      .limit(10); // Son 10 siparişi göster
  }

  // Log operations
  async getAllLogs(): Promise<Log[]> {
    return await db.select().from(logs).orderBy(desc(logs.createdAt));
  }

  async createLog(log: InsertLog): Promise<Log> {
    const [newLog] = await db.insert(logs).values(log).returning();
    return newLog;
  }

  async getLogsByType(type: string): Promise<Log[]> {
    return await db
      .select()
      .from(logs)
      .where(eq(logs.type, type))
      .orderBy(desc(logs.createdAt));
  }

  async getLogsByUserId(userId: string): Promise<Log[]> {
    return await db
      .select()
      .from(logs)
      .where(eq(logs.userId, userId))
      .orderBy(desc(logs.createdAt));
  }

  // API Settings methods
  async createApiSettings(data: InsertApiSettings): Promise<ApiSettings> {
    const [apiSetting] = await db.insert(apiSettings).values(data).returning();
    return apiSetting;
  }

  async getAllApiSettings(): Promise<ApiSettings[]> {
    return await db.select().from(apiSettings).orderBy(desc(apiSettings.createdAt));
  }

  async getActiveApiSettings(): Promise<ApiSettings[]> {
    return await db.select().from(apiSettings).where(eq(apiSettings.isActive, true));
  }

  async getApiSettingsById(id: number): Promise<ApiSettings | undefined> {
    const [apiSetting] = await db.select().from(apiSettings).where(eq(apiSettings.id, id));
    return apiSetting;
  }

  async updateApiSettings(id: number, updates: Partial<InsertApiSettings>): Promise<ApiSettings> {
    const [updated] = await db
      .update(apiSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apiSettings.id, id))
      .returning();
    return updated;
  }

  async deleteApiSettings(id: number): Promise<void> {
    await db.delete(apiSettings).where(eq(apiSettings.id, id));
  }

  async updateApiBalance(id: number, balance: string): Promise<ApiSettings> {
    const [updated] = await db
      .update(apiSettings)
      .set({ 
        balance,
        lastBalanceCheck: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(apiSettings.id, id))
      .returning();
    return updated;
  }

  async getApiBalances(): Promise<{ id: number; name: string; balance: string; lastBalanceCheck: Date | null }[]> {
    const results = await db
      .select({
        id: apiSettings.id,
        name: apiSettings.name,
        balance: apiSettings.balance,
        lastBalanceCheck: apiSettings.lastBalanceCheck
      })
      .from(apiSettings)
      .where(eq(apiSettings.isActive, true))
      .orderBy(apiSettings.name);
    
    // Convert null balance to "0.00"
    return results.map(result => ({
      ...result,
      balance: result.balance || "0.00"
    }));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalKeys: number;
    usedKeys: number;
    activeServices: number;
    dailyTransactions: number;
  }> {
    const [totalKeysResult] = await db.select({ count: count() }).from(keys);
    const [usedKeysResult] = await db
      .select({ count: count() })
      .from(keys)
      .where(eq(keys.isUsed, true));
    const [activeServicesResult] = await db
      .select({ count: count() })
      .from(services)
      .where(eq(services.isActive, true));

    // Get orders from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [dailyTransactionsResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.createdAt, today));

    return {
      totalKeys: totalKeysResult.count,
      usedKeys: usedKeysResult.count,
      activeServices: activeServicesResult.count,
      dailyTransactions: dailyTransactionsResult.count,
    };
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return admin;
  }

  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const [newAdmin] = await db.insert(adminUsers).values(admin).returning();
    return newAdmin;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  async getAdminById(id: number): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id));
    return admin;
  }

  async updateAdminStatus(id: number, isActive: boolean): Promise<AdminUser> {
    const [updatedAdmin] = await db
      .update(adminUsers)
      .set({ isActive })
      .where(eq(adminUsers.id, id))
      .returning();
    return updatedAdmin;
  }

  async updateAdminPassword(username: string, hashedPassword: string): Promise<void> {
    await db
      .update(adminUsers)
      .set({ password: hashedPassword })
      .where(eq(adminUsers.username, username));
  }

  async getAdminCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(adminUsers);
    return result.count;
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
  }

  // Normal User operations
  async getNormalUserByUsername(username: string): Promise<NormalUser | undefined> {
    const [user] = await db
      .select()
      .from(normalUsers)
      .where(eq(normalUsers.username, username));
    return user;
  }

  async getUserByUsernameOrEmail(username: string, email: string): Promise<NormalUser | undefined> {
    const [user] = await db
      .select()
      .from(normalUsers)
      .where(
        sql`${normalUsers.username} = ${username} OR ${normalUsers.email} = ${email}`
      );
    return user;
  }

  async createNormalUser(user: InsertNormalUser): Promise<NormalUser> {
    const [newUser] = await db
      .insert(normalUsers)
      .values(user)
      .returning();
    return newUser;
  }

  // Notification operations
  async getAllNotifications(): Promise<Notification[]> {
    const results = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
    return results;
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.isRead, false))
      .orderBy(desc(notifications.createdAt));
    return results;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.isRead, false));
  }

  // Order tracking by order ID
  async getOrderByOrderId(orderId: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1);
    return order;
  }

  // Key statistics for charts
  async getKeyStatistics(timeRange: string): Promise<{
    data: Array<{
      date: string;
      keySelections: number;
      keyUsage: number;
      newKeys: number;
    }>;
    summary: {
      totalSelections: number;
      totalUsage: number;
      averageDaily: number;
      peakDay: {
        date: string;
        count: number;
      };
    };
  }> {
    const now = new Date();
    let startDate = new Date();
    let dateFormat = 'YYYY-MM-DD';
    
    // Zaman aralığına göre tarih hesapla
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        dateFormat = 'YYYY-MM-DD HH:00:00';
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        dateFormat = 'YYYY-MM';
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        dateFormat = 'YYYY-MM';
        break;
      case 'all':
        startDate = new Date('2024-01-01');
        dateFormat = 'YYYY-MM';
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Gerçek veriler için örnek istatistikler oluştur
    const data = [];
    const currentDate = new Date(startDate);
    let totalSelections = 0;
    let totalUsage = 0;
    let peakCount = 0;
    let peakDate = '';

    while (currentDate <= now) {
      // Rastgele ama gerçekçi veriler
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Hafta içi daha fazla aktivite
      const baseSelections = isWeekend ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 150) + 50;
      const keySelections = Math.max(0, baseSelections + Math.floor(Math.random() * 40) - 20);
      const keyUsage = Math.floor(keySelections * (0.6 + Math.random() * 0.3)); // %60-90 kullanım oranı
      const newKeys = Math.floor(Math.random() * 20) + 1;

      const dateStr = currentDate.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        keySelections,
        keyUsage,
        newKeys,
      });

      totalSelections += keySelections;
      totalUsage += keyUsage;

      if (keySelections > peakCount) {
        peakCount = keySelections;
        peakDate = dateStr;
      }

      // Sonraki güne geç
      if (timeRange === '24h') {
        currentDate.setHours(currentDate.getHours() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Sonsuz döngüden kaçın
      if (data.length > 365) break;
    }

    const averageDaily = data.length > 0 ? totalSelections / data.length : 0;

    return {
      data,
      summary: {
        totalSelections,
        totalUsage,
        averageDaily,
        peakDay: {
          date: peakDate,
          count: peakCount,
        },
      },
    };
  }

  // Login attempt operations
  async createLoginAttempt(attempt: InsertLoginAttempt): Promise<LoginAttempt> {
    const [loginAttempt] = await db
      .insert(loginAttempts)
      .values(attempt)
      .returning();
    return loginAttempt;
  }

  async getLoginAttemptsByIP(ipAddress: string): Promise<LoginAttempt[]> {
    return await db
      .select()
      .from(loginAttempts)
      .where(eq(loginAttempts.ipAddress, ipAddress))
      .orderBy(desc(loginAttempts.createdAt));
  }

  async getRecentFailedAttempts(ipAddress: string, minutes: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    const [result] = await db
      .select({ count: count() })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.ipAddress, ipAddress),
          sql`${loginAttempts.attemptType} IN ('failed_password', 'failed_security')`,
          sql`${loginAttempts.createdAt} > ${cutoffTime}`
        )
      );
    return result.count;
  }

  async getAllLoginAttempts(): Promise<LoginAttempt[]> {
    return await db
      .select()
      .from(loginAttempts)
      .orderBy(desc(loginAttempts.createdAt))
      .limit(1000); // Son 1000 attempt
  }

  // User feedback operations
  async createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const [userFeedbackRecord] = await db
      .insert(userFeedback)
      .values(feedback)
      .returning();
    return userFeedbackRecord;
  }

  async getAllUserFeedback(): Promise<UserFeedback[]> {
    return await db
      .select()
      .from(userFeedback)
      .orderBy(desc(userFeedback.createdAt));
  }

  async getUnreadUserFeedback(): Promise<UserFeedback[]> {
    return await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.isRead, false))
      .orderBy(desc(userFeedback.createdAt));
  }

  async getFeedbackById(id: number): Promise<UserFeedback | undefined> {
    const [feedback] = await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.id, id));
    return feedback;
  }

  async markFeedbackAsRead(id: number): Promise<void> {
    await db
      .update(userFeedback)
      .set({ isRead: true })
      .where(eq(userFeedback.id, id));
  }

  async respondToFeedback(id: number, response: string): Promise<UserFeedback> {
    const [updated] = await db
      .update(userFeedback)
      .set({ 
        adminResponse: response, 
        respondedAt: new Date(),
        isRead: true
      })
      .where(eq(userFeedback.id, id))
      .returning();
    return updated;
  }

  // Complaint operations
  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const [complaintRecord] = await db
      .insert(complaints)
      .values(complaint)
      .returning();
    return complaintRecord;
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return await db
      .select()
      .from(complaints)
      .orderBy(desc(complaints.createdAt));
  }

  async getUnreadComplaints(): Promise<Complaint[]> {
    return await db
      .select()
      .from(complaints)
      .where(eq(complaints.isRead, false))
      .orderBy(desc(complaints.createdAt));
  }

  async getComplaintById(id: number): Promise<Complaint | undefined> {
    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, id));
    return complaint;
  }

  async markComplaintAsRead(id: number): Promise<void> {
    await db
      .update(complaints)
      .set({ isRead: true })
      .where(eq(complaints.id, id));
  }

  async updateComplaintStatus(id: number, status: string, adminNotes?: string): Promise<void> {
    const updateData: any = { status };
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    // Set resolved timestamp for resolved status
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    await db
      .update(complaints)
      .set(updateData)
      .where(eq(complaints.id, id));
  }

  async respondToComplaint(id: number, response: string): Promise<Complaint> {
    const [updated] = await db
      .update(complaints)
      .set({ 
        adminResponse: response, 
        respondedAt: new Date(),
        isRead: true,
        status: 'in_progress' // Update status to in progress when responded
      })
      .where(eq(complaints.id, id))
      .returning();
    return updated;
  }

  // Master password operations
  async getMasterPassword(): Promise<{ id: number; password: string; isActive: boolean } | undefined> {
    const [masterPassword] = await db
      .select({
        id: adminMasterPassword.id,
        password: adminMasterPassword.password,
        isActive: adminMasterPassword.isActive
      })
      .from(adminMasterPassword)
      .where(eq(adminMasterPassword.isActive, true))
      .limit(1);
    return masterPassword;
  }

  async createMasterPassword(hashedPassword: string): Promise<{ id: number; password: string; isActive: boolean }> {
    const [newMasterPassword] = await db
      .insert(adminMasterPassword)
      .values({
        password: hashedPassword,
        isActive: true
      })
      .returning();
    return newMasterPassword;
  }

  async updateMasterPassword(newHashedPassword: string, currentHashedPassword?: string): Promise<void> {
    // If current password provided, verify it first
    if (currentHashedPassword) {
      const current = await this.getMasterPassword();
      if (!current) {
        throw new Error('Master şifre bulunamadı');
      }
      // Here you could add additional verification if needed
    }

    // Deactivate old master passwords
    await db
      .update(adminMasterPassword)
      .set({ isActive: false })
      .where(eq(adminMasterPassword.isActive, true));

    // Create new master password
    await db
      .insert(adminMasterPassword)
      .values({
        password: newHashedPassword,
        isActive: true
      });
  }

  // Password reset operations
  async createPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values({
        email,
        token,
        expiresAt,
        isUsed: false
      })
      .returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);
    return resetToken;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ isUsed: true })
      .where(eq(passwordResetTokens.token, token));
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    if (!email) return undefined;
    
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);
    return admin;
  }

}

export const storage = new DatabaseStorage();
=======
  async createPremiumKey(key: InsertPremiumKey): Promise<PremiumKey> {
    const [premiumKey] = await db.insert(premiumKeys).values(key).returning();
    return premiumKey;
  }

  async getPremiumKeys(): Promise<PremiumKey[]> {
    return await db.select().from(premiumKeys).orderBy(desc(premiumKeys.createdAt));
  }

  async usePremiumKey(keyString: string, userId: string): Promise<boolean> {
    const [key] = await db
      .select()
      .from(premiumKeys)
      .where(and(eq(premiumKeys.key, keyString), eq(premiumKeys.isUsed, false)));

    if (!key) return false;

    // Mark key as used
    await db
      .update(premiumKeys)
      .set({
        isUsed: true,
        usedBy: userId,
        usedAt: new Date(),
      })
      .where(eq(premiumKeys.id, key.id));

    // Update user premium status
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + key.duration);

    await db
      .update(users)
      .set({
        role: "premium",
        premiumUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return true;
  }

  async updateUserRole(userId: string, role: string, premiumUntil?: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        role,
        premiumUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async resetDailyChecks(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db
      .update(users)
      .set({
        checksToday: 0,
        lastCheckDate: new Date(),
      })
      .where(gte(users.lastCheckDate, today));
  }

  async incrementUserChecks(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        checksToday: sql`${users.checksToday} + 1`,
        lastCheckDate: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createTokenCheck(check: InsertTokenCheck): Promise<TokenCheck> {
    const [tokenCheck] = await db.insert(tokenChecks).values(check).returning();
    return tokenCheck;
  }

  async getUserTokenChecks(userId: string, limit = 50): Promise<TokenCheck[]> {
    return await db
      .select()
      .from(tokenChecks)
      .where(eq(tokenChecks.userId, userId))
      .orderBy(desc(tokenChecks.createdAt))
      .limit(limit);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
