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
  
  // Informacijos suvestinės statistiniai duomenys
  app.get("/api/incidents/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getIncidentStats();
      res.json(stats);
    } catch (error) {
      console.error("Klaida gaunant statistinius duomenis:", error);
      res.status(500).json({ message: "Nepavyko gauti statistikos" });
    }
  });

  // Gauti visus incidentus su optional filtrais
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
      
      // Filtruoti pagal „reportedBy“, jei nurodyta (darbuotojo peržiūrai)
      if (reportedBy) {
        incidents = incidents.filter((i) => i.reportedBy === reportedBy);
      }

      res.json(incidents);
    } catch (error) {
      console.error("Klaida gaunant incidentus:", error);
      res.status(500).json({ message: "Nepavyko gauti incidentų" });
    }
  });

  // Gauti vieną incidentą su detalėmis
  app.get("/api/incidents/:id", async (req: Request, res: Response) => {
    try {
      const incident = await storage.getIncidentWithDetails(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incidentas nerastas" });
      }
      res.json(incident);
    } catch (error) {
      console.error("Klaida gaunant incidentą:", error);
      res.status(500).json({ message: "Nepavyko gauti incidento" });
    }
  });

  // Sukurti naują incidentą
  app.post("/api/incidents", async (req: Request, res: Response) => {
    try {
      const validation = insertIncidentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Patvirtinimas nepavyko", 
          errors: validation.error.errors 
        });
      }

      const incident = await storage.createIncident(validation.data);
      
      
      res.status(201).json(incident);
    } catch (error) {
      console.error("Klaida kuriant incidentą:", error);
      res.status(500).json({ message: "Nepavyko sukurti incidento" });
    }
  });

  // Atnaujinti incidento būseną
  app.patch("/api/incidents/:id/status", async (req: Request, res: Response) => {
    try {
      const { status, notes, performedBy } = req.body;
      
      if (!status || !incidentStatuses.includes(status)) {
        return res.status(400).json({ message: "Neteisingas statusas" });
      }

      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incidentas nerastas" });
      }

      const previousStatus = incident.status;
      const updates: any = { status };

      // Nustatyti išspręsta, kai statusas pasikeičia į išsprestą
      if (status === "Išspręstas" && previousStatus !== "Išspręstas") {
        updates.resolvedAt = new Date();
      }

      // Nustatyti priskirtas, kai statusas pasikeičia į priskirtas
      if (status === "priskirta" && !incident.assignedTo) {
        updates.assignedTo = performedBy;
      }

      const updatedIncident = await storage.updateIncident(req.params.id, updates);

      // Sukurti istorijos įrašą
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
      console.error("Klaida atnaujinant incidento būseną:", error);
      res.status(500).json({ message: "Nepavyko atnaujinti incidento būsenos" });
    }
  });

  // Paskirti incidentą
  app.patch("/api/incidents/:id/assign", async (req: Request, res: Response) => {
    try {
      const { assignedTo, performedBy } = req.body;

      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incidentas nerastas" });
      }

      const previousStatus = incident.status;
      const updatedIncident = await storage.updateIncident(req.params.id, {
        assignedTo,
        status: "Paskirtas",
      });

      // Sukurti istorijos įrašą
      await storage.createIncidentHistory({
        incidentId: req.params.id,
        action: "priskirimas",
        previousStatus,
        newStatus: "priskirtas",
        performedBy: performedBy || "system",
        notes: `Priskirta specialistui`,
      });

      // Send email notification to assigned specialist
      try {
        const assignedSpecialist = await storage.getUser(assignedTo);
        const performer = await storage.getUser(performedBy);
        
        if (assignedSpecialist) {
          await sendIncidentAssignedNotification(
            assignedSpecialist.email || assignedSpecialist.username,
            incident.id,
            incident.title,
            performer?.displayName || performedBy || "System"
          );
        }
      } catch (emailError) {
        console.error("Failed to send assignment email notification:", emailError);
      }

      res.json(updatedIncident);
    } catch (error) {
      console.error("Klaida priskiriant incidentą:", error);
      res.status(500).json({ message: "Nepavyko priskirti incidento" });
    }
  });

  // Analizuoti incidentą naudojant AI
  app.post("/api/incidents/:id/analyze", async (req: Request, res: Response) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incidentas nerastas" });
      }

      // Ar OpenAI API raktas yra sukonfigūruotas
      if (!process.env.OPENAI_API_KEY) {
        // Grąžinti fiktyvią analizę, kai nėra API rakto
        const mockAnalysis = {
          tags: ["network", "connectivity", "investigation"],
          analysis: "Šis incidentas reikalauja tolesnio tyrimo. Remiantis aprašymu, atrodo, kad jis susijęs su tinklo ryšio problemomis. Rekomenduojama patikrinti tinklo infrastruktūrą ir peržiūrėti naujausius pakeitimus.",
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
      console.error("Klaida analizuojant incidentą:", error);
      res.status(500).json({ message: "Nepavyko analizuoti incidento" });
    }
  });

  // Gauti incidentų istoriją
  app.get("/api/incidents/:id/history", async (req: Request, res: Response) => {
    try {
      const history = await storage.getIncidentHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Klaida gaunant incidentų istoriją:", error);
      res.status(500).json({ message: "Nepavyko gauti incidentų istorijos" });
    }
  });

  return httpServer;
}
