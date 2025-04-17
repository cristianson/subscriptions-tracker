import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Subscription Schema
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  description: text("description"),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  billingCycle: text("billing_cycle").notNull(), // monthly, quarterly, annually, custom
  nextPaymentDate: timestamp("next_payment_date").notNull(),
  reminderEnabled: boolean("reminder_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Category Schema (for standardizing categories)
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Default category values
export const defaultCategories: InsertCategory[] = [
  { name: "Entertainment", color: "#3B82F6" }, // blue
  { name: "Productivity", color: "#10B981" }, // green
  { name: "Utilities", color: "#F59E0B" }, // yellow/amber
  { name: "Other", color: "#6B7280" }, // gray
];
