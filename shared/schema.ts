import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const PACKAGE_STATUS = {
  ACTIVE: "active",
  WARNING: "warning",
  CRITICAL: "critical",
  FINISHED: "finished",
  EXPIRED: "expired",
} as const;

export const PACKAGE_STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  warning: "Por terminar",
  critical: "Crítico",
  finished: "Terminado",
  expired: "Expirado",
};

export const ALERT_TYPES = {
  YELLOW: "yellow",
  RED: "red",
  PRIORITY_RED: "priority_red",
  EXPIRED: "expired",
  EXPIRING_SOON: "expiring_soon",
} as const;

export const ATTENDANCE_STATUS = {
  ATTENDED: "attended",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export const therapyTypes = pgTable("therapy_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull(),
});

export const therapists = pgTable("therapists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  specialties: text("specialties").array(),
  avatarInitials: text("avatar_initials").notNull(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  emergencyContact: text("emergency_contact").notNull(),
  emergencyPhone: text("emergency_phone").notNull(),
  status: text("status").notNull().default("active"),
  assignedTherapistId: varchar("assigned_therapist_id"),
  avatarInitials: text("avatar_initials").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  therapistId: varchar("therapist_id").notNull(),
  therapyTypeId: varchar("therapy_type_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  therapistId: varchar("therapist_id").notNull(),
  therapyTypeId: varchar("therapy_type_id").notNull(),
  protocolAssignmentId: varchar("protocol_assignment_id"),
  sessionDate: timestamp("session_date").notNull(),
  duration: text("duration").notNull(),
  notes: text("notes"),
  observations: text("observations"),
  progress: text("progress"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const protocols = pgTable("protocols", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  therapyTypeId: varchar("therapy_type_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  objectives: text("objectives"),
  totalSessions: integer("total_sessions").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const protocolAssignments = pgTable("protocol_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  protocolId: varchar("protocol_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  completedSessions: integer("completed_sessions").notNull().default(0),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("therapist"),
  therapistId: varchar("therapist_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const clinicalHistories = pgTable("clinical_histories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().unique(),
  fecha: timestamp("fecha").notNull(),
  recomendacion: text("recomendacion"),
  
  peso: text("peso"),
  estatura: text("estatura"),
  
  padecimientoActual: text("padecimiento_actual"),
  tratamientoPrevio: text("tratamiento_previo"),
  
  tratamientoRestaurativo: json("tratamiento_restaurativo").$type<Record<string, { tiene: boolean; especifique: string }>>(),
  antecedentesPatologicos: json("antecedentes_patologicos").$type<Record<string, { tiene: boolean; especifique: string }>>(),
  habitosSalud: json("habitos_salud").$type<{ tiene: boolean; especifique: string }>(),
  sintomatologia: json("sintomatologia").$type<{
    dolor: { tiene: boolean; tipo: string; frecuencia: string };
    inflamacion: { tiene: boolean; tipo: string; frecuencia: string };
    adormecimiento: { tiene: boolean; tipo: string; frecuencia: string };
    hormigueo: { tiene: boolean };
  }>(),
  
  diagnosticosPrevios: text("diagnosticos_previos").array(),
  medicosTratantes: text("medicos_tratantes").array(),
  
  estudiosRealizados: json("estudios_realizados").$type<Record<string, boolean>>(),
  nivelDolor: integer("nivel_dolor"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at"),
});

export const therapyPackages = pgTable("therapy_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  totalSessions: integer("total_sessions").notNull(),
  sessionsUsed: integer("sessions_used").notNull().default(0),
  purchaseDate: timestamp("purchase_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  price: numeric("price", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at"),
});

export const packageAlerts = pgTable("package_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  alertType: text("alert_type").notNull(),
  message: text("message").notNull(),
  method: text("method").notNull().default("panel"),
  isRead: text("is_read").notNull().default("false"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const packageSessions = pgTable("package_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageId: varchar("package_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  sessionDate: timestamp("session_date").notNull(),
  sessionType: text("session_type"),
  attendanceStatus: text("attendance_status").notNull().default("attended"),
  therapistId: varchar("therapist_id"),
  notes: text("notes"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertTherapyTypeSchema = createInsertSchema(therapyTypes).omit({
  id: true,
});

export const insertTherapistSchema = createInsertSchema(therapists).omit({
  id: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  avatarInitials: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertProtocolSchema = createInsertSchema(protocols).omit({
  id: true,
  createdAt: true,
}).extend({
  totalSessions: z.number().int().min(1, "Debe tener al menos 1 sesión"),
});

export const insertProtocolAssignmentSchema = createInsertSchema(protocolAssignments).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.enum(["active", "completed", "cancelled"]).default("active"),
  completedSessions: z.number().int().min(0, "No puede ser negativo").default(0),
});

export const USER_ROLES = {
  DIRECTOR: "director",
  THERAPIST: "therapist", 
  COORDINATOR: "coordinator",
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  director: "Director Clínico",
  therapist: "Terapeuta",
  coordinator: "Coordinador(a)",
  admin: "Administrador",
};

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  role: z.enum(["director", "therapist", "coordinator", "admin"]).default("therapist"),
});

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: z.enum(["director", "therapist", "coordinator"]),
  therapistId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const insertClinicalHistorySchema = createInsertSchema(clinicalHistories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  nivelDolor: z.number().int().min(0).max(10).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type TherapyType = typeof therapyTypes.$inferSelect;
export type InsertTherapyType = z.infer<typeof insertTherapyTypeSchema>;

export type Therapist = typeof therapists.$inferSelect;
export type InsertTherapist = z.infer<typeof insertTherapistSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;

export type ProtocolAssignment = typeof protocolAssignments.$inferSelect;
export type InsertProtocolAssignment = z.infer<typeof insertProtocolAssignmentSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type ClinicalHistory = typeof clinicalHistories.$inferSelect;
export type InsertClinicalHistory = z.infer<typeof insertClinicalHistorySchema>;
