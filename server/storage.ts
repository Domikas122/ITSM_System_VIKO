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
  users,
  incidents,
  incidentHistory as incidentHistoryTable,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db, initializeDatabase } from "./db";
import { eq, and, gte, lte, like, or, desc, ne } from "drizzle-orm";

function sanitizeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

export interface IStorage {
  // Vartotojai (grąžina išvalytą vartotoją be slaptažodžio)
  getUser(id: string): Promise<SafeUser | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>; // Tik vidiniam naudojimui
  getUsersByRole(role: string): Promise<SafeUser[]>;
  createUser(user: InsertUser): Promise<SafeUser>;
  getAllUsers(): Promise<SafeUser[]>;
  
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
  constructor() {
    console.log("🔧 Initializing MemStorage...");
    initializeDatabase();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    console.log("🔄 Checking for existing data...");

    // Check if users already exist
    const existingUsers = db.select().from(users).all();
    console.log(`📊 Found ${existingUsers.length} existing users`);
    
    if (existingUsers.length > 0) {
      console.log("✅ Database already has data, skipping initialization");
      return;
    }

    console.log("📦 Initializing demo data...");

    // TIK KŪRIMAS: Demo naudotojai, skirti vaidmenų pagrįsto funkcionalumo testavimui
    // Gamybos procese vartotojai būtų kuriamai per tinkamą autentifikavimo procesą.
    const demoUsers: User[] = [
      {
        id: "specialist-1",
        username: "domikas122",
        password: "mkl123MKL",
        role: "IT_specialistas",
        displayName: "Dominykas Kopijevas",
      },
      {
        id: "employee-1",
        username: "ona.mika",
        password: "abc123ABC",
        role: "Darbuotojas",
        displayName: "Ona Mikalauskaitė",
      },
      {
        id: "employee-2",
        username: "alb.miz",
        password: "jkl456JKL",
        role: "Darbuotojas",
        displayName: "Albas Mizgaitis",
      },
      {
        id: "employee-3",
        username: "var.pav",
        password: "abc123ABC",
        role: "Darbuotojas",
        displayName: "Varėnė Pavilionienė",
      },
    ];

    // Insert demo users
    for (const user of demoUsers) {
      db.insert(users).values(user).run();
    }

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
      
      db.insert(incidents).values(incident).run();
      
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
      db.insert(incidentHistoryTable).values(history).run();
    }

    console.log("✅ Demo data initialized");
  }

  // Vartotojo metodai
  async getUser(id: string): Promise<SafeUser | undefined> {
    const user = db.select().from(users).where(eq(users.id, id)).get();
    return user ? sanitizeUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Grąžina visą vartotoją su slaptažodžiu autentifikavimo tikslais (tik vidiniam naudojimui)
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  async getUsersByRole(role: string): Promise<SafeUser[]> {
    const roleUsers = db.select().from(users).where(eq(users.role, role as any)).all();
    return roleUsers.map(sanitizeUser);
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
    db.insert(users).values(user).run();
    return sanitizeUser(user);
  }

  async getAllUsers(): Promise<SafeUser[]> {
    const allUsers = db.select().from(users).all();
    return allUsers.map(sanitizeUser);
  }

  // Incidentų metodai
  async getIncident(id: string): Promise<Incident | undefined> {
    return db.select().from(incidents).where(eq(incidents.id, id)).get();
  }

  async getIncidentWithDetails(id: string): Promise<IncidentWithDetails | undefined> {
    const incident = await this.getIncident(id);
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
    let query = db.select().from(incidents);
    const conditions = [];

    if (filters) {
      if (filters.status?.length) {
        conditions.push(or(...filters.status.map(s => eq(incidents.status, s))));
      }
      if (filters.category?.length) {
        conditions.push(or(...filters.category.map(c => eq(incidents.category, c))));
      }
      if (filters.severity?.length) {
        conditions.push(or(...filters.severity.map(s => eq(incidents.severity, s))));
      }
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        conditions.push(gte(incidents.createdAt, fromDate));
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        conditions.push(lte(incidents.createdAt, toDate));
      }
      if (filters.search) {
        const searchPattern = `%${filters.search}%`;
        conditions.push(
          or(
            like(incidents.title, searchPattern),
            like(incidents.description, searchPattern)
          )
        );
      }
    }

    let result = conditions.length > 0 
      ? query.where(and(...conditions)).orderBy(desc(incidents.createdAt)).all()
      : query.orderBy(desc(incidents.createdAt)).all();

    return result;
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
      affectedSystems: (insertIncident.affectedSystems as string[]) || null,
      reportedBy: insertIncident.reportedBy,
      assignedTo: null,
      aiTags: null,
      aiAnalysis: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };
    
    db.insert(incidents).values(incident).run();

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
    const incident = await this.getIncident(id);
    if (!incident) return undefined;

    const updatedIncident: Incident = {
      ...incident,
      ...updates,
      updatedAt: new Date(),
    };

    db.update(incidents)
      .set(updatedIncident)
      .where(eq(incidents.id, id))
      .run();
    
    return updatedIncident;
  }

  async deleteIncident(id: string): Promise<boolean> {
    const result = db.delete(incidents).where(eq(incidents.id, id)).run();
    return result.changes > 0;
  }

  async getIncidentStats(): Promise<DashboardStats> {
    const allIncidents = db.select().from(incidents).all();
    
    const byStatus: Record<IncidentStatus, number> = {
      Naujas: 0,
      Paskirtas: 0,
      Vykdomas: 0,
      Išspręstas: 0,
      Uždarytas: 0,
    };

    const bySeverity: Record<string, number> = {
      Kritinis: 0,
      Aukštas: 0,
      Vidutinis: 0,
      Žemas: 0,
    };

    const byCategory: Record<string, number> = {
      IT: 0,
      Kibernetinis: 0,
    };

    for (const incident of allIncidents) {
      byStatus[incident.status]++;
      bySeverity[incident.severity]++;
      byCategory[incident.category]++;
    }

    return {
      total: allIncidents.length,
      byStatus,
      bySeverity,
      byCategory,
    };
  }

  async findSimilarIncidents(incidentId: string, description: string): Promise<SimilarIncident[]> {
    const allIncidents = db.select().from(incidents).where(ne(incidents.id, incidentId)).all();

    // Paprastas panašumas pagal raktažodžius (gamybos procese naudokite įterpimus)
    const keywords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const similar: SimilarIncident[] = [];
    
    for (const incident of allIncidents) {
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
    return db.select()
      .from(incidentHistoryTable)
      .where(eq(incidentHistoryTable.incidentId, incidentId))
      .orderBy(desc(incidentHistoryTable.createdAt))
      .all();
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
    db.insert(incidentHistoryTable).values(history).run();
    return history;
  }
}

export const storage = new MemStorage();
