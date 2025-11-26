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
  type TherapyPackage, type InsertTherapyPackage,
  type PackageAlert, type InsertPackageAlert,
  type PackageSession, type InsertPackageSession,
  type SessionEvidence, type InsertSessionEvidence,
  type ProgressNote, type InsertProgressNote,
  type AppointmentRequest, type InsertAppointmentRequest,
  calculatePackageStatus
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  getTherapyTypes(): Promise<TherapyType[]>;
  getTherapyType(id: string): Promise<TherapyType | undefined>;
  createTherapyType(therapyType: InsertTherapyType): Promise<TherapyType>;
  updateTherapyType(id: string, therapyType: Partial<InsertTherapyType>): Promise<TherapyType | undefined>;
  deleteTherapyType(id: string): Promise<boolean>;
  
  getTherapists(): Promise<Therapist[]>;
  getTherapist(id: string): Promise<Therapist | undefined>;
  createTherapist(therapist: InsertTherapist): Promise<Therapist>;
  updateTherapist(id: string, therapist: Partial<InsertTherapist>): Promise<Therapist | undefined>;
  deleteTherapist(id: string): Promise<boolean>;
  
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
  
  getProtocols(): Promise<Protocol[]>;
  getProtocol(id: string): Promise<Protocol | undefined>;
  createProtocol(protocol: InsertProtocol): Promise<Protocol>;
  updateProtocol(id: string, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined>;
  deleteProtocol(id: string): Promise<boolean>;
  
  getProtocolAssignments(): Promise<ProtocolAssignment[]>;
  getProtocolAssignment(id: string): Promise<ProtocolAssignment | undefined>;
  getProtocolAssignmentsByPatient(patientId: string): Promise<ProtocolAssignment[]>;
  createProtocolAssignment(assignment: InsertProtocolAssignment): Promise<ProtocolAssignment>;
  updateProtocolAssignment(id: string, assignment: Partial<InsertProtocolAssignment>): Promise<ProtocolAssignment | undefined>;
  deleteProtocolAssignment(id: string): Promise<boolean>;
  
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  
  getClinicalHistories(): Promise<ClinicalHistory[]>;
  getClinicalHistory(id: string): Promise<ClinicalHistory | undefined>;
  getClinicalHistoryByPatient(patientId: string): Promise<ClinicalHistory | undefined>;
  createClinicalHistory(history: InsertClinicalHistory): Promise<ClinicalHistory>;
  updateClinicalHistory(id: string, history: Partial<InsertClinicalHistory>): Promise<ClinicalHistory | undefined>;
  
  getTherapyPackages(): Promise<TherapyPackage[]>;
  getTherapyPackage(id: string): Promise<TherapyPackage | undefined>;
  getTherapyPackagesByPatient(patientId: string): Promise<TherapyPackage[]>;
  getActivePackageByPatient(patientId: string): Promise<TherapyPackage | undefined>;
  createTherapyPackage(pkg: InsertTherapyPackage): Promise<TherapyPackage>;
  updateTherapyPackage(id: string, pkg: Partial<InsertTherapyPackage>): Promise<TherapyPackage | undefined>;
  deleteTherapyPackage(id: string): Promise<boolean>;
  usePackageSession(packageId: string): Promise<TherapyPackage | undefined>;
  
  getPackageAlerts(): Promise<PackageAlert[]>;
  getPackageAlertsByPatient(patientId: string): Promise<PackageAlert[]>;
  getUnreadAlerts(): Promise<PackageAlert[]>;
  createPackageAlert(alert: InsertPackageAlert): Promise<PackageAlert>;
  markAlertAsRead(id: string): Promise<PackageAlert | undefined>;
  
  getPackageSessions(packageId: string): Promise<PackageSession[]>;
  getPackageSessionsByPatient(patientId: string): Promise<PackageSession[]>;
  createPackageSession(session: InsertPackageSession): Promise<PackageSession>;
  updatePackageSession(id: string, session: Partial<InsertPackageSession>): Promise<PackageSession | undefined>;
  
  getSessionEvidence(sessionId: string): Promise<SessionEvidence[]>;
  getSessionEvidenceByPatient(patientId: string): Promise<SessionEvidence[]>;
  createSessionEvidence(evidence: InsertSessionEvidence): Promise<SessionEvidence>;
  deleteSessionEvidence(id: string): Promise<boolean>;
  
  getProgressNotes(patientId: string): Promise<ProgressNote[]>;
  getProgressNote(id: string): Promise<ProgressNote | undefined>;
  createProgressNote(note: InsertProgressNote): Promise<ProgressNote>;
  updateProgressNote(id: string, note: Partial<InsertProgressNote>): Promise<ProgressNote | undefined>;
  deleteProgressNote(id: string): Promise<boolean>;
  
  getAppointmentRequests(): Promise<AppointmentRequest[]>;
  getAppointmentRequest(id: string): Promise<AppointmentRequest | undefined>;
  createAppointmentRequest(request: InsertAppointmentRequest): Promise<AppointmentRequest>;
  updateAppointmentRequest(id: string, request: Partial<AppointmentRequest>): Promise<AppointmentRequest | undefined>;
  deleteAppointmentRequest(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private therapyTypes: Map<string, TherapyType>;
  private therapists: Map<string, Therapist>;
  private patients: Map<string, Patient>;
  private appointments: Map<string, Appointment>;
  private sessions: Map<string, Session>;
  private protocols: Map<string, Protocol>;
  private protocolAssignments: Map<string, ProtocolAssignment>;
  private users: Map<string, User>;
  private clinicalHistories: Map<string, ClinicalHistory>;
  private therapyPackages: Map<string, TherapyPackage>;
  private packageAlerts: Map<string, PackageAlert>;
  private packageSessions: Map<string, PackageSession>;
  private sessionEvidence: Map<string, SessionEvidence>;
  private progressNotes: Map<string, ProgressNote>;

  constructor() {
    this.therapyTypes = new Map();
    this.therapists = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.sessions = new Map();
    this.protocols = new Map();
    this.protocolAssignments = new Map();
    this.users = new Map();
    this.clinicalHistories = new Map();
    this.therapyPackages = new Map();
    this.packageAlerts = new Map();
    this.packageSessions = new Map();
    this.sessionEvidence = new Map();
    this.progressNotes = new Map();
    
    this.seedData();
  }

  private toNull<T>(value: T | null | undefined): T | null {
    return value === undefined ? null : value;
  }

  private cleanUpdates<T extends Record<string, any>>(updates: T): Partial<T> {
    const immutableFields = ['id', 'createdAt'];
    const cleaned: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && !immutableFields.includes(key)) {
        cleaned[key] = value;
      }
    }
    return cleaned;
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

    const therapist1 = this.createTherapistSync({
      name: "Dra. María González",
      email: "maria.gonzalez@massthermed.com",
      phone: "+52 555 123 4567",
      specialties: ["Masaje Terapéutico", "Masaje Deportivo"],
      avatarInitials: "MG"
    });

    const therapist2 = this.createTherapistSync({
      name: "Dr. Carlos Ruiz",
      email: "carlos.ruiz@massthermed.com",
      phone: "+52 555 234 5678",
      specialties: ["Masaje de Tejido Profundo", "Rehabilitación"],
      avatarInitials: "CR"
    });

    const therapist3 = this.createTherapistSync({
      name: "Lic. Ana Martínez",
      email: "ana.martinez@massthermed.com",
      phone: "+52 555 345 6789",
      specialties: ["Masaje de Relajación", "Aromaterapia"],
      avatarInitials: "AM"
    });

    const adminPasswordHash = bcrypt.hashSync("admin123", 10);
    const adminUser = this.createUserSync({
      email: "admin@massthermed.com",
      passwordHash: adminPasswordHash,
      name: "Administrador",
      role: "admin",
      therapistId: therapist1.id
    });

    this.createProtocolSync({
      therapyTypeId: physicalTherapy.id,
      name: "Rehabilitación Postoperatoria",
      description: "Protocolo estándar para recuperación después de cirugías ortopédicas",
      objectives: "Recuperar movilidad y fuerza muscular",
      totalSessions: 12,
      createdBy: adminUser.id
    });

    this.createProtocolSync({
      therapyTypeId: physicalTherapy.id,
      name: "Tratamiento de Lumbalgia Crónica",
      description: "Manejo del dolor lumbar crónico mediante terapia manual",
      objectives: "Reducir dolor y mejorar postura",
      totalSessions: 8,
      createdBy: adminUser.id
    });

    this.createProtocolSync({
      therapyTypeId: occupationalTherapy.id,
      name: "Rehabilitación de Mano",
      description: "Recuperación funcional de la mano después de lesiones",
      objectives: "Mejorar fuerza de agarre y destreza",
      totalSessions: 10,
      createdBy: adminUser.id
    });
  }

  private createTherapyTypeSync(therapyType: InsertTherapyType): TherapyType {
    const id = randomUUID();
    const newTherapyType: TherapyType = { 
      id,
      name: therapyType.name,
      color: therapyType.color,
      description: this.toNull(therapyType.description)
    };
    this.therapyTypes.set(id, newTherapyType);
    return newTherapyType;
  }

  private createTherapistSync(therapist: InsertTherapist): Therapist {
    const id = randomUUID();
    const newTherapist: Therapist = { 
      id,
      name: therapist.name,
      email: therapist.email,
      avatarInitials: therapist.avatarInitials,
      phone: this.toNull(therapist.phone),
      specialties: this.toNull(therapist.specialties)
    };
    this.therapists.set(id, newTherapist);
    return newTherapist;
  }

  private createUserSync(user: InsertUser): User {
    const id = randomUUID();
    const newUser: User = { 
      id, 
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role ?? "therapist",
      therapistId: this.toNull(user.therapistId),
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  private createProtocolSync(protocol: InsertProtocol): Protocol {
    const id = randomUUID();
    const newProtocol: Protocol = { 
      id, 
      name: protocol.name,
      therapyTypeId: protocol.therapyTypeId,
      totalSessions: protocol.totalSessions,
      createdBy: protocol.createdBy,
      description: this.toNull(protocol.description),
      objectives: this.toNull(protocol.objectives),
      createdAt: new Date()
    };
    this.protocols.set(id, newProtocol);
    return newProtocol;
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

  async updateTherapyType(id: string, updates: Partial<InsertTherapyType>): Promise<TherapyType | undefined> {
    const therapyType = this.therapyTypes.get(id);
    if (!therapyType) return undefined;
    
    const cleaned = this.cleanUpdates(updates);
    const updatedTherapyType = { ...therapyType, ...cleaned };
    this.therapyTypes.set(id, updatedTherapyType);
    return updatedTherapyType;
  }

  async deleteTherapyType(id: string): Promise<boolean> {
    return this.therapyTypes.delete(id);
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

  async updateTherapist(id: string, updates: Partial<InsertTherapist>): Promise<Therapist | undefined> {
    const therapist = this.therapists.get(id);
    if (!therapist) return undefined;
    
    const cleaned = this.cleanUpdates(updates);
    const updatedTherapist = { ...therapist, ...cleaned };
    this.therapists.set(id, updatedTherapist);
    return updatedTherapist;
  }

  async deleteTherapist(id: string): Promise<boolean> {
    return this.therapists.delete(id);
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
      id,
      firstName: insertPatient.firstName,
      lastName: insertPatient.lastName,
      dateOfBirth: insertPatient.dateOfBirth,
      phone: insertPatient.phone,
      emergencyContact: insertPatient.emergencyContact,
      emergencyPhone: insertPatient.emergencyPhone,
      avatarInitials,
      email: this.toNull(insertPatient.email),
      address: this.toNull(insertPatient.address),
      status: insertPatient.status ?? "active",
      assignedTherapistId: this.toNull(insertPatient.assignedTherapistId),
      createdAt: new Date()
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const cleaned = this.cleanUpdates(updates);
    const updatedPatient = { ...patient, ...cleaned };
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
      id,
      therapistId: insertAppointment.therapistId,
      patientId: insertAppointment.patientId,
      therapyTypeId: insertAppointment.therapyTypeId,
      startTime: insertAppointment.startTime,
      endTime: insertAppointment.endTime,
      status: insertAppointment.status ?? "scheduled",
      notes: this.toNull(insertAppointment.notes),
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
      id,
      therapistId: insertSession.therapistId,
      patientId: insertSession.patientId,
      therapyTypeId: insertSession.therapyTypeId,
      sessionDate: insertSession.sessionDate,
      duration: insertSession.duration,
      protocolAssignmentId: this.toNull(insertSession.protocolAssignmentId),
      notes: this.toNull(insertSession.notes),
      observations: this.toNull(insertSession.observations),
      progress: this.toNull(insertSession.progress),
      createdAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async getProtocols(): Promise<Protocol[]> {
    return Array.from(this.protocols.values());
  }

  async getProtocol(id: string): Promise<Protocol | undefined> {
    return this.protocols.get(id);
  }

  async createProtocol(insertProtocol: InsertProtocol): Promise<Protocol> {
    const id = randomUUID();
    const protocol: Protocol = {
      id,
      name: insertProtocol.name,
      therapyTypeId: insertProtocol.therapyTypeId,
      totalSessions: insertProtocol.totalSessions,
      createdBy: insertProtocol.createdBy,
      description: this.toNull(insertProtocol.description),
      objectives: this.toNull(insertProtocol.objectives),
      createdAt: new Date()
    };
    this.protocols.set(id, protocol);
    return protocol;
  }

  async updateProtocol(id: string, updates: Partial<InsertProtocol>): Promise<Protocol | undefined> {
    const protocol = this.protocols.get(id);
    if (!protocol) return undefined;
    
    const cleaned = this.cleanUpdates(updates);
    const updatedProtocol = { ...protocol, ...cleaned };
    this.protocols.set(id, updatedProtocol);
    return updatedProtocol;
  }

  async deleteProtocol(id: string): Promise<boolean> {
    return this.protocols.delete(id);
  }

  async getProtocolAssignments(): Promise<ProtocolAssignment[]> {
    return Array.from(this.protocolAssignments.values());
  }

  async getProtocolAssignment(id: string): Promise<ProtocolAssignment | undefined> {
    return this.protocolAssignments.get(id);
  }

  async getProtocolAssignmentsByPatient(patientId: string): Promise<ProtocolAssignment[]> {
    return Array.from(this.protocolAssignments.values()).filter(
      assignment => assignment.patientId === patientId
    );
  }

  async createProtocolAssignment(insertAssignment: InsertProtocolAssignment): Promise<ProtocolAssignment> {
    const id = randomUUID();
    const assignment: ProtocolAssignment = {
      id,
      protocolId: insertAssignment.protocolId,
      patientId: insertAssignment.patientId,
      startDate: insertAssignment.startDate,
      status: insertAssignment.status ?? "active",
      completedSessions: insertAssignment.completedSessions ?? 0,
      endDate: this.toNull(insertAssignment.endDate),
      createdAt: new Date()
    };
    this.protocolAssignments.set(id, assignment);
    return assignment;
  }

  async updateProtocolAssignment(id: string, updates: Partial<InsertProtocolAssignment>): Promise<ProtocolAssignment | undefined> {
    const assignment = this.protocolAssignments.get(id);
    if (!assignment) return undefined;
    
    const cleaned = this.cleanUpdates(updates);
    const updatedAssignment = { ...assignment, ...cleaned };
    this.protocolAssignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async deleteProtocolAssignment(id: string): Promise<boolean> {
    return this.protocolAssignments.delete(id);
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

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updateData: any = { ...updates };
    if (updates.passwordHash) {
      updateData.passwordHash = await bcrypt.hash(updates.passwordHash, 10);
    }
    
    const cleaned = this.cleanUpdates(updateData);
    const updatedUser: User = { ...user, ...cleaned };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async getClinicalHistories(): Promise<ClinicalHistory[]> {
    return Array.from(this.clinicalHistories.values());
  }

  async getClinicalHistory(id: string): Promise<ClinicalHistory | undefined> {
    return this.clinicalHistories.get(id);
  }

  async getClinicalHistoryByPatient(patientId: string): Promise<ClinicalHistory | undefined> {
    return Array.from(this.clinicalHistories.values()).find(h => h.patientId === patientId);
  }

  async createClinicalHistory(insertHistory: InsertClinicalHistory): Promise<ClinicalHistory> {
    const id = randomUUID();
    const history: ClinicalHistory = {
      id,
      patientId: insertHistory.patientId,
      fecha: insertHistory.fecha,
      recomendacion: this.toNull(insertHistory.recomendacion),
      peso: this.toNull(insertHistory.peso),
      estatura: this.toNull(insertHistory.estatura),
      padecimientoActual: this.toNull(insertHistory.padecimientoActual),
      tratamientoPrevio: this.toNull(insertHistory.tratamientoPrevio),
      tratamientoRestaurativo: this.toNull(insertHistory.tratamientoRestaurativo),
      antecedentesPatologicos: this.toNull(insertHistory.antecedentesPatologicos),
      habitosSalud: this.toNull(insertHistory.habitosSalud),
      sintomatologia: this.toNull(insertHistory.sintomatologia),
      diagnosticosPrevios: insertHistory.diagnosticosPrevios || null,
      medicosTratantes: insertHistory.medicosTratantes || null,
      estudiosRealizados: this.toNull(insertHistory.estudiosRealizados),
      nivelDolor: insertHistory.nivelDolor ?? null,
      createdAt: new Date(),
      updatedAt: null
    };
    this.clinicalHistories.set(id, history);
    return history;
  }

  async updateClinicalHistory(id: string, updates: Partial<InsertClinicalHistory>): Promise<ClinicalHistory | undefined> {
    const history = this.clinicalHistories.get(id);
    if (!history) return undefined;
    
    const cleaned = this.cleanUpdates(updates);
    const updatedHistory: ClinicalHistory = { 
      ...history, 
      ...cleaned,
      updatedAt: new Date()
    };
    this.clinicalHistories.set(id, updatedHistory);
    return updatedHistory;
  }

  async getTherapyPackages(): Promise<TherapyPackage[]> {
    return Array.from(this.therapyPackages.values());
  }

  async getTherapyPackage(id: string): Promise<TherapyPackage | undefined> {
    return this.therapyPackages.get(id);
  }

  async getTherapyPackagesByPatient(patientId: string): Promise<TherapyPackage[]> {
    return Array.from(this.therapyPackages.values()).filter(p => p.patientId === patientId);
  }

  async getActivePackageByPatient(patientId: string): Promise<TherapyPackage | undefined> {
    const packages = await this.getTherapyPackagesByPatient(patientId);
    return packages.find(p => p.status === "active" || p.status === "warning" || p.status === "critical");
  }

  async createTherapyPackage(insertPkg: InsertTherapyPackage): Promise<TherapyPackage> {
    const id = randomUUID();
    const pkg: TherapyPackage = {
      id,
      patientId: insertPkg.patientId,
      name: insertPkg.name,
      description: this.toNull(insertPkg.description),
      totalSessions: insertPkg.totalSessions,
      sessionsUsed: 0,
      purchaseDate: insertPkg.purchaseDate,
      expirationDate: this.toNull(insertPkg.expirationDate),
      price: this.toNull(insertPkg.price),
      status: insertPkg.status ?? "active",
      notes: this.toNull(insertPkg.notes),
      createdAt: new Date(),
      updatedAt: null
    };
    this.therapyPackages.set(id, pkg);
    return pkg;
  }

  async updateTherapyPackage(id: string, updates: Partial<InsertTherapyPackage>): Promise<TherapyPackage | undefined> {
    const pkg = this.therapyPackages.get(id);
    if (!pkg) return undefined;
    
    const cleaned = this.cleanUpdates(updates);
    const updatedPkg: TherapyPackage = { 
      ...pkg, 
      ...cleaned,
      updatedAt: new Date()
    };
    this.therapyPackages.set(id, updatedPkg);
    return updatedPkg;
  }

  async deleteTherapyPackage(id: string): Promise<boolean> {
    return this.therapyPackages.delete(id);
  }

  async usePackageSession(packageId: string): Promise<TherapyPackage | undefined> {
    const pkg = this.therapyPackages.get(packageId);
    if (!pkg) return undefined;
    
    const newSessionsUsed = pkg.sessionsUsed + 1;
    const newStatus = calculatePackageStatus({
      totalSessions: pkg.totalSessions,
      sessionsUsed: newSessionsUsed,
      expirationDate: pkg.expirationDate
    });
    
    const updatedPkg: TherapyPackage = {
      ...pkg,
      sessionsUsed: newSessionsUsed,
      status: newStatus,
      updatedAt: new Date()
    };
    this.therapyPackages.set(packageId, updatedPkg);
    return updatedPkg;
  }

  async getPackageAlerts(): Promise<PackageAlert[]> {
    return Array.from(this.packageAlerts.values());
  }

  async getPackageAlertsByPatient(patientId: string): Promise<PackageAlert[]> {
    return Array.from(this.packageAlerts.values()).filter(a => a.patientId === patientId);
  }

  async getUnreadAlerts(): Promise<PackageAlert[]> {
    return Array.from(this.packageAlerts.values()).filter(a => a.isRead === "false");
  }

  async createPackageAlert(insertAlert: InsertPackageAlert): Promise<PackageAlert> {
    const id = randomUUID();
    const alert: PackageAlert = {
      id,
      packageId: insertAlert.packageId,
      patientId: insertAlert.patientId,
      alertType: insertAlert.alertType,
      message: insertAlert.message,
      method: insertAlert.method ?? "panel",
      isRead: "false",
      createdAt: new Date()
    };
    this.packageAlerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: string): Promise<PackageAlert | undefined> {
    const alert = this.packageAlerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert: PackageAlert = { ...alert, isRead: "true" };
    this.packageAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async getPackageSessions(packageId: string): Promise<PackageSession[]> {
    return Array.from(this.packageSessions.values()).filter(s => s.packageId === packageId);
  }

  async getPackageSessionsByPatient(patientId: string): Promise<PackageSession[]> {
    return Array.from(this.packageSessions.values()).filter(s => s.patientId === patientId);
  }

  async createPackageSession(insertSession: InsertPackageSession): Promise<PackageSession> {
    const id = randomUUID();
    const session: PackageSession = {
      id,
      packageId: insertSession.packageId,
      patientId: insertSession.patientId,
      sessionDate: insertSession.sessionDate,
      sessionType: this.toNull(insertSession.sessionType),
      attendanceStatus: insertSession.attendanceStatus ?? "attended",
      therapistId: this.toNull(insertSession.therapistId),
      notes: this.toNull(insertSession.notes),
      adminNote: this.toNull(insertSession.adminNote),
      createdAt: new Date()
    };
    this.packageSessions.set(id, session);
    return session;
  }

  async updatePackageSession(id: string, updates: Partial<InsertPackageSession>): Promise<PackageSession | undefined> {
    const session = this.packageSessions.get(id);
    if (!session) return undefined;
    
    const cleaned = this.cleanUpdates(updates);
    const updatedSession: PackageSession = { ...session, ...cleaned };
    this.packageSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getSessionEvidence(sessionId: string): Promise<SessionEvidence[]> {
    return Array.from(this.sessionEvidence.values()).filter(e => e.sessionId === sessionId);
  }

  async getSessionEvidenceByPatient(patientId: string): Promise<SessionEvidence[]> {
    return Array.from(this.sessionEvidence.values()).filter(e => e.patientId === patientId);
  }

  async createSessionEvidence(insertEvidence: InsertSessionEvidence): Promise<SessionEvidence> {
    const id = randomUUID();
    const evidence: SessionEvidence = {
      id,
      sessionId: insertEvidence.sessionId,
      patientId: insertEvidence.patientId,
      fileName: insertEvidence.fileName,
      fileType: insertEvidence.fileType,
      fileUrl: insertEvidence.fileUrl,
      description: this.toNull(insertEvidence.description),
      category: insertEvidence.category ?? "general",
      createdAt: new Date()
    };
    this.sessionEvidence.set(id, evidence);
    return evidence;
  }

  async deleteSessionEvidence(id: string): Promise<boolean> {
    return this.sessionEvidence.delete(id);
  }

  async getProgressNotes(patientId: string): Promise<ProgressNote[]> {
    return Array.from(this.progressNotes.values())
      .filter(n => n.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getProgressNote(id: string): Promise<ProgressNote | undefined> {
    return this.progressNotes.get(id);
  }

  async createProgressNote(insertNote: InsertProgressNote): Promise<ProgressNote> {
    const id = randomUUID();
    const note: ProgressNote = {
      id,
      patientId: insertNote.patientId,
      sessionId: this.toNull(insertNote.sessionId),
      therapistId: insertNote.therapistId,
      date: insertNote.date,
      title: insertNote.title,
      content: insertNote.content,
      category: insertNote.category ?? "general",
      isPrivate: insertNote.isPrivate ?? "false",
      createdAt: new Date(),
      updatedAt: null
    };
    this.progressNotes.set(id, note);
    return note;
  }

  async updateProgressNote(id: string, updates: Partial<InsertProgressNote>): Promise<ProgressNote | undefined> {
    const note = this.progressNotes.get(id);
    if (!note) return undefined;
    
    const cleaned = this.cleanUpdates(updates);
    const updatedNote: ProgressNote = { 
      ...note, 
      ...cleaned,
      updatedAt: new Date()
    };
    this.progressNotes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteProgressNote(id: string): Promise<boolean> {
    return this.progressNotes.delete(id);
  }

  private appointmentRequests: Map<string, AppointmentRequest> = new Map();

  async getAppointmentRequests(): Promise<AppointmentRequest[]> {
    return Array.from(this.appointmentRequests.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAppointmentRequest(id: string): Promise<AppointmentRequest | undefined> {
    return this.appointmentRequests.get(id);
  }

  async createAppointmentRequest(request: InsertAppointmentRequest): Promise<AppointmentRequest> {
    const id = randomUUID();
    const newRequest: AppointmentRequest = {
      id,
      name: request.name,
      phone: request.phone,
      email: this.toNull(request.email),
      preferredDate: this.toNull(request.preferredDate),
      preferredTime: this.toNull(request.preferredTime),
      serviceType: this.toNull(request.serviceType),
      message: this.toNull(request.message),
      status: request.status ?? "pending",
      notes: this.toNull(request.notes),
      createdAt: new Date(),
      processedAt: null,
      processedBy: null
    };
    this.appointmentRequests.set(id, newRequest);
    return newRequest;
  }

  async updateAppointmentRequest(id: string, updates: Partial<AppointmentRequest>): Promise<AppointmentRequest | undefined> {
    const request = this.appointmentRequests.get(id);
    if (!request) return undefined;
    const updatedRequest: AppointmentRequest = { ...request, ...updates };
    this.appointmentRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteAppointmentRequest(id: string): Promise<boolean> {
    return this.appointmentRequests.delete(id);
  }
}

import { dbStorage } from "./db-storage";

export const storage: IStorage = dbStorage;
