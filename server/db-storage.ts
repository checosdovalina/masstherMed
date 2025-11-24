import { 
  type TherapyType, type InsertTherapyType,
  type Therapist, type InsertTherapist,
  type Patient, type InsertPatient,
  type Appointment, type InsertAppointment,
  type Session, type InsertSession,
  type Protocol, type InsertProtocol,
  type ProtocolAssignment, type InsertProtocolAssignment,
  type User, type InsertUser,
  type ClinicalHistory, type InsertClinicalHistory,
  therapyTypes, therapists, patients, appointments, sessions, 
  protocols, protocolAssignments, users, clinicalHistories
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  async getTherapyTypes(): Promise<TherapyType[]> {
    return await db.select().from(therapyTypes);
  }

  async getTherapyType(id: string): Promise<TherapyType | undefined> {
    const result = await db.select().from(therapyTypes).where(eq(therapyTypes.id, id));
    return result[0];
  }

  async createTherapyType(therapyType: InsertTherapyType): Promise<TherapyType> {
    const result = await db.insert(therapyTypes).values(therapyType).returning();
    return result[0];
  }

  async updateTherapyType(id: string, updates: Partial<InsertTherapyType>): Promise<TherapyType | undefined> {
    const result = await db.update(therapyTypes).set(updates).where(eq(therapyTypes.id, id)).returning();
    return result[0];
  }

  async deleteTherapyType(id: string): Promise<boolean> {
    const result = await db.delete(therapyTypes).where(eq(therapyTypes.id, id)).returning();
    return result.length > 0;
  }

  async getTherapists(): Promise<Therapist[]> {
    return await db.select().from(therapists);
  }

  async getTherapist(id: string): Promise<Therapist | undefined> {
    const result = await db.select().from(therapists).where(eq(therapists.id, id));
    return result[0];
  }

  async createTherapist(therapist: InsertTherapist): Promise<Therapist> {
    const result = await db.insert(therapists).values(therapist).returning();
    return result[0];
  }

  async updateTherapist(id: string, updates: Partial<InsertTherapist>): Promise<Therapist | undefined> {
    const result = await db.update(therapists).set(updates).where(eq(therapists.id, id)).returning();
    return result[0];
  }

  async deleteTherapist(id: string): Promise<boolean> {
    const result = await db.delete(therapists).where(eq(therapists.id, id)).returning();
    return result.length > 0;
  }

  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const result = await db.select().from(patients).where(eq(patients.id, id));
    return result[0];
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const initials = `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
    const result = await db.insert(patients).values({
      ...patient,
      avatarInitials: initials,
    }).returning();
    return result[0];
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const result = await db.update(patients).set(updates).where(eq(patients.id, id)).returning();
    return result[0];
  }

  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }

  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  async getSession(id: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id));
    return result[0];
  }

  async createSession(session: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(session).returning();
    
    if (session.protocolAssignmentId) {
      const assignment = await this.getProtocolAssignment(session.protocolAssignmentId);
      if (assignment) {
        await this.updateProtocolAssignment(session.protocolAssignmentId, {
          completedSessions: assignment.completedSessions + 1
        });
      }
    }
    
    return result[0];
  }

  async getProtocols(): Promise<Protocol[]> {
    return await db.select().from(protocols);
  }

  async getProtocol(id: string): Promise<Protocol | undefined> {
    const result = await db.select().from(protocols).where(eq(protocols.id, id));
    return result[0];
  }

  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    const result = await db.insert(protocols).values(protocol).returning();
    return result[0];
  }

  async updateProtocol(id: string, updates: Partial<InsertProtocol>): Promise<Protocol | undefined> {
    const result = await db.update(protocols).set(updates).where(eq(protocols.id, id)).returning();
    return result[0];
  }

  async deleteProtocol(id: string): Promise<boolean> {
    const result = await db.delete(protocols).where(eq(protocols.id, id)).returning();
    return result.length > 0;
  }

  async getProtocolAssignments(): Promise<ProtocolAssignment[]> {
    return await db.select().from(protocolAssignments);
  }

  async getProtocolAssignment(id: string): Promise<ProtocolAssignment | undefined> {
    const result = await db.select().from(protocolAssignments).where(eq(protocolAssignments.id, id));
    return result[0];
  }

  async getProtocolAssignmentsByPatient(patientId: string): Promise<ProtocolAssignment[]> {
    return await db.select().from(protocolAssignments).where(eq(protocolAssignments.patientId, patientId));
  }

  async createProtocolAssignment(assignment: InsertProtocolAssignment): Promise<ProtocolAssignment> {
    const result = await db.insert(protocolAssignments).values(assignment).returning();
    return result[0];
  }

  async updateProtocolAssignment(id: string, updates: Partial<InsertProtocolAssignment>): Promise<ProtocolAssignment | undefined> {
    const result = await db.update(protocolAssignments).set(updates).where(eq(protocolAssignments.id, id)).returning();
    return result[0];
  }

  async deleteProtocolAssignment(id: string): Promise<boolean> {
    const result = await db.delete(protocolAssignments).where(eq(protocolAssignments.id, id)).returning();
    return result.length > 0;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.passwordHash, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      passwordHash: hashedPassword,
    }).returning();
    return result[0];
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async getClinicalHistories(): Promise<ClinicalHistory[]> {
    return await db.select().from(clinicalHistories);
  }

  async getClinicalHistory(id: string): Promise<ClinicalHistory | undefined> {
    const result = await db.select().from(clinicalHistories).where(eq(clinicalHistories.id, id));
    return result[0];
  }

  async getClinicalHistoryByPatient(patientId: string): Promise<ClinicalHistory | undefined> {
    const result = await db.select().from(clinicalHistories).where(eq(clinicalHistories.patientId, patientId));
    return result[0];
  }

  async createClinicalHistory(history: InsertClinicalHistory): Promise<ClinicalHistory> {
    const result = await db.insert(clinicalHistories).values(history).returning();
    return result[0];
  }

  async updateClinicalHistory(id: string, updates: Partial<InsertClinicalHistory>): Promise<ClinicalHistory | undefined> {
    const result = await db.update(clinicalHistories).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(clinicalHistories.id, id)).returning();
    return result[0];
  }

  async seedInitialData(): Promise<void> {
    const existingUsers = await this.getUsers();
    if (existingUsers.length > 0) {
      return;
    }

    await this.createUser({
      email: "admin@massthermed.com",
      passwordHash: "admin123",
      name: "Administrador",
      role: "admin",
    });

    const physicalTherapy = await this.createTherapyType({
      name: "Terapia Física",
      description: "Rehabilitación física y mejora de la movilidad",
      color: "#00A9E0"
    });

    const occupationalTherapy = await this.createTherapyType({
      name: "Terapia Ocupacional",
      description: "Mejora de habilidades para actividades diarias",
      color: "#22C55E"
    });

    const speechTherapy = await this.createTherapyType({
      name: "Terapia del Lenguaje",
      description: "Mejora de comunicación y habla",
      color: "#8B5CF6"
    });

    const massageTherapy = await this.createTherapyType({
      name: "Masaje Terapéutico",
      description: "Alivio de dolor muscular y tensión",
      color: "#E07B54"
    });

    const mariaTerapeuta = await this.createTherapist({
      name: "María García López",
      email: "maria.garcia@massthermed.com",
      phone: "55-1234-5678",
      specialties: ["Terapia Física", "Masaje Terapéutico"],
      avatarInitials: "MG"
    });

    const carlosTerapeuta = await this.createTherapist({
      name: "Carlos Rodríguez Pérez",
      email: "carlos.rodriguez@massthermed.com",
      phone: "55-8765-4321",
      specialties: ["Terapia Ocupacional", "Terapia del Lenguaje"],
      avatarInitials: "CR"
    });

    const anaTerapeuta = await this.createTherapist({
      name: "Ana Martínez Sánchez",
      email: "ana.martinez@massthermed.com",
      phone: "55-2468-1357",
      specialties: ["Masaje Terapéutico", "Terapia Física"],
      avatarInitials: "AM"
    });

    const patient1 = await this.createPatient({
      firstName: "Juan",
      lastName: "Pérez González",
      dateOfBirth: "1985-03-15",
      phone: "55-1111-2222",
      email: "juan.perez@email.com",
      address: "Av. Reforma 123, Col. Centro, CDMX",
      emergencyContact: "María Pérez",
      emergencyPhone: "55-3333-4444",
      status: "active",
      assignedTherapistId: mariaTerapeuta.id
    });

    const patient2 = await this.createPatient({
      firstName: "Laura",
      lastName: "Sánchez Ruiz",
      dateOfBirth: "1990-07-22",
      phone: "55-5555-6666",
      email: "laura.sanchez@email.com",
      address: "Calle Juárez 456, Col. Roma, CDMX",
      emergencyContact: "Roberto Sánchez",
      emergencyPhone: "55-7777-8888",
      status: "active",
      assignedTherapistId: carlosTerapeuta.id
    });

    console.log("Initial database seeding completed");
  }
}

export const dbStorage = new DbStorage();
