import { db } from "./db";
import { 
  users, 
  subscriptions, 
  categories, 
  defaultCategories,
  type User, 
  type InsertUser,
  type Subscription, 
  type InsertSubscription,
  type Category, 
  type InsertCategory
} from "@shared/schema";
import { and, eq, gte, lte, asc, desc } from "drizzle-orm";
import { format, addMonths, addYears, addDays } from "date-fns";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subscription methods
  getAllSubscriptions(userId?: number): Promise<Subscription[]>;
  getSubscription(id: number, userId?: number): Promise<Subscription | undefined>;
  createSubscription(subscription: any): Promise<Subscription>;
  updateSubscription(id: number, subscription: any, userId?: number): Promise<Subscription | undefined>;
  deleteSubscription(id: number, userId?: number): Promise<boolean>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Dashboard methods
  getUpcomingPayments(limit?: number, userId?: number): Promise<Subscription[]>;
  getTotalMonthlyExpense(userId?: number): Promise<number>;
  getActiveSubscriptionsCount(userId?: number): Promise<number>;
  getUpcomingPaymentsTotal(daysAhead?: number, userId?: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Subscription methods
  async getAllSubscriptions(userId?: number): Promise<Subscription[]> {
    if (userId) {
      return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    }
    return await db.select().from(subscriptions);
  }

  async getSubscription(id: number, userId?: number): Promise<Subscription | undefined> {
    if (userId) {
      const result = await db.select()
        .from(subscriptions)
        .where(and(
          eq(subscriptions.id, id),
          eq(subscriptions.userId, userId)
        ));
      return result[0];
    }
    
    const result = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return result[0];
  }

  async createSubscription(data: any): Promise<Subscription> {
    // Handle date conversion
    if (typeof data.nextPaymentDate === 'string') {
      data.nextPaymentDate = new Date(data.nextPaymentDate);
    }
    
    const [subscription] = await db.insert(subscriptions).values(data).returning();
    return subscription;
  }

  async updateSubscription(id: number, data: any, userId?: number): Promise<Subscription | undefined> {
    // Handle date conversion
    if (typeof data.nextPaymentDate === 'string') {
      data.nextPaymentDate = new Date(data.nextPaymentDate);
    }
    
    let whereClause;
    if (userId) {
      whereClause = and(
        eq(subscriptions.id, id),
        eq(subscriptions.userId, userId)
      );
    } else {
      whereClause = eq(subscriptions.id, id);
    }
    
    const [updated] = await db.update(subscriptions)
      .set(data)
      .where(whereClause)
      .returning();
      
    return updated;
  }

  async deleteSubscription(id: number, userId?: number): Promise<boolean> {
    let whereClause;
    if (userId) {
      whereClause = and(
        eq(subscriptions.id, id),
        eq(subscriptions.userId, userId)
      );
    } else {
      whereClause = eq(subscriptions.id, id);
    }
    
    const result = await db.delete(subscriptions).where(whereClause).returning({ id: subscriptions.id });
    return result.length > 0;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const result = await db.select()
      .from(categories)
      .where(eq(categories.name, name));
    return result[0];
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // Dashboard methods
  async getUpcomingPayments(limit: number = 5, userId?: number): Promise<Subscription[]> {
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);
    
    let whereCondition = and(
      gte(subscriptions.nextPaymentDate, now),
      lte(subscriptions.nextPaymentDate, thirtyDaysFromNow)
    );
    
    if (userId) {
      whereCondition = and(whereCondition, eq(subscriptions.userId, userId));
    }
    
    return await db.select()
      .from(subscriptions)
      .where(whereCondition)
      .orderBy(asc(subscriptions.nextPaymentDate))
      .limit(limit);
  }

  async getTotalMonthlyExpense(userId?: number): Promise<number> {
    let whereCondition = undefined;
    
    if (userId) {
      whereCondition = eq(subscriptions.userId, userId);
    }
    
    const subs = await db.select()
      .from(subscriptions)
      .where(whereCondition);
    
    return subs.reduce((total, sub) => {
      // Convert all to monthly equivalent
      let monthlyAmount = sub.amount;
      if (sub.billingCycle === 'quarterly') {
        monthlyAmount = sub.amount / 3;
      } else if (sub.billingCycle === 'annually') {
        monthlyAmount = sub.amount / 12;
      }
      return total + monthlyAmount;
    }, 0);
  }

  async getActiveSubscriptionsCount(userId?: number): Promise<number> {
    let whereCondition = undefined;
    
    if (userId) {
      whereCondition = eq(subscriptions.userId, userId);
    }
    
    // Instead of using db.sql which has compatibility issues, 
    // just get all subscriptions and count them in JavaScript
    const subs = await db.select()
      .from(subscriptions)
      .where(whereCondition);
      
    return subs.length;
  }

  async getUpcomingPaymentsTotal(daysAhead: number = 7, userId?: number): Promise<number> {
    const now = new Date();
    const futureDate = addDays(now, daysAhead);
    
    let whereCondition = and(
      gte(subscriptions.nextPaymentDate, now),
      lte(subscriptions.nextPaymentDate, futureDate)
    );
    
    if (userId) {
      whereCondition = and(whereCondition, eq(subscriptions.userId, userId));
    }
    
    const subs = await db.select()
      .from(subscriptions)
      .where(whereCondition);
      
    return subs.reduce((total, sub) => total + sub.amount, 0);
  }
  
  // Initialize categories and sample data if needed
  async initializeData() {
    // Check if categories exist, if not add default ones
    const existingCategories = await this.getAllCategories();
    
    if (existingCategories.length === 0) {
      for (const category of defaultCategories) {
        await this.createCategory(category);
      }
    }
  }
}

export const dbStorage = new DatabaseStorage();