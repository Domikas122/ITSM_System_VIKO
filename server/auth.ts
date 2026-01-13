import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import type { SafeUser, User } from "@shared/schema";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: SafeUser;
  }
}

// Simple session middleware
export function setupAuth(app: Express) {
  const isProduction = process.env.NODE_ENV === "production";
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "incident-pilot-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: "lax", // Allow cross-site requests
        domain: process.env.COOKIE_DOMAIN, // Set this for your domain
      },
    })
  );
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Neautorizuotas" });
  }
  next();
}

// Middleware to check if user is IT specialist
export function requireSpecialist(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user || req.session.user.role !== "IT_specialistas") {
    return res.status(403).json({ message: "Reikalingos IT specialisto teisės" });
  }
  next();
}

export function registerAuthRoutes(app: Express) {
  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Reikalingas naudotojo vardas ir slaptažodis" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Neteisingas naudotojo vardas arba slaptažodis" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        email: user.email,
      };

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      });
    } catch (error) {
      console.error("Prisijungimo klaida:", error);
      res.status(500).json({ message: "Nepavyko prisijungti" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Atsijungimo klaida:", err);
        return res.status(500).json({ message: "Nepavyko atsijungti" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Sėkmingai atsijungta" });
    });
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Neautorizuotas" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Vartotojas nerastas" });
      }
      res.json(user);
    } catch (error) {
      console.error("Klaida gaunant vartotoją:", error);
      res.status(500).json({ message: "Nepavyko gauti vartotojo" });
    }
  });

  // Create new user (requires IT specialist)
  app.post("/api/users", requireAuth, requireSpecialist, async (req: Request, res: Response) => {
    try {
      const { username, password, displayName, role } = req.body;

      if (!username || !password || !displayName || !role) {
        return res.status(400).json({ message: "Visi laukai yra privalomi" });
      }

      if (role !== "Darbuotojas" && role !== "IT_specialistas") {
        return res.status(400).json({ message: "Neteisingas vaidmuo" });
      }

      // Check if username already exists
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Naudotojo vardas jau užimtas" });
      }

      const user = await storage.createUser({
        username,
        password,
        displayName,
        role,
      });

      res.status(201).json(user);
    } catch (error) {
      console.error("Klaida kuriant vartotoją:", error);
      res.status(500).json({ message: "Nepavyko sukurti vartotojo" });
    }
  });

  // Get all users (requires IT specialist)
  app.get("/api/users", requireAuth, requireSpecialist, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Klaida gaunant vartotojus:", error);
      res.status(500).json({ message: "Nepavyko gauti vartotojų" });
    }
  });

  // Delete user (requires IT specialist)
  app.delete("/api/users/:id", requireAuth, requireSpecialist, async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      
      // Prevent deleting the current user
      if (userId === req.session.userId) {
        return res.status(400).json({ message: "Negalite ištrinti savo paskyros" });
      }

      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ message: "Vartotojas nerastas" });
      }

      res.json({ message: "Vartotojas sėkmingai ištrinta" });
    } catch (error) {
      console.error("Klaida ištrinti vartotoją:", error);
      res.status(500).json({ message: "Nepavyko ištrinti vartotojo" });
    }
  });

  // Update user (requires IT specialist)
  app.put("/api/users/:id", requireAuth, requireSpecialist, async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const { username, password, displayName, role } = req.body;

      // Validate role if provided
      if (role && role !== "Darbuotojas" && role !== "IT_specialistas") {
        return res.status(400).json({ message: "Neteisingas vaidmuo" });
      }

      // Check if new username is already taken by another user
      if (username) {
        const existing = await storage.getUserByUsername(username);
        if (existing && existing.id !== userId) {
          return res.status(400).json({ message: "Naudotojo vardas jau užimtas" });
        }
      }

      const updated = await storage.updateUser(userId, {
        username,
        password,
        displayName,
        role,
      });

      if (!updated) {
        return res.status(404).json({ message: "Vartotojas nerastas" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Klaida atnaujinant vartotoją:", error);
      res.status(500).json({ message: "Nepavyko atnaujinti vartotojo" });
    }
  });
}
