import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { setupAuth } from "./auth";
import { dbStorage } from "./dbStorage";
import { 
  type InsertSubscription,
  type Subscription,
  subscriptions
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { eq, and } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  await setupAuth(app);
  // Initialize database data
  try {
    await dbStorage.initializeData();
  } catch (err) {
    console.error("Error initializing database data:", err);
  }

  // GET all subscriptions (filtered by user if authenticated)
  app.get("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      const userId = req.isAuthenticated() ? req.user.id : undefined;
      const subscriptions = await dbStorage.getAllSubscriptions(userId);
      res.json(subscriptions);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // GET subscription by ID (filtered by user if authenticated)
  app.get("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.isAuthenticated() ? req.user.id : undefined;
      const subscription = await dbStorage.getSubscription(id, userId);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json(subscription);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // POST create new subscription - with user ID if authenticated
  app.post("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      console.log("Received subscription data:", JSON.stringify(req.body));
      
      // Add user ID if authenticated
      const subscriptionData = {
        ...req.body,
        userId: req.isAuthenticated() ? req.user.id : null
      };
      
      // Pass data to dbStorage
      const newSubscription = await dbStorage.createSubscription(subscriptionData);
      console.log("Created subscription:", JSON.stringify(newSubscription));
      
      res.status(201).json(newSubscription);
    } catch (err) {
      console.error("Error creating subscription:", err);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // PATCH update subscription (filtered by user if authenticated)
  app.patch("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      console.log("Updating subscription with data:", JSON.stringify(req.body));
      
      const id = parseInt(req.params.id);
      const userId = req.isAuthenticated() ? req.user.id : undefined;
      
      // Handle conversion directly in storage
      const updatedSubscription = await dbStorage.updateSubscription(id, req.body, userId);
      
      if (!updatedSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      console.log("Updated subscription:", JSON.stringify(updatedSubscription));
      res.json(updatedSubscription);
    } catch (err) {
      console.error("Error updating subscription:", err);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // DELETE subscription (filtered by user if authenticated)
  app.delete("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.isAuthenticated() ? req.user.id : undefined;
      const success = await dbStorage.deleteSubscription(id, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting subscription:", err);
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // GET all categories (these are global, not user-specific)
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await dbStorage.getAllCategories();
      res.json(categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // GET dashboard summary data (filtered by user if authenticated)
  app.get("/api/dashboard/summary", async (req: Request, res: Response) => {
    try {
      const userId = req.isAuthenticated() ? req.user.id : undefined;
      const totalMonthlyExpense = await dbStorage.getTotalMonthlyExpense(userId);
      const activeSubscriptions = await dbStorage.getActiveSubscriptionsCount(userId);
      const upcomingPaymentsTotal = await dbStorage.getUpcomingPaymentsTotal(7, userId);
      const upcomingPayments = await dbStorage.getUpcomingPayments(5, userId);
      
      res.json({
        totalMonthlyExpense,
        activeSubscriptions,
        upcomingPaymentsTotal,
        upcomingPaymentsThisWeek: upcomingPayments.length,
      });
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // GET upcoming payments (filtered by user if authenticated)
  app.get("/api/dashboard/upcoming-payments", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const userId = req.isAuthenticated() ? req.user.id : undefined;
      const upcomingPayments = await dbStorage.getUpcomingPayments(limit, userId);
      res.json(upcomingPayments);
    } catch (err) {
      console.error("Error fetching upcoming payments:", err);
      res.status(500).json({ message: "Failed to fetch upcoming payments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}