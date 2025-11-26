import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, FileText, Search, Image, File, Camera, Trash2, Calendar, User, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SessionForm } from "@/components/session-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Session, Patient, Therapist, TherapyType, SessionEvidence, ProgressNote } from "@shared/schema";

const evidenceFormSchema = z.object({
  fileUrl: z.string().min(1, "El archivo es requerido"),
  fileType: z.enum(["image", "document"]),
  description: z.string().optional(),
  fileName: z.string().optional(),
});

const progressNoteFormSchema = z.object({
  patientId: z.string().min(1, "Seleccione un paciente"),
  date: z.string().min(1, "La fecha es requerida"),
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  category: z.string().optional(),
});

type EvidenceFormData = z.infer<typeof evidenceFormSchema>;
type ProgressNoteFormData = z.infer<typeof progressNoteFormSchema>;

function EvidenceForm({ sessionId, patientId, onSuccess }: { sessionId: string; patientId: string; onSuccess: () => void }) {
  const { toast } = useToast();

  const form = useForm<EvidenceFormData>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues: {
      fileUrl: "",
      fileType: "image",
      description: "",
      fileName: "",
    },
  });

  const createEvidenceMutation = useMutation({
    mutationFn: async (data: EvidenceFormData) => {
      return await apiRequest("POST", "/api/session-evidence", {
        ...data,
        sessionId,
        patientId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-evidence", patientId] });
      toast({
        title: "Evidencia agregada",
        description: "La evidencia se ha guardado exitosamente",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo agregar la evidencia",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    form.setValue("fileType", isImage ? "image" : "document");
    form.setValue("fileName", file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      form.setValue("fileUrl", base64);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: EvidenceFormData) => {
    createEvidenceMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fileUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargar Archivo</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    data-testid="input-file-upload" 
                    className="flex-1"
                  />
                </div>
              </FormControl>
              {form.watch("fileName") && (
                <p className="text-xs text-green-600">✓ {form.watch("fileName")} cargado</p>
              )}
              <p className="text-xs text-muted-foreground">
                Soporta imágenes, PDF y documentos
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fileType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-file-type">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="image">Imagen/Foto</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe la evidencia..." 
                  {...field} 
                  data-testid="input-evidence-description" 
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={createEvidenceMutation.isPending || !form.watch("fileUrl")} data-testid="button-submit-evidence">
            {createEvidenceMutation.isPending ? "Guardando..." : "Agregar Evidencia"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ProgressNoteForm({ patientId, onSuccess }: { patientId?: string; onSuccess: () => void }) {
  const { toast } = useToast();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const form = useForm<ProgressNoteFormData>({
    resolver: zodResolver(progressNoteFormSchema),
    defaultValues: {
      patientId: patientId || "",
      date: new Date().toISOString().split("T")[0],
      title: "",
      content: "",
      category: "general",
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: ProgressNoteFormData) => {
      return await apiRequest("POST", "/api/progress-notes", {
        ...data,
        date: data.date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-notes"] });
      toast({
        title: "Nota de progreso agregada",
        description: "La nota se ha guardado exitosamente",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo agregar la nota",
      });
    },
  });

  const onSubmit = (data: ProgressNoteFormData) => {
    createNoteMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!patientId && (
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-patient-note">
                      <SelectValue placeholder="Seleccione un paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients?.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} data-testid="input-note-date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Sesión de seguimiento" {...field} data-testid="input-note-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-note-category">
                    <SelectValue placeholder="Seleccione categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="improvement">Mejora</SelectItem>
                  <SelectItem value="concern">Preocupación</SelectItem>
                  <SelectItem value="milestone">Hito alcanzado</SelectItem>
                  <SelectItem value="observation">Observación</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe el progreso del paciente..." 
                  className="min-h-[120px]"
                  {...field} 
                  data-testid="input-note-content" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={createNoteMutation.isPending} data-testid="button-submit-note">
            {createNoteMutation.isPending ? "Guardando..." : "Agregar Nota"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function PatientEvidence({ patientId }: { patientId: string }) {
  const { toast } = useToast();

  const { data: evidence, isLoading } = useQuery<SessionEvidence[]>({
    queryKey: ["/api/session-evidence/patient", patientId],
    queryFn: async () => {
      const res = await fetch(`/api/session-evidence/patient/${patientId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar evidencia");
      return res.json();
    },
  });

  const deleteEvidenceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/session-evidence/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-evidence/patient", patientId] });
      toast({
        title: "Evidencia eliminada",
        description: "La evidencia se ha eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la evidencia",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  if (!evidence || evidence.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin evidencia clínica</h3>
          <p className="text-sm text-muted-foreground">
            No hay fotos ni documentos agregados para este paciente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {evidence.map((item) => (
        <Card key={item.id} data-testid={`evidence-${item.id}`}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                {item.fileType === "image" ? (
                  <Camera className="h-4 w-4 text-primary" />
                ) : (
                  <File className="h-4 w-4 text-primary" />
                )}
                <Badge variant="outline">
                  {item.fileType === "image" ? "Imagen" : "Documento"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteEvidenceMutation.mutate(item.id)}
                disabled={deleteEvidenceMutation.isPending}
                data-testid={`button-delete-evidence-${item.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {item.fileType === "image" ? (
              <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                <img 
                  src={item.fileUrl} 
                  alt={item.description || "Evidencia clínica"}
                  className="w-full h-32 object-cover rounded-md mb-2"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='12' fill='%23999' text-anchor='middle'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                  }}
                />
              </a>
            ) : (
              <a 
                href={item.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-4 bg-muted rounded-md hover-elevate"
              >
                <File className="h-8 w-8 text-primary" />
                <span className="text-sm">Ver documento</span>
              </a>
            )}
            
            {item.description && (
              <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(item.createdAt), "PPp", { locale: es })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PatientProgressNotes({ patientId }: { patientId: string }) {
  const { toast } = useToast();

  const { data: notes, isLoading } = useQuery<ProgressNote[]>({
    queryKey: ["/api/progress-notes", patientId],
    queryFn: async () => {
      const res = await fetch(`/api/progress-notes/${patientId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar notas");
      return res.json();
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/progress-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-notes", patientId] });
      toast({
        title: "Nota eliminada",
        description: "La nota se ha eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la nota",
      });
    },
  });

  const getCategoryBadge = (category: string | null | undefined) => {
    switch (category) {
      case "improvement":
        return <Badge className="bg-green-500">Mejora</Badge>;
      case "concern":
        return <Badge variant="destructive">Preocupación</Badge>;
      case "milestone":
        return <Badge className="bg-blue-500">Hito</Badge>;
      case "observation":
        return <Badge variant="secondary">Observación</Badge>;
      default:
        return <Badge variant="outline">General</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin notas de progreso</h3>
          <p className="text-sm text-muted-foreground">
            No hay notas de seguimiento registradas para este paciente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id} data-testid={`note-${note.id}`}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryBadge(note.category)}
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(note.date), "PP", { locale: es })}
                  </span>
                </div>
                <p className="text-sm font-serif whitespace-pre-wrap">{note.content}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteNoteMutation.mutate(note.id)}
                disabled={deleteNoteMutation.isPending}
                data-testid={`button-delete-note-${note.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Records() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("all");
  const [selectedSessionForEvidence, setSelectedSessionForEvidence] = useState<{ id: string; patientId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: therapists } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const { data: therapyTypes } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const getPatientName = (patientId: string) => {
    const patient = patients?.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Paciente";
  };

  const filteredSessions = sessions?.filter((session) => {
    const patientName = getPatientName(session.patientId).toLowerCase();
    const matchesSearch = patientName.includes(searchQuery.toLowerCase());
    const matchesPatient = selectedPatientId === "all" || session.patientId === selectedPatientId;
    return matchesSearch && matchesPatient;
  }) || [];

  const sortedSessions = [...filteredSessions].sort(
    (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  const selectedPatient = patients?.find((p) => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expedientes Clínicos</h1>
          <p className="text-muted-foreground mt-1">
            Historial de sesiones, evidencia clínica y notas de progreso
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-add-note">
                <TrendingUp className="h-4 w-4 mr-2" />
                Nota de Progreso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Agregar Nota de Progreso</DialogTitle>
              </DialogHeader>
              <ProgressNoteForm 
                patientId={selectedPatientId !== "all" ? selectedPatientId : undefined}
                onSuccess={() => setNoteDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-session">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Sesión
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Sesión</DialogTitle>
              </DialogHeader>
              <SessionForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-records"
          />
        </div>
        <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
          <SelectTrigger className="w-[250px]" data-testid="select-patient-filter">
            <SelectValue placeholder="Filtrar por paciente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los pacientes</SelectItem>
            {patients?.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPatientId !== "all" && selectedPatient && (
        <Tabs defaultValue="sessions">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {selectedPatient.avatarInitials}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">Expediente clínico</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedPatientId("all")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <TabsList>
            <TabsTrigger value="sessions" data-testid="tab-sessions">
              <FileText className="h-4 w-4 mr-2" />
              Sesiones
            </TabsTrigger>
            <TabsTrigger value="evidence" data-testid="tab-evidence">
              <Image className="h-4 w-4 mr-2" />
              Evidencia
            </TabsTrigger>
            <TabsTrigger value="progress" data-testid="tab-progress">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progreso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="mt-4">
            <SessionsList
              sessions={sortedSessions}
              patients={patients}
              therapists={therapists}
              therapyTypes={therapyTypes}
              onAddEvidence={(sessionId, patientId) => {
                setSelectedSessionForEvidence({ id: sessionId, patientId });
                setEvidenceDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="evidence" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Evidencia Clínica</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const latestSession = sortedSessions[0];
                  if (latestSession) {
                    setSelectedSessionForEvidence({ id: latestSession.id, patientId: latestSession.patientId });
                    setEvidenceDialogOpen(true);
                  }
                }}
                disabled={sortedSessions.length === 0}
                data-testid="button-add-evidence"
              >
                <Camera className="h-4 w-4 mr-2" />
                Agregar Evidencia
              </Button>
            </div>
            <PatientEvidence patientId={selectedPatientId} />
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notas de Progreso</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setNoteDialogOpen(true)}
                data-testid="button-add-progress-note"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Nota
              </Button>
            </div>
            <PatientProgressNotes patientId={selectedPatientId} />
          </TabsContent>
        </Tabs>
      )}

      {selectedPatientId === "all" && (
        <SessionsList
          sessions={sortedSessions}
          patients={patients}
          therapists={therapists}
          therapyTypes={therapyTypes}
          isLoading={sessionsLoading}
          onAddEvidence={(sessionId, patientId) => {
            setSelectedSessionForEvidence({ id: sessionId, patientId });
            setEvidenceDialogOpen(true);
          }}
          onEmptyAddSession={() => setDialogOpen(true)}
        />
      )}

      <Dialog open={evidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Evidencia Clínica</DialogTitle>
          </DialogHeader>
          {selectedSessionForEvidence && (
            <EvidenceForm
              sessionId={selectedSessionForEvidence.id}
              patientId={selectedSessionForEvidence.patientId}
              onSuccess={() => {
                setEvidenceDialogOpen(false);
                setSelectedSessionForEvidence(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionsList({
  sessions,
  patients,
  therapists,
  therapyTypes,
  isLoading,
  onAddEvidence,
  onEmptyAddSession,
}: {
  sessions: Session[];
  patients?: Patient[];
  therapists?: Therapist[];
  therapyTypes?: TherapyType[];
  isLoading?: boolean;
  onAddEvidence: (sessionId: string, patientId: string) => void;
  onEmptyAddSession?: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay sesiones registradas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Registra las sesiones realizadas para mantener un historial clínico completo
          </p>
          {onEmptyAddSession && (
            <Button onClick={onEmptyAddSession} data-testid="button-empty-add-session">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primera Sesión
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const patient = patients?.find((p) => p.id === session.patientId);
        const therapist = therapists?.find((t) => t.id === session.therapistId);
        const therapyType = therapyTypes?.find((tt) => tt.id === session.therapyTypeId);
        const sessionDate = new Date(session.sessionDate);

        return (
          <Card key={session.id} data-testid={`session-${session.id}`}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {patient?.avatarInitials || "?"}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {patient?.firstName} {patient?.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {therapist?.name} - {therapyType?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddEvidence(session.id, session.patientId)}
                    data-testid={`button-add-evidence-${session.id}`}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Evidencia
                  </Button>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium">
                      {format(sessionDate, "PP", { locale: es })}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {session.duration}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.notes && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Notas de la Sesión</h4>
                  <p className="text-sm text-muted-foreground font-serif whitespace-pre-wrap">
                    {session.notes}
                  </p>
                </div>
              )}
              {session.observations && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Observaciones</h4>
                  <p className="text-sm text-muted-foreground font-serif whitespace-pre-wrap">
                    {session.observations}
                  </p>
                </div>
              )}
              {session.progress && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Progreso</h4>
                  <p className="text-sm text-muted-foreground font-serif whitespace-pre-wrap">
                    {session.progress}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
