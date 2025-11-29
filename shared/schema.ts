import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Incident status workflow: New → Assigned → In Progress → Resolved → Closed
export const incidentStatuses = ["new", "assigned", "in_progress", "resolved", "closed"] as const;
export type IncidentStatus = typeof incidentStatuses[number];

// Incident categories
export const incidentCategories = ["it", "cyber"] as const;
export type IncidentCategory = typeof incidentCategories[number];

// Severity levels
export const severityLevels = ["critical", "high", "medium", "low"] as const;
export type SeverityLevel = typeof severityLevels[number];

// User roles
export const userRoles = ["employee", "specialist"] as const;
export type UserRole = typeof userRoles[number];

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<UserRole>().notNull().default("employee"),
  displayName: text("display_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Incidents table
export const incidents = pgTable("incidents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").$type<IncidentCategory>().notNull(),
  severity: text("severity").$type<SeverityLevel>().notNull(),
  status: text("status").$type<IncidentStatus>().notNull().default("new"),
  affectedSystems: text("affected_systems").array(),
  reportedBy: varchar("reported_by", { length: 36 }).notNull(),
  assignedTo: varchar("assigned_to", { length: 36 }),
  aiTags: text("ai_tags").array(),
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
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
export const incidentHistory = pgTable("incident_history", {
  id: varchar("id", { length: 36 }).primaryKey(),
  incidentId: varchar("incident_id", { length: 36 }).notNull(),
  action: text("action").notNull(),
  previousStatus: text("previous_status").$type<IncidentStatus>(),
  newStatus: text("new_status").$type<IncidentStatus>(),
  performedBy: varchar("performed_by", { length: 36 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIncidentHistorySchema = createInsertSchema(incidentHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertIncidentHistory = z.infer<typeof insertIncidentHistorySchema>;
export type IncidentHistory = typeof incidentHistory.$inferSelect;

// Form validation schemas
export const createIncidentFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum(incidentCategories),
  severity: z.enum(severityLevels),
  affectedSystems: z.array(z.string()).optional(),
});

export type CreateIncidentForm = z.infer<typeof createIncidentFormSchema>;

// Safe user type (without password) for API responses
export type SafeUser = Omit<User, 'password'>;

// API response types
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
