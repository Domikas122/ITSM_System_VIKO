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
  // Vartotojai (grąžina išvalytą vartotoją be slaptažodžio)
  getUser(id: string): Promise<SafeUser | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>; // Tik vidiniam naudojimui
  createUser(user: InsertUser): Promise<SafeUser>;
  
  // Incidentai
  getIncident(id: string): Promise<Incident | undefined>;
  getIncidentWithDetails(id: string): Promise<IncidentWithDetails | undefined>;
  getAllIncidents(filters?: IncidentFilters): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | undefined>;
  deleteIncident(id: string): Promise<boolean>;
  getIncidentStats(): Promise<DashboardStats>;
  findSimilarIncidents(incidentId: string, description: string): Promise<SimilarIncident[]>;
  
  // Incidentų istorija
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
    // TIK KŪRIMAS: Demo naudotojai, skirti vaidmenų pagrįsto funkcionalumo testavimui
    // Gamybos procese vartotojai būtų kuriamai per tinkamą autentifikavimo procesą.
    const specialistUser: User = {
      id: "specialist-1",
      username: "dom.kop",
      password: "mkl23MKL",
      role: "IT_specialistas",
      displayName: "Dominykas Kopijevas",
    };
    
    const employeeUser: User = {
      id: "employee-1",
      username: "ona.mika",
      password: "abc123ABC",
      role: "Darbuotojas",
      displayName: "Ona Mikalauskaitė",
    };

    const employeeUser2: User = {
      id: "employee-2",
      username: "alb.miz",
      password: "jkl456JKL",
      role: "Darbuotojas",
      displayName: "Albas Mizgaitis",
    };

    this.users.set(specialistUser.id, specialistUser);
    this.users.set(employeeUser.id, employeeUser);
    this.users.set(employeeUser2.id, employeeUser2);

    // Sukurti pavyzdinius incidentus demonstravimui
    const sampleIncidents = [
      {
        title: "Elektroninio pašto serveris patiria periodinius veikimo sutrikimus",
        description: "Įmonės elektroninio pašto serveris visą dieną veikia su sutrikimais. Vartotojai praneša, kad 10–15 minučių negali siųsti ir gauti elektroninių laiškų. Tai daro įtaką visų skyrių darbo našumui.",
        category: "IT" as const,
        severity: "Aukštas" as const,
        status: "Vykdomas" as const,
        affectedSystems: ["email", "servers"],
        reportedBy: "employee-1",
        assignedTo: "specialist-1",
        aiTags: ["email", "server outage", "intermittent"],
        aiAnalysis: "Šis incidentas, atrodo, yra susijęs su serverio išteklių išeikvojimu. Panašūs incidentai buvo išspręsti padidinant serverio išteklius arba nustatant atminties nutekėjimus.",
      },
      {
        title: "Įtartini prisijungimo bandymai, aptikti iš užsienio IP adresų",
        description: "Saugumo stebėjimo sistema aptiko kelis nesėkmingus prisijungimo bandymus iš Rytų Europoje esančių IP adresų. Bandymai buvo nukreipti į kelis vadovų paskyras ir vyko ne darbo valandomis.",
        category: "Kibernetinis" as const,
        severity: "Kritinis" as const,
        status: "Naujas" as const,
        affectedSystems: ["network"],
        reportedBy: "employee-2",
        assignedTo: null,
        aiTags: ["brute force", "unauthorized access", "security threat"],
        aiAnalysis: null,
      },
      {
        title: "Nuotoliniai darbuotojai dažnai praranda VPN ryšį",
        description: "Keletas nuotoliniu būdu dirbančių darbuotojų pranešė, kad jų VPN ryšys nutrūksta keletą kartų per dieną. Tai prasidėjo po neseniai atliktų tinklo techninės priežiūros darbų.",
        category: "IT" as const,
        severity: "Vidutinis" as const,
        status: "Paskirtas" as const,
        affectedSystems: ["network", "workstation"],
        reportedBy: "employee-1",
        assignedTo: "specialist-1",
        aiTags: ["VPN", "connectivity", "remote work"],
        aiAnalysis: null,
      },
      {
        title: "Duomenų bazės našumo sumažėjimas gamybos serveryje",
        description: "Pagrindinėje gamybos duomenų bazėje užfiksuotas lėtas užklausų apdorojimas. Vidutinis atsakymo laikas padidėjo nuo 50 ms iki 500 ms. Tai daro įtaką klientams skirtoms programoms.",
        category: "IT" as const,
        severity: "Aukštas" as const,
        status: "Išspręstas" as const,
        affectedSystems: ["database", "servers"],
        reportedBy: "employee-2",
        assignedTo: "specialist-1",
        aiTags: ["database", "performance", "slow queries"],
        aiAnalysis: "Šią problemą išsprendė užklausų optimizavimas ir indeksų derinimas. Pridėti trūkstami indeksai dažnai užklausiamose stulpeliuose.",
      },
      {
        title: "Sukčiavimo elektroninio pašto kampanija, skirta finansų skyriui",
        description: "Keletas finansų skyriaus darbuotojų gavo sukčiavimo laiškus, kurie atrodė esą iš generalinio direktoriaus ir kuriuose buvo prašoma atlikti elektroninius pavedimus. Vienas darbuotojas paspaudė nuorodą, bet neįvedė prisijungimo duomenų.",
        category: "Kibernetinis" as const,
        severity: "Aukštas" as const,
        status: "Uždarytas" as const,
        affectedSystems: ["email"],
        reportedBy: "employee-1",
        assignedTo: "specialist-1",
        aiTags: ["phishing", "social engineering", "finance"],
        aiAnalysis: "Sukčiavimo kampanija užblokuota. Įdiegtos papildomos el. pašto filtravimo taisyklės. Paveikti vartotojai informuoti, slaptažodžiai atkurti.",
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
        resolvedAt: (incidentData.status === "Išspręstas" || incidentData.status === "Uždarytas")
          ? new Date(createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)
          : null,
      };
      
      this.incidents.set(id, incident);
      
      // Pridėti kūrimo istoriją
      const historyId = randomUUID();
      const history: IncidentHistory = {
        id: historyId,
        incidentId: id,
        action: "Sukurtas",
        previousStatus: null,
        newStatus: "Naujas",
        performedBy: incidentData.reportedBy,
        notes: null,
        createdAt,
      };
      this.incidentHistory.set(historyId, history);
    }
  }

  // Vartotojo metodai
  async getUser(id: string): Promise<SafeUser | undefined> {
    const user = this.users.get(id);
    return user ? sanitizeUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Grąžina visą vartotoją su slaptažodžiu autentifikavimo tikslais (tik vidiniam naudojimui)
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<SafeUser> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role === "Darbuotojas" || insertUser.role === "IT_specialistas"
        ? insertUser.role
        : "Darbuotojas" // default or handle error as needed
    };
    this.users.set(id, user);
    return sanitizeUser(user);
  }

  // Incidentų metodai
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

    // Rūšiuoti pagal sukūrimo datą mažėjančia tvarka
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
      category: insertIncident.category as "IT" | "Kibernetinis",
      severity: insertIncident.severity as "Kritinis" | "Aukštas" | "Vidutinis" | "Žemas",
      status: "Naujas",
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

    // Sukurti istorijos įrašą
    await this.createIncidentHistory({
      incidentId: id,
      action: "Sukurtas",
      previousStatus: null,
      newStatus: "Naujas",
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
      Naujas: 0,
      Paskirtas: 0,
      Vykdomas: 0,
      Išspręstas: 0,
      Uždarytas: 0,
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

    // Paprastas panašumas pagal raktažodžius (gamybos procese naudokite įterpimus)
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

  // Incidentų istorijos metodai
  async getIncidentHistory(incidentId: string): Promise<IncidentHistory[]> {
    return Array.from(this.incidentHistory.values())
      .filter((h) => h.incidentId === incidentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createIncidentHistory(insertHistory: InsertIncidentHistory): Promise<IncidentHistory> {
    const id = randomUUID();
    const history: IncidentHistory = {
      id,
      incidentId: insertHistory.incidentId,
      action: insertHistory.action,
      performedBy: insertHistory.performedBy,
      previousStatus: (["Naujas", "Paskirtas", "Vykdomas", "Išspręstas", "Uždarytas"].includes(insertHistory.previousStatus as string)
        ? insertHistory.previousStatus as "Naujas" | "Paskirtas" | "Vykdomas" | "Išspręstas" | "Uždarytas"
        : null),
      newStatus: (["Naujas", "Paskirtas", "Vykdomas", "Išspręstas", "Uždarytas"].includes(insertHistory.newStatus as string) 
        ? insertHistory.newStatus as "Naujas" | "Paskirtas" | "Vykdomas" | "Išspręstas" | "Uždarytas"
        : null),
      notes: insertHistory.notes ?? null,
      createdAt: new Date(),
    };
    this.incidentHistory.set(id, history);
    return history;
  }
}

export const storage = new MemStorage();
