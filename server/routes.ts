import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTherapyTypeSchema,
  insertTherapistSchema,
  insertPatientSchema,
  insertAppointmentSchema,
  insertSessionSchema,
  loginSchema
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
      const validatedData = insertSessionSchema.parse(parsedBody);
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
