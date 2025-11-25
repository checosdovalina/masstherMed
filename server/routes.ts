import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dbStorage } from "./db-storage";
import { 
  insertTherapyTypeSchema,
  insertTherapistSchema,
  insertPatientSchema,
  insertAppointmentSchema,
  insertSessionSchema,
  insertProtocolSchema,
  insertProtocolAssignmentSchema,
  insertClinicalHistorySchema,
  insertTherapyPackageSchema,
  insertPackageAlertSchema,
  insertPackageSessionSchema,
  insertSessionEvidenceSchema,
  insertProgressNoteSchema,
  createUserSchema,
  loginSchema,
  getAlertType
} from "@shared/schema";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "No autorizado" });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: "Error al verificar autenticación" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await dbStorage.seedInitialData();

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.verifyPassword(email, password);
      
      if (!user) {
        return res.status(401).json({ error: "Email o contraseña incorrectos" });
      }

      req.session.userId = user.id;
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ error: "Datos de inicio de sesión inválidos" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Error al cerrar sesión" });
      }
      res.clearCookie('connect.sid', { path: '/' });
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  app.get("/api/auth/session", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "No autenticado" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la sesión" });
    }
  });

  app.get("/api/therapy-types", requireAuth, async (req, res) => {
    try {
      const therapyTypes = await storage.getTherapyTypes();
      res.json(therapyTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapy types" });
    }
  });

  app.get("/api/therapy-types/:id", requireAuth, async (req, res) => {
    try {
      const therapyType = await storage.getTherapyType(req.params.id);
      if (!therapyType) {
        return res.status(404).json({ error: "Therapy type not found" });
      }
      res.json(therapyType);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapy type" });
    }
  });

  app.post("/api/therapy-types", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTherapyTypeSchema.parse(req.body);
      const therapyType = await storage.createTherapyType(validatedData);
      res.status(201).json(therapyType);
    } catch (error) {
      res.status(400).json({ error: "Invalid therapy type data" });
    }
  });

  app.patch("/api/therapy-types/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTherapyTypeSchema.partial().parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
      }
      
      if (validatedData.color && !/^#[0-9A-Fa-f]{6}$/.test(validatedData.color)) {
        return res.status(400).json({ error: "El color debe ser un código hexadecimal válido (ej: #256BA2)" });
      }
      
      const therapyType = await storage.updateTherapyType(req.params.id, validatedData);
      if (!therapyType) {
        return res.status(404).json({ error: "Tipo de terapia no encontrado" });
      }
      res.json(therapyType);
    } catch (error) {
      res.status(400).json({ error: "Datos de tipo de terapia inválidos" });
    }
  });

  app.delete("/api/therapy-types/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTherapyType(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Tipo de terapia no encontrado" });
      }
      res.json({ message: "Tipo de terapia eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar tipo de terapia" });
    }
  });

  app.get("/api/therapists", requireAuth, async (req, res) => {
    try {
      const therapists = await storage.getTherapists();
      res.json(therapists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapists" });
    }
  });

  app.get("/api/therapists/:id", requireAuth, async (req, res) => {
    try {
      const therapist = await storage.getTherapist(req.params.id);
      if (!therapist) {
        return res.status(404).json({ error: "Therapist not found" });
      }
      res.json(therapist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapist" });
    }
  });

  app.post("/api/therapists", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTherapistSchema.parse(req.body);
      const therapist = await storage.createTherapist(validatedData);
      res.status(201).json(therapist);
    } catch (error) {
      res.status(400).json({ error: "Invalid therapist data" });
    }
  });

  app.patch("/api/therapists/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTherapistSchema.partial().parse(req.body);
      const therapist = await storage.updateTherapist(req.params.id, validatedData);
      if (!therapist) {
        return res.status(404).json({ error: "Terapeuta no encontrado" });
      }
      res.json(therapist);
    } catch (error) {
      res.status(400).json({ error: "Datos de terapeuta inválidos" });
    }
  });

  app.delete("/api/therapists/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTherapist(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Terapeuta no encontrado" });
      }
      res.json({ message: "Terapeuta eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar terapeuta" });
    }
  });

  app.get("/api/patients", requireAuth, async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ error: "Invalid patient data" });
    }
  });

  app.patch("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(req.params.id, validatedData);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(400).json({ error: "Invalid patient data" });
    }
  });

  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      const parsedBody = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      };
      const validatedData = insertAppointmentSchema.parse(parsedBody);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });

  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", requireAuth, async (req, res) => {
    try {
      const parsedBody = {
        ...req.body,
        sessionDate: new Date(req.body.sessionDate),
      };
      
      let validatedData;
      try {
        validatedData = insertSessionSchema.parse(parsedBody);
      } catch (parseError) {
        return res.status(400).json({ error: "Datos de sesión inválidos" });
      }
      
      if (validatedData.protocolAssignmentId) {
        const assignment = await storage.getProtocolAssignment(validatedData.protocolAssignmentId);
        
        if (!assignment) {
          return res.status(400).json({ error: "La asignación de protocolo seleccionada no existe" });
        }
        
        if (assignment.patientId !== validatedData.patientId) {
          return res.status(400).json({ error: "La asignación de protocolo debe pertenecer al mismo paciente de la sesión" });
        }
        
        if (assignment.status !== "active") {
          return res.status(400).json({ error: "La asignación de protocolo debe estar activa para vincular sesiones" });
        }
        
        const protocol = await storage.getProtocol(assignment.protocolId);
        if (!protocol) {
          return res.status(400).json({ error: "El protocolo de la asignación no existe" });
        }
        
        if (assignment.completedSessions >= protocol.totalSessions) {
          return res.status(400).json({ error: "La asignación ya ha completado todas sus sesiones" });
        }
        
        if (protocol.therapyTypeId !== validatedData.therapyTypeId) {
          return res.status(400).json({ error: "El tipo de terapia de la sesión debe coincidir con el del protocolo" });
        }
      }
      
      const session = await storage.createSession(validatedData);
      
      if (validatedData.protocolAssignmentId) {
        const assignment = await storage.getProtocolAssignment(validatedData.protocolAssignmentId);
        if (assignment) {
          const protocol = await storage.getProtocol(assignment.protocolId);
          if (protocol) {
            const newCompletedSessions = assignment.completedSessions + 1;
            const updates: any = {
              completedSessions: newCompletedSessions,
            };
            
            if (newCompletedSessions >= protocol.totalSessions) {
              updates.status = "completed";
            }
            
            await storage.updateProtocolAssignment(validatedData.protocolAssignmentId, updates);
          }
        }
      }
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Error al crear la sesión" });
    }
  });

  app.get("/api/protocols", requireAuth, async (req, res) => {
    try {
      const protocols = await storage.getProtocols();
      res.json(protocols);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener protocolos" });
    }
  });

  app.get("/api/protocols/:id", requireAuth, async (req, res) => {
    try {
      const protocol = await storage.getProtocol(req.params.id);
      if (!protocol) {
        return res.status(404).json({ error: "Protocolo no encontrado" });
      }
      res.json(protocol);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener protocolo" });
    }
  });

  app.post("/api/protocols", requireAuth, async (req, res) => {
    try {
      const validatedData = insertProtocolSchema.parse({
        ...req.body,
        createdBy: req.session.userId
      });
      
      const protocol = await storage.createProtocol(validatedData);
      res.status(201).json(protocol);
    } catch (error) {
      res.status(400).json({ error: "Datos de protocolo inválidos" });
    }
  });

  app.patch("/api/protocols/:id", requireAuth, async (req, res) => {
    try {
      const allowedFields = ['name', 'description', 'objectives', 'totalSessions', 'therapyTypeId'];
      const updates: any = {};
      
      for (const key of Object.keys(req.body)) {
        if (allowedFields.includes(key)) {
          updates[key] = req.body[key];
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar (name, description, objectives, totalSessions, therapyTypeId)" });
      }
      
      const validatedData = insertProtocolSchema.partial().parse(updates);
      
      const protocol = await storage.updateProtocol(req.params.id, validatedData);
      if (!protocol) {
        return res.status(404).json({ error: "Protocolo no encontrado" });
      }
      res.json(protocol);
    } catch (error) {
      res.status(400).json({ error: "Datos de protocolo inválidos" });
    }
  });

  app.delete("/api/protocols/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProtocol(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Protocolo no encontrado" });
      }
      res.json({ message: "Protocolo eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar protocolo" });
    }
  });

  app.get("/api/protocol-assignments", requireAuth, async (req, res) => {
    try {
      const assignments = await storage.getProtocolAssignments();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener asignaciones de protocolos" });
    }
  });

  app.get("/api/protocol-assignments/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const assignments = await storage.getProtocolAssignmentsByPatient(req.params.patientId);
      
      const assignmentsWithProtocol = await Promise.all(
        assignments.map(async (assignment) => {
          const protocol = await storage.getProtocol(assignment.protocolId);
          return {
            ...assignment,
            protocol: protocol ? {
              name: protocol.name,
              totalSessions: protocol.totalSessions,
              therapyTypeId: protocol.therapyTypeId,
            } : null,
          };
        })
      );
      
      res.json(assignmentsWithProtocol);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener asignaciones del paciente" });
    }
  });

  app.post("/api/protocol-assignments", requireAuth, async (req, res) => {
    try {
      const parsedBody = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };
      
      const validatedData = insertProtocolAssignmentSchema.parse(parsedBody);
      
      const protocol = await storage.getProtocol(validatedData.protocolId);
      if (!protocol) {
        return res.status(400).json({ error: "El protocolo seleccionado no existe" });
      }
      
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient) {
        return res.status(400).json({ error: "El paciente seleccionado no existe" });
      }
      
      if (validatedData.endDate && validatedData.endDate < validatedData.startDate) {
        return res.status(400).json({ error: "La fecha de finalización debe ser posterior a la fecha de inicio" });
      }
      
      if (validatedData.completedSessions && validatedData.completedSessions > protocol.totalSessions) {
        return res.status(400).json({ error: "Las sesiones completadas no pueden exceder el total de sesiones del protocolo" });
      }
      
      const assignment = await storage.createProtocolAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ error: "Datos de asignación de protocolo inválidos" });
    }
  });

  app.patch("/api/protocol-assignments/:id", requireAuth, async (req, res) => {
    try {
      const parsedBody: any = { ...req.body };
      if (parsedBody.startDate) {
        parsedBody.startDate = new Date(parsedBody.startDate);
      }
      if (parsedBody.endDate) {
        parsedBody.endDate = new Date(parsedBody.endDate);
      }
      
      const validatedData = insertProtocolAssignmentSchema.partial().parse(parsedBody);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
      }
      
      const existingAssignment = await storage.getProtocolAssignment(req.params.id);
      if (!existingAssignment) {
        return res.status(404).json({ error: "Asignación de protocolo no encontrada" });
      }
      
      const protocol = await storage.getProtocol(existingAssignment.protocolId);
      if (!protocol) {
        return res.status(400).json({ error: "El protocolo de la asignación no existe" });
      }
      
      const mergedData = { ...existingAssignment, ...validatedData };
      
      if (mergedData.completedSessions > protocol.totalSessions) {
        return res.status(400).json({ error: "Las sesiones completadas no pueden exceder el total de sesiones del protocolo" });
      }
      
      if (mergedData.endDate && mergedData.endDate < mergedData.startDate) {
        return res.status(400).json({ error: "La fecha de finalización debe ser posterior a la fecha de inicio" });
      }
      
      const assignment = await storage.updateProtocolAssignment(req.params.id, validatedData);
      res.json(assignment);
    } catch (error) {
      res.status(400).json({ error: "Datos de asignación de protocolo inválidos" });
    }
  });

  app.delete("/api/protocol-assignments/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProtocolAssignment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Asignación de protocolo no encontrada" });
      }
      res.json({ message: "Asignación de protocolo eliminada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar asignación de protocolo" });
    }
  });

  app.get("/api/clinical-histories", requireAuth, async (req, res) => {
    try {
      const histories = await storage.getClinicalHistories();
      res.json(histories);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener historiales clínicos" });
    }
  });

  app.get("/api/clinical-histories/:id", requireAuth, async (req, res) => {
    try {
      const history = await storage.getClinicalHistory(req.params.id);
      if (!history) {
        return res.status(404).json({ error: "Historial clínico no encontrado" });
      }
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener historial clínico" });
    }
  });

  app.get("/api/clinical-histories/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const history = await storage.getClinicalHistoryByPatient(req.params.patientId);
      res.json(history || null);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener historial clínico del paciente" });
    }
  });

  app.post("/api/clinical-histories", requireAuth, async (req, res) => {
    try {
      const parsedBody: any = { ...req.body };
      if (parsedBody.fecha) {
        parsedBody.fecha = new Date(parsedBody.fecha);
      }
      
      const validatedData = insertClinicalHistorySchema.parse(parsedBody);
      
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient) {
        return res.status(400).json({ error: "El paciente seleccionado no existe" });
      }
      
      const existingHistory = await storage.getClinicalHistoryByPatient(validatedData.patientId);
      if (existingHistory) {
        return res.status(400).json({ error: "El paciente ya tiene un historial clínico. Puede editarlo en su lugar." });
      }
      
      const history = await storage.createClinicalHistory(validatedData);
      res.status(201).json(history);
    } catch (error) {
      res.status(400).json({ error: "Datos de historial clínico inválidos" });
    }
  });

  app.patch("/api/clinical-histories/:id", requireAuth, async (req, res) => {
    try {
      const parsedBody: any = { ...req.body };
      if (parsedBody.fecha) {
        parsedBody.fecha = new Date(parsedBody.fecha);
      }
      
      const validatedData = insertClinicalHistorySchema.partial().parse(parsedBody);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
      }
      
      const history = await storage.updateClinicalHistory(req.params.id, validatedData);
      if (!history) {
        return res.status(404).json({ error: "Historial clínico no encontrado" });
      }
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: "Datos de historial clínico inválidos" });
    }
  });

  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getUsers();
      const usersWithoutPassword = users.map(({ passwordHash, ...user }) => user);
      res.json(usersWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener usuario" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Ya existe un usuario con este email" });
      }
      
      const user = await storage.createUser({
        email: validatedData.email,
        passwordHash: validatedData.password,
        name: validatedData.name,
        role: validatedData.role,
        therapistId: validatedData.therapistId || null,
      });
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Datos de usuario inválidos" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.role) updates.role = req.body.role;
      if (req.body.therapistId !== undefined) updates.therapistId = req.body.therapistId || null;
      if (req.body.password) updates.passwordHash = req.body.password;
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
      }
      
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Datos de usuario inválidos" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUserId = req.session.userId;
      if (currentUserId === req.params.id) {
        return res.status(400).json({ error: "No puede eliminar su propia cuenta" });
      }
      
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  });

  app.get("/api/packages", requireAuth, async (req, res) => {
    try {
      const packages = await storage.getTherapyPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener paquetes" });
    }
  });

  app.get("/api/packages/:id", requireAuth, async (req, res) => {
    try {
      const pkg = await storage.getTherapyPackage(req.params.id);
      if (!pkg) {
        return res.status(404).json({ error: "Paquete no encontrado" });
      }
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener paquete" });
    }
  });

  app.get("/api/packages/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const packages = await storage.getTherapyPackagesByPatient(req.params.patientId);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener paquetes del paciente" });
    }
  });

  app.get("/api/packages/patient/:patientId/active", requireAuth, async (req, res) => {
    try {
      const pkg = await storage.getActivePackageByPatient(req.params.patientId);
      res.json(pkg || null);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener paquete activo" });
    }
  });

  app.post("/api/packages", requireAuth, async (req, res) => {
    try {
      const parsedBody = {
        ...req.body,
        purchaseDate: new Date(req.body.purchaseDate),
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : undefined,
      };
      
      const validatedData = insertTherapyPackageSchema.parse(parsedBody);
      
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient) {
        return res.status(400).json({ error: "El paciente no existe" });
      }
      
      const activePackage = await storage.getActivePackageByPatient(validatedData.patientId);
      if (activePackage) {
        return res.status(400).json({ error: "El paciente ya tiene un paquete activo. Debe finalizarlo antes de crear uno nuevo." });
      }
      
      const pkg = await storage.createTherapyPackage(validatedData);
      res.status(201).json(pkg);
    } catch (error) {
      res.status(400).json({ error: "Datos de paquete inválidos" });
    }
  });

  app.patch("/api/packages/:id", requireAuth, async (req, res) => {
    try {
      const parsedBody: any = { ...req.body };
      if (parsedBody.purchaseDate) {
        parsedBody.purchaseDate = new Date(parsedBody.purchaseDate);
      }
      if (parsedBody.expirationDate) {
        parsedBody.expirationDate = new Date(parsedBody.expirationDate);
      }
      
      const validatedData = insertTherapyPackageSchema.partial().parse(parsedBody);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
      }
      
      const pkg = await storage.updateTherapyPackage(req.params.id, validatedData);
      if (!pkg) {
        return res.status(404).json({ error: "Paquete no encontrado" });
      }
      res.json(pkg);
    } catch (error) {
      res.status(400).json({ error: "Datos de paquete inválidos" });
    }
  });

  app.delete("/api/packages/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTherapyPackage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Paquete no encontrado" });
      }
      res.json({ message: "Paquete eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar paquete" });
    }
  });

  app.post("/api/packages/:id/use-session", requireAuth, async (req, res) => {
    try {
      const pkg = await storage.getTherapyPackage(req.params.id);
      if (!pkg) {
        return res.status(404).json({ error: "Paquete no encontrado" });
      }
      
      const remaining = pkg.totalSessions - pkg.sessionsUsed;
      if (remaining <= 0) {
        return res.status(400).json({ error: "El paquete no tiene sesiones disponibles" });
      }
      
      const updatedPkg = await storage.usePackageSession(req.params.id);
      
      if (updatedPkg) {
        const newRemaining = updatedPkg.totalSessions - updatedPkg.sessionsUsed;
        const alertType = getAlertType(newRemaining);
        
        if (alertType) {
          let message = "";
          switch (alertType) {
            case "priority_red":
              message = `¡URGENTE! El paquete "${pkg.name}" tiene solo 1 sesión restante.`;
              break;
            case "red":
              message = `Alerta: El paquete "${pkg.name}" tiene ${newRemaining} sesiones restantes.`;
              break;
            case "yellow":
              message = `Recordatorio: El paquete "${pkg.name}" tiene ${newRemaining} sesiones restantes.`;
              break;
          }
          
          if (message) {
            await storage.createPackageAlert({
              packageId: pkg.id,
              patientId: pkg.patientId,
              alertType,
              message,
              method: "panel",
            });
          }
        }
      }
      
      res.json(updatedPkg);
    } catch (error) {
      res.status(500).json({ error: "Error al usar sesión del paquete" });
    }
  });

  app.get("/api/package-alerts", requireAuth, async (req, res) => {
    try {
      const alerts = await storage.getPackageAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener alertas" });
    }
  });

  app.get("/api/package-alerts/unread", requireAuth, async (req, res) => {
    try {
      const alerts = await storage.getUnreadAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener alertas no leídas" });
    }
  });

  app.patch("/api/package-alerts/:id/read", requireAuth, async (req, res) => {
    try {
      const alert = await storage.markAlertAsRead(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: "Alerta no encontrada" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Error al marcar alerta como leída" });
    }
  });

  app.get("/api/package-sessions/:packageId", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getPackageSessions(req.params.packageId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener sesiones del paquete" });
    }
  });

  app.post("/api/package-sessions", requireAuth, async (req, res) => {
    try {
      const parsedBody = {
        ...req.body,
        sessionDate: new Date(req.body.sessionDate),
      };
      
      const validatedData = insertPackageSessionSchema.parse(parsedBody);
      
      const pkg = await storage.getTherapyPackage(validatedData.packageId);
      if (!pkg) {
        return res.status(400).json({ error: "El paquete no existe" });
      }
      
      const session = await storage.createPackageSession(validatedData);
      
      if (validatedData.attendanceStatus === "attended") {
        await storage.usePackageSession(validatedData.packageId);
      }
      
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: "Datos de sesión inválidos" });
    }
  });

  app.get("/api/session-evidence/:sessionId", requireAuth, async (req, res) => {
    try {
      const evidence = await storage.getSessionEvidence(req.params.sessionId);
      res.json(evidence);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener evidencia" });
    }
  });

  app.get("/api/session-evidence/patient/:patientId", requireAuth, async (req, res) => {
    try {
      const evidence = await storage.getSessionEvidenceByPatient(req.params.patientId);
      res.json(evidence);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener evidencia del paciente" });
    }
  });

  app.post("/api/session-evidence", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSessionEvidenceSchema.parse(req.body);
      
      const evidence = await storage.createSessionEvidence(validatedData);
      res.status(201).json(evidence);
    } catch (error) {
      res.status(400).json({ error: "Datos de evidencia inválidos" });
    }
  });

  app.delete("/api/session-evidence/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteSessionEvidence(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Evidencia no encontrada" });
      }
      res.json({ message: "Evidencia eliminada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar evidencia" });
    }
  });

  app.get("/api/progress-notes/:patientId", requireAuth, async (req, res) => {
    try {
      const notes = await storage.getProgressNotes(req.params.patientId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener notas de progreso" });
    }
  });

  app.post("/api/progress-notes", requireAuth, async (req, res) => {
    try {
      const parsedBody = {
        ...req.body,
        date: new Date(req.body.date),
        therapistId: req.session.userId,
      };
      
      const validatedData = insertProgressNoteSchema.parse(parsedBody);
      
      const patient = await storage.getPatient(validatedData.patientId);
      if (!patient) {
        return res.status(400).json({ error: "El paciente no existe" });
      }
      
      const note = await storage.createProgressNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: "Datos de nota inválidos" });
    }
  });

  app.patch("/api/progress-notes/:id", requireAuth, async (req, res) => {
    try {
      const parsedBody: any = { ...req.body };
      if (parsedBody.date) {
        parsedBody.date = new Date(parsedBody.date);
      }
      
      const validatedData = insertProgressNoteSchema.partial().parse(parsedBody);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
      }
      
      const note = await storage.updateProgressNote(req.params.id, validatedData);
      if (!note) {
        return res.status(404).json({ error: "Nota no encontrada" });
      }
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Datos de nota inválidos" });
    }
  });

  app.delete("/api/progress-notes/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProgressNote(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Nota no encontrada" });
      }
      res.json({ message: "Nota eliminada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar nota" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
