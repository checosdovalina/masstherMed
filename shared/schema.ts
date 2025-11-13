import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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
