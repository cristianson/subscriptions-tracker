import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Subscription Schema - declare first to avoid circular reference
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
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    name: true,
  })
  .extend({
    email: z.string().email().optional(),
    name: z.string().optional(),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertSubscriptionSchema = createInsertSchema(subscriptions)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    // Allow nextPaymentDate to be a string that will be converted to a Date
    nextPaymentDate: z.string().transform((dateStr) => new Date(dateStr)),
    userId: z.number().optional(),
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
