import { 
  users, type User, type InsertUser,
  subscriptions, type Subscription, type InsertSubscription, 
  categories, type Category, type InsertCategory, 
  defaultCategories 
} from "@shared/schema";
import { format, addMonths, addYears, addDays } from "date-fns";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subscription methods
  getAllSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: number): Promise<boolean>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Dashboard methods
  getUpcomingPayments(limit?: number): Promise<Subscription[]>;
  getTotalMonthlyExpense(): Promise<number>;
  getActiveSubscriptionsCount(): Promise<number>;
  getUpcomingPaymentsTotal(daysAhead?: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subscriptions: Map<number, Subscription>;
  private categories: Map<number, Category>;
  private userId: number;
  private subscriptionId: number;
  private categoryId: number;
  
  constructor() {
    this.users = new Map();
    this.subscriptions = new Map();
    this.categories = new Map();
    this.userId = 1;
    this.subscriptionId = 1;
    this.categoryId = 1;
    
    // Initialize default categories
    this.initializeDefaultCategories();
    
    // Add sample subscription data for testing
    this.initializeSampleData();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Subscription methods
  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).sort((a, b) => 
      new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
    );
  }
  
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }
  
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const now = new Date();
    const subscription: Subscription = { 
      ...insertSubscription, 
      id, 
      createdAt: now 
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }
  
  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const existing = this.subscriptions.get(id);
    if (!existing) return undefined;
    
    const updated: Subscription = { ...existing, ...subscription };
    this.subscriptions.set(id, updated);
    return updated;
  }
  
  async deleteSubscription(id: number): Promise<boolean> {
    return this.subscriptions.delete(id);
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Dashboard methods
  async getUpcomingPayments(limit: number = 5): Promise<Subscription[]> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    return Array.from(this.subscriptions.values())
      .filter(sub => {
        const paymentDate = new Date(sub.nextPaymentDate);
        return paymentDate >= now && paymentDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => 
        new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
      )
      .slice(0, limit);
  }
  
  async getTotalMonthlyExpense(): Promise<number> {
    return Array.from(this.subscriptions.values())
      .reduce((total, sub) => {
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
  
  async getActiveSubscriptionsCount(): Promise<number> {
    return this.subscriptions.size;
  }
  
  async getUpcomingPaymentsTotal(daysAhead: number = 7): Promise<number> {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + daysAhead);
    
    return Array.from(this.subscriptions.values())
      .filter(sub => {
        const paymentDate = new Date(sub.nextPaymentDate);
        return paymentDate >= now && paymentDate <= futureDate;
      })
      .reduce((total, sub) => total + sub.amount, 0);
  }
  
  // Helper methods for initialization
  private async initializeDefaultCategories() {
    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
  }
  
  private async initializeSampleData() {
    // This is just for testing during development and will be populated by users in production
    const today = new Date();
    
    const sampleSubscriptions: InsertSubscription[] = [
      {
        name: "Spotify Premium",
        provider: "Spotify",
        description: "Family Plan",
        amount: 9.99,
        category: "Entertainment",
        billingCycle: "monthly",
        nextPaymentDate: addDays(today, 7),
        reminderEnabled: true
      },
      {
        name: "Netflix",
        provider: "Netflix, Inc.",
        description: "Standard Plan",
        amount: 13.99,
        category: "Entertainment",
        billingCycle: "monthly",
        nextPaymentDate: addDays(today, 9),
        reminderEnabled: true
      },
      {
        name: "Adobe Creative Cloud",
        provider: "Adobe Inc.",
        description: "Complete Plan",
        amount: 52.99,
        category: "Productivity",
        billingCycle: "monthly",
        nextPaymentDate: addDays(today, 1),
        reminderEnabled: true
      },
      {
        name: "iCloud Storage",
        provider: "Apple Inc.",
        description: "200GB Plan",
        amount: 2.99,
        category: "Utilities",
        billingCycle: "monthly",
        nextPaymentDate: addDays(today, 15),
        reminderEnabled: false
      },
      {
        name: "GitHub Pro",
        provider: "GitHub, Inc.",
        description: "Developer Plan",
        amount: 7.99,
        category: "Productivity",
        billingCycle: "monthly",
        nextPaymentDate: addDays(today, 21),
        reminderEnabled: false
      }
    ];
    
    for (const subscription of sampleSubscriptions) {
      await this.createSubscription(subscription);
    }
  }
}

export const storage = new MemStorage();
