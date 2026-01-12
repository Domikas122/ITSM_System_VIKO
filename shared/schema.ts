import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Incident status workflow: Naujas → Paskirtas → Vykdomas → Išspręstas → Uždarytas
export const incidentStatuses = ["Naujas", "Paskirtas", "Vykdomas", "Išspręstas", "Uždarytas"] as const;
export type IncidentStatus = typeof incidentStatuses[number];

// Incident categories
export const incidentCategories = ["IT", "Kibernetinis"] as const;
export type IncidentCategory = typeof incidentCategories[number];

// Severity levels
export const severityLevels = ["Kritinis", "Aukštas", "Vidutinis", "Žemas"] as const;
export type SeverityLevel = typeof severityLevels[number];

// User roles
export const userRoles = ["Darbuotojas", "IT_specialistas"] as const;
export type UserRole = typeof userRoles[number];

// Users table
export const users = sqliteTable("users", {
  id: text("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").$type<UserRole>().notNull().default("Darbuotojas"),
  displayName: text("display_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Incidentų lentelė
export const incidents = sqliteTable("incidents", {
  id: text("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").$type<IncidentCategory>().notNull(),
  severity: text("severity").$type<SeverityLevel>().notNull(),
  status: text("status").$type<IncidentStatus>().notNull().default("Naujas"),
  affectedSystems: text("affected_systems", { mode: "json" }).$type<string[] | null>(),
  reportedBy: text("reported_by", { length: 36 }).notNull(),
  assignedTo: text("assigned_to", { length: 36 }),
  aiTags: text("ai_tags", { mode: "json" }).$type<string[] | null>(),
  aiAnalysis: text("ai_analysis"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  resolvedAt: true,
  aiTags: true,
  aiAnalysis: true,
  status: true,
  assignedTo: true,
});

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;

// Incident history for tracking changes
export const incidentHistory = sqliteTable("incident_history", {
  id: text("id", { length: 36 }).primaryKey(),
  incidentId: text("incident_id", { length: 36 }).notNull(),
  action: text("action").notNull(),
  previousStatus: text("previous_status").$type<IncidentStatus>(),
  newStatus: text("new_status").$type<IncidentStatus>(),
  performedBy: text("performed_by", { length: 36 }).notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertIncidentHistorySchema = createInsertSchema(incidentHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertIncidentHistory = z.infer<typeof insertIncidentHistorySchema>;
export type IncidentHistory = typeof incidentHistory.$inferSelect;

// Formos patvirtinimo schemos
export const createIncidentFormSchema = z.object({
  title: z.string().min(5, "Pavadinimas turi būti ne trumpesnis kaip 5 simboliai"),
  description: z.string().min(20, "Aprašymas turi būti ne trumpesnis kaip 20 simbolių"),
  category: z.enum(incidentCategories),
  severity: z.enum(severityLevels),
  affectedSystems: z.array(z.string()).optional(),
});

export type CreateIncidentForm = z.infer<typeof createIncidentFormSchema>;

// Saugus vartotojo tipas (be slaptažodžio) API atsakymams
export type SafeUser = Omit<User, 'password'>;

// API atsakymų tipai
export interface IncidentWithDetails extends Incident {
  reporter?: SafeUser;
  assignee?: SafeUser;
  history?: IncidentHistory[];
  similarIncidents?: SimilarIncident[];
}

export interface SimilarIncident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  similarity: number;
  resolvedAt?: Date | null;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<IncidentStatus, number>;
  bySeverity: Record<SeverityLevel, number>;
  byCategory: Record<IncidentCategory, number>;
}

export interface IncidentFilters {
  status?: IncidentStatus[];
  category?: IncidentCategory[];
  severity?: SeverityLevel[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
