import { 
  type User, 
  type InsertUser, 
  type Incident, 
  type InsertIncident,
  type IncidentHistory,
  type InsertIncidentHistory,
  type IncidentStatus,
  type DashboardStats,
  type IncidentFilters,
  type SimilarIncident,
  type IncidentWithDetails,
  type SafeUser,
  incidentStatuses,
  severityLevels,
  incidentCategories,
} from "@shared/schema";
import { randomUUID } from "crypto";

function sanitizeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

export interface IStorage {
  // Users (returns sanitized user without password)
  getUser(id: string): Promise<SafeUser | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>; // Internal use only
  createUser(user: InsertUser): Promise<SafeUser>;
  
  // Incidents
  getIncident(id: string): Promise<Incident | undefined>;
  getIncidentWithDetails(id: string): Promise<IncidentWithDetails | undefined>;
  getAllIncidents(filters?: IncidentFilters): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined>;
  deleteIncident(id: string): Promise<boolean>;
  getIncidentStats(): Promise<DashboardStats>;
  findSimilarIncidents(incidentId: string, description: string): Promise<SimilarIncident[]>;
  
  // Incident History
  getIncidentHistory(incidentId: string): Promise<IncidentHistory[]>;
  createIncidentHistory(history: InsertIncidentHistory): Promise<IncidentHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private incidents: Map<string, Incident>;
  private incidentHistory: Map<string, IncidentHistory>;

  constructor() {
    this.users = new Map();
    this.incidents = new Map();
    this.incidentHistory = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // DEVELOPMENT ONLY: Demo users for testing role-based functionality
    // In production, users would be created through proper authentication flow
    const specialistUser: User = {
      id: "specialist-1",
      username: "john.smith",
      password: "password",
      role: "specialist",
      displayName: "John Smith",
    };
    
    const employeeUser: User = {
      id: "employee-1",
      username: "jane.doe",
      password: "password",
      role: "employee",
      displayName: "Jane Doe",
    };

    const employeeUser2: User = {
      id: "employee-2",
      username: "mike.wilson",
      password: "password",
      role: "employee",
      displayName: "Mike Wilson",
    };

    this.users.set(specialistUser.id, specialistUser);
    this.users.set(employeeUser.id, employeeUser);
    this.users.set(employeeUser2.id, employeeUser2);

    // Create sample incidents for demo
    const sampleIncidents = [
      {
        title: "Email server experiencing intermittent outages",
        description: "The corporate email server has been going down randomly throughout the day. Users are reporting they cannot send or receive emails for periods of 10-15 minutes. This is affecting productivity across all departments.",
        category: "it" as const,
        severity: "high" as const,
        status: "in_progress" as const,
        affectedSystems: ["email", "servers"],
        reportedBy: "employee-1",
        assignedTo: "specialist-1",
        aiTags: ["email", "server outage", "intermittent"],
        aiAnalysis: "This incident appears to be related to server resource exhaustion. Similar incidents have been resolved by scaling server resources or identifying memory leaks.",
      },
      {
        title: "Suspicious login attempts detected from foreign IP",
        description: "Security monitoring detected multiple failed login attempts from IP addresses located in Eastern Europe. The attempts targeted several executive accounts and occurred outside of business hours.",
        category: "cyber" as const,
        severity: "critical" as const,
        status: "new" as const,
        affectedSystems: ["network"],
        reportedBy: "employee-2",
        assignedTo: null,
        aiTags: ["brute force", "unauthorized access", "security threat"],
        aiAnalysis: null,
      },
      {
        title: "VPN connection dropping frequently for remote workers",
        description: "Multiple remote employees have reported that their VPN connections are dropping several times per day. This started after the recent network maintenance window.",
        category: "it" as const,
        severity: "medium" as const,
        status: "assigned" as const,
        affectedSystems: ["network", "workstation"],
        reportedBy: "employee-1",
        assignedTo: "specialist-1",
        aiTags: ["VPN", "connectivity", "remote work"],
        aiAnalysis: null,
      },
      {
        title: "Database performance degradation on production server",
        description: "The main production database is experiencing slow query times. Average response time has increased from 50ms to 500ms. This is impacting customer-facing applications.",
        category: "it" as const,
        severity: "high" as const,
        status: "resolved" as const,
        affectedSystems: ["database", "servers"],
        reportedBy: "employee-2",
        assignedTo: "specialist-1",
        aiTags: ["database", "performance", "slow queries"],
        aiAnalysis: "Query optimization and index tuning resolved this issue. Added missing indexes on frequently queried columns.",
      },
      {
        title: "Phishing email campaign targeting finance department",
        description: "Several employees in the finance department received phishing emails that appeared to be from the CEO requesting wire transfers. One employee clicked the link but did not enter credentials.",
        category: "cyber" as const,
        severity: "high" as const,
        status: "closed" as const,
        affectedSystems: ["email"],
        reportedBy: "employee-1",
        assignedTo: "specialist-1",
        aiTags: ["phishing", "social engineering", "finance"],
        aiAnalysis: "Phishing campaign blocked. Additional email filtering rules implemented. Affected users notified and passwords reset.",
      },
    ];

    for (const incidentData of sampleIncidents) {
      const id = randomUUID();
      const now = new Date();
      const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      const incident: Incident = {
        id,
        ...incidentData,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        resolvedAt: incidentData.status === "resolved" || incidentData.status === "closed" 
          ? new Date(createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)
          : null,
      };
      
      this.incidents.set(id, incident);
      
      // Add creation history
      const historyId = randomUUID();
      const history: IncidentHistory = {
        id: historyId,
        incidentId: id,
        action: "created",
        previousStatus: null,
        newStatus: "new",
        performedBy: incidentData.reportedBy,
        notes: null,
        createdAt,
      };
      this.incidentHistory.set(historyId, history);
    }
  }

