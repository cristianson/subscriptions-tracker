import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSubscriptionSchema, 
  type InsertSubscription,
  type Subscription
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET all subscriptions
  app.get("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      res.json(subscriptions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // GET subscription by ID
  app.get("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getSubscription(id);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json(subscription);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // POST create new subscription
  app.post("/api/subscriptions", async (req: Request, res: Response) => {
    try {
      console.log("Received subscription data:", JSON.stringify(req.body));
      
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      console.log("Validated subscription data:", JSON.stringify(subscriptionData));
      
      const newSubscription = await storage.createSubscription(subscriptionData);
      console.log("Created subscription:", JSON.stringify(newSubscription));
      
      res.status(201).json(newSubscription);
    } catch (err) {
      console.error("Error creating subscription:", err);
      
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        console.error("Validation error:", validationError.message);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // PATCH update subscription
  app.patch("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const subscriptionData = req.body as Partial<InsertSubscription>;
      
      const updatedSubscription = await storage.updateSubscription(id, subscriptionData);
      
      if (!updatedSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json(updatedSubscription);
    } catch (err) {
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // DELETE subscription
  app.delete("/api/subscriptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubscription(id);
      
      if (!success) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // GET all categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // GET dashboard summary data
  app.get("/api/dashboard/summary", async (req: Request, res: Response) => {
    try {
      const totalMonthlyExpense = await storage.getTotalMonthlyExpense();
      const activeSubscriptions = await storage.getActiveSubscriptionsCount();
      const upcomingPaymentsTotal = await storage.getUpcomingPaymentsTotal(7);
      const upcomingPayments = await storage.getUpcomingPayments(5);
      
      res.json({
        totalMonthlyExpense,
        activeSubscriptions,
        upcomingPaymentsTotal,
        upcomingPaymentsThisWeek: upcomingPayments.length,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // GET upcoming payments
  app.get("/api/dashboard/upcoming-payments", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const upcomingPayments = await storage.getUpcomingPayments(limit);
      res.json(upcomingPayments);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch upcoming payments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
