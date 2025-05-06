import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPgSimple from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Define user type from the database schema
interface UserRecord {
  id: number;
  username: string;
  password: string;
  email: string | null;
  name: string | null;
  createdAt: Date | null;
}

declare global {
  namespace Express {
    interface User extends UserRecord {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  // Create a PostgreSQL session store
  const PgSession = connectPgSimple(session);
  
  const sessionSettings: session.SessionOptions = {
    store: new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'subscription-manager-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const result = await db.select().from(users).where(eq(users.username, username));
        const user = result[0];
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      const user = result[0];
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUserResult = await db.select().from(users).where(eq(users.username, req.body.username));
      
      if (existingUserResult.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      
      const [newUser] = await db.insert(users).values({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        name: req.body.name
      }).returning();

      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          id: newUser.id, 
          username: newUser.username,
          email: newUser.email,
          name: newUser.name 
        });
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: UserRecord | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err: any) => {
        if (err) return next(err);
        res.json({ 
          id: user.id, 
          username: user.username,
          email: user.email,
          name: user.name 
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ authenticated: false });
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name
    });
  });
}