  // User methods
  async getUser(id: string): Promise<SafeUser | undefined> {
    const user = this.users.get(id);
    return user ? sanitizeUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Returns full user with password for auth purposes (internal use only)
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<SafeUser> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return sanitizeUser(user);
  }

  // Incident methods
  async getIncident(id: string): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async getIncidentWithDetails(id: string): Promise<IncidentWithDetails | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;

    const reporter = await this.getUser(incident.reportedBy);
    const assignee = incident.assignedTo ? await this.getUser(incident.assignedTo) : undefined;
    const history = await this.getIncidentHistory(id);
    const similarIncidents = await this.findSimilarIncidents(id, incident.description);

    return {
      ...incident,
      reporter,
      assignee,
      history,
      similarIncidents,
    };
  }

  async getAllIncidents(filters?: IncidentFilters): Promise<Incident[]> {
    let incidents = Array.from(this.incidents.values());

    if (filters) {
      if (filters.status?.length) {
        incidents = incidents.filter((i) => filters.status!.includes(i.status));
      }
      if (filters.category?.length) {
        incidents = incidents.filter((i) => filters.category!.includes(i.category));
      }
      if (filters.severity?.length) {
        incidents = incidents.filter((i) => filters.severity!.includes(i.severity));
      }
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        incidents = incidents.filter((i) => new Date(i.createdAt) >= fromDate);
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        incidents = incidents.filter((i) => new Date(i.createdAt) <= toDate);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        incidents = incidents.filter(
          (i) =>
            i.title.toLowerCase().includes(searchLower) ||
            i.description.toLowerCase().includes(searchLower)
        );
      }
    }

    // Sort by created date descending
    return incidents.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const id = randomUUID();
    const now = new Date();
    
    const incident: Incident = {
      id,
      title: insertIncident.title,
      description: insertIncident.description,
      category: insertIncident.category,
      severity: insertIncident.severity,
      status: "new",
      affectedSystems: insertIncident.affectedSystems || null,
      reportedBy: insertIncident.reportedBy,
      assignedTo: null,
      aiTags: null,
      aiAnalysis: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };
    
    this.incidents.set(id, incident);

    // Create history entry
    await this.createIncidentHistory({
      incidentId: id,
      action: "created",
      previousStatus: null,
      newStatus: "new",
      performedBy: insertIncident.reportedBy,
      notes: null,
    });

    return incident;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (!incident) return undefined;

    const updatedIncident: Incident = {
      ...incident,
      ...updates,
      updatedAt: new Date(),
    };

    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  async deleteIncident(id: string): Promise<boolean> {
    return this.incidents.delete(id);
  }

  async getIncidentStats(): Promise<DashboardStats> {
    const incidents = Array.from(this.incidents.values());
    
    const byStatus: Record<IncidentStatus, number> = {
      new: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    const bySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const byCategory: Record<string, number> = {
      it: 0,
      cyber: 0,
    };

    for (const incident of incidents) {
      byStatus[incident.status]++;
      bySeverity[incident.severity]++;
      byCategory[incident.category]++;
    }

    return {
      total: incidents.length,
      byStatus,
      bySeverity,
      byCategory,
    };
  }

  async findSimilarIncidents(incidentId: string, description: string): Promise<SimilarIncident[]> {
    const incidents = Array.from(this.incidents.values())
      .filter((i) => i.id !== incidentId);

    // Simple keyword-based similarity (in production, use embeddings)
    const keywords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const similar: SimilarIncident[] = [];
    
    for (const incident of incidents) {
      const incidentWords = (incident.title + " " + incident.description).toLowerCase().split(/\s+/);
      const matchCount = keywords.filter((k) => incidentWords.some((w) => w.includes(k))).length;
      const similarity = matchCount / Math.max(keywords.length, 1);
      
      if (similarity > 0.15) {
        similar.push({
          id: incident.id,
          title: incident.title,
          description: incident.description.slice(0, 150) + "...",
          status: incident.status,
          similarity: Math.min(similarity * 1.5, 0.95),
          resolvedAt: incident.resolvedAt,
        });
      }
    }

    return similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  // Incident History methods
  async getIncidentHistory(incidentId: string): Promise<IncidentHistory[]> {
    return Array.from(this.incidentHistory.values())
      .filter((h) => h.incidentId === incidentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createIncidentHistory(insertHistory: InsertIncidentHistory): Promise<IncidentHistory> {
    const id = randomUUID();
    const history: IncidentHistory = {
      id,
      ...insertHistory,
      createdAt: new Date(),
    };
    this.incidentHistory.set(id, history);
    return history;
  }
}

export const storage = new MemStorage();
