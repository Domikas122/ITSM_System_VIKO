import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeIncident } from "./openai";
import { 
  insertIncidentSchema,
  type IncidentStatus,
  type IncidentFilters,
  incidentStatuses,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get dashboard stats
  app.get("/api/incidents/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getIncidentStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get all incidents with optional filters
  app.get("/api/incidents", async (req: Request, res: Response) => {
    try {
      const filters: IncidentFilters = {};
      
      const { status, category, severity, dateFrom, dateTo, search, reportedBy } = req.query;
      
      if (status) filters.status = (status as string).split(",") as IncidentStatus[];
      if (category) filters.category = (category as string).split(",") as any[];
      if (severity) filters.severity = (severity as string).split(",") as any[];
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;
      if (search) filters.search = search as string;

      let incidents = await storage.getAllIncidents(filters);
      
      // Filter by reportedBy if provided (for employee view)
      if (reportedBy) {
        incidents = incidents.filter((i) => i.reportedBy === reportedBy);
      }

      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  // Get single incident with details
  app.get("/api/incidents/:id", async (req: Request, res: Response) => {
    try {
      const incident = await storage.getIncidentWithDetails(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      console.error("Error fetching incident:", error);
      res.status(500).json({ message: "Failed to fetch incident" });
    }
  });

  // Create new incident
  app.post("/api/incidents", async (req: Request, res: Response) => {
    try {
      const validation = insertIncidentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const incident = await storage.createIncident(validation.data);
      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  // Update incident status
  app.patch("/api/incidents/:id/status", async (req: Request, res: Response) => {
    try {
      const { status, notes, performedBy } = req.body;
      
      if (!status || !incidentStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      const previousStatus = incident.status;
      const updates: any = { status };

      // Set resolvedAt when status changes to resolved
      if (status === "resolved" && previousStatus !== "resolved") {
        updates.resolvedAt = new Date();
      }

      // Set assignedTo when status changes to assigned
      if (status === "assigned" && !incident.assignedTo) {
        updates.assignedTo = performedBy;
      }

      const updatedIncident = await storage.updateIncident(req.params.id, updates);

      // Create history entry
      await storage.createIncidentHistory({
        incidentId: req.params.id,
        action: "status_change",
        previousStatus,
        newStatus: status,
        performedBy: performedBy || "system",
        notes: notes || null,
      });

      res.json(updatedIncident);
    } catch (error) {
      console.error("Error updating incident status:", error);
      res.status(500).json({ message: "Failed to update incident status" });
    }
  });

  // Assign incident
  app.patch("/api/incidents/:id/assign", async (req: Request, res: Response) => {
    try {
      const { assignedTo, performedBy } = req.body;

      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      const previousStatus = incident.status;
      const updatedIncident = await storage.updateIncident(req.params.id, {
        assignedTo,
        status: "assigned",
      });

      // Create history entry
      await storage.createIncidentHistory({
        incidentId: req.params.id,
        action: "assigned",
        previousStatus,
        newStatus: "assigned",
        performedBy: performedBy || "system",
        notes: `Assigned to specialist`,
      });

      res.json(updatedIncident);
    } catch (error) {
      console.error("Error assigning incident:", error);
      res.status(500).json({ message: "Failed to assign incident" });
    }
  });

  // Analyze incident with AI
  app.post("/api/incidents/:id/analyze", async (req: Request, res: Response) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        // Return mock analysis when no API key
        const mockAnalysis = {
          tags: ["network", "connectivity", "investigation"],
          analysis: "This incident requires further investigation. Based on the description, it appears to be related to network connectivity issues. Recommend checking network infrastructure and reviewing recent changes.",
        };

        const updatedIncident = await storage.updateIncident(req.params.id, {
          aiTags: mockAnalysis.tags,
          aiAnalysis: mockAnalysis.analysis,
        });

        return res.json(updatedIncident);
      }

      const analysis = await analyzeIncident(
        incident.title,
        incident.description,
        incident.category,
        incident.severity
      );

      const updatedIncident = await storage.updateIncident(req.params.id, {
        aiTags: analysis.tags,
        aiAnalysis: analysis.analysis,
      });

      res.json(updatedIncident);
    } catch (error) {
      console.error("Error analyzing incident:", error);
      res.status(500).json({ message: "Failed to analyze incident" });
    }
  });

  // Get incident history
  app.get("/api/incidents/:id/history", async (req: Request, res: Response) => {
    try {
      const history = await storage.getIncidentHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching incident history:", error);
      res.status(500).json({ message: "Failed to fetch incident history" });
    }
  });

  return httpServer;
}
