import { 
  type TherapyType, type InsertTherapyType,
  type Therapist, type InsertTherapist,
  type Patient, type InsertPatient,
  type Appointment, type InsertAppointment,
  type Session, type InsertSession,
  type User, type InsertUser
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  getTherapyTypes(): Promise<TherapyType[]>;
  getTherapyType(id: string): Promise<TherapyType | undefined>;
  createTherapyType(therapyType: InsertTherapyType): Promise<TherapyType>;
  
  getTherapists(): Promise<Therapist[]>;
  getTherapist(id: string): Promise<Therapist | undefined>;
  createTherapist(therapist: InsertTherapist): Promise<Therapist>;
  
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  
  getSessions(): Promise<Session[]>;
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(email: string, password: string): Promise<User | null>;
}

export class MemStorage implements IStorage {
  private therapyTypes: Map<string, TherapyType>;
  private therapists: Map<string, Therapist>;
  private patients: Map<string, Patient>;
  private appointments: Map<string, Appointment>;
  private sessions: Map<string, Session>;
  private users: Map<string, User>;

  constructor() {
    this.therapyTypes = new Map();
    this.therapists = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.sessions = new Map();
    this.users = new Map();
    
    this.seedData();
  }

  private seedData() {
    const physicalTherapy = this.createTherapyTypeSync({
      name: "Terapia Física",
      description: "Rehabilitación física y mejora de la movilidad",
      color: "#00A9E0"
    });

    const occupationalTherapy = this.createTherapyTypeSync({
      name: "Terapia Ocupacional",
      description: "Mejora de habilidades para actividades diarias",
      color: "#22C55E"
    });

    const speechTherapy = this.createTherapyTypeSync({
      name: "Terapia del Lenguaje",
      description: "Mejora de comunicación y habla",
      color: "#8B5CF6"
    });

    const psychologicalTherapy = this.createTherapyTypeSync({
      name: "Terapia Psicológica",
      description: "Apoyo emocional y salud mental",
      color: "#EF4444"
    });

    this.createTherapistSync({
      name: "Dra. María González",
      email: "maria.gonzalez@terapiaclinic.com",
      phone: "+52 555 123 4567",
      specialties: ["Terapia Física", "Rehabilitación"],
      avatarInitials: "MG"
    });

    this.createTherapistSync({
      name: "Dr. Carlos Ruiz",
      email: "carlos.ruiz@terapiaclinic.com",
      phone: "+52 555 234 5678",
      specialties: ["Terapia Ocupacional", "Pediatría"],
      avatarInitials: "CR"
    });

    this.createTherapistSync({
      name: "Lic. Ana Martínez",
      email: "ana.martinez@terapiaclinic.com",
      phone: "+52 555 345 6789",
      specialties: ["Terapia del Lenguaje", "Foniatría"],
      avatarInitials: "AM"
    });

    const adminPasswordHash = bcrypt.hashSync("admin123", 10);
    this.createUserSync({
      email: "admin@massthermed.com",
      passwordHash: adminPasswordHash,
      name: "Administrador",
      role: "admin"
    });
  }

  private createTherapyTypeSync(therapyType: InsertTherapyType): TherapyType {
    const id = randomUUID();
    const newTherapyType: TherapyType = { ...therapyType, id };
    this.therapyTypes.set(id, newTherapyType);
    return newTherapyType;
  }

  private createTherapistSync(therapist: InsertTherapist): Therapist {
    const id = randomUUID();
    const newTherapist: Therapist = { ...therapist, id };
    this.therapists.set(id, newTherapist);
    return newTherapist;
  }

  private createUserSync(user: InsertUser): User {
    const id = randomUUID();
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async getTherapyTypes(): Promise<TherapyType[]> {
    return Array.from(this.therapyTypes.values());
  }

  async getTherapyType(id: string): Promise<TherapyType | undefined> {
    return this.therapyTypes.get(id);
  }

  async createTherapyType(therapyType: InsertTherapyType): Promise<TherapyType> {
    return this.createTherapyTypeSync(therapyType);
  }

  async getTherapists(): Promise<Therapist[]> {
    return Array.from(this.therapists.values());
  }

  async getTherapist(id: string): Promise<Therapist | undefined> {
    return this.therapists.get(id);
  }

  async createTherapist(therapist: InsertTherapist): Promise<Therapist> {
    return this.createTherapistSync(therapist);
  }

  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const avatarInitials = `${insertPatient.firstName.charAt(0)}${insertPatient.lastName.charAt(0)}`.toUpperCase();
    const patient: Patient = { 
      ...insertPatient, 
      id,
      avatarInitials,
      createdAt: new Date()
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...updates };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      createdAt: new Date()
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      createdAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.passwordHash, 10);
    const userWithHashedPassword = { ...insertUser, passwordHash: hashedPassword };
    return this.createUserSync(userWithHashedPassword);
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }
}

export const storage = new MemStorage();
