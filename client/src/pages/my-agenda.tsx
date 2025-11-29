import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, FileText, Plus, Eye, Edit2, AlertCircle } from "lucide-react";
import { format, isToday, isTomorrow, isPast, isFuture, startOfDay, endOfDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Appointment, Session, Patient, TherapyType } from "@shared/schema";

const sessionFormSchema = z.object({
  notes: z.string().optional(),
  observations: z.string().optional(),
  progress: z.string().optional(),
  duration: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

export default function MyAgenda() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const therapistId = user?.therapistId;

  const { data: appointments = [], isLoading: loadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", therapistId],
    queryFn: async () => {
      if (!therapistId) return [];
      const res = await fetch(`/api/appointments?therapistId=${therapistId}`);
      if (!res.ok) throw new Error("Error al cargar citas");
      return res.json();
    },
    enabled: !!therapistId,
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions", therapistId],
    queryFn: async () => {
      if (!therapistId) return [];
      const res = await fetch(`/api/sessions?therapistId=${therapistId}`);
      if (!res.ok) throw new Error("Error al cargar sesiones");
      return res.json();
    },
    enabled: !!therapistId,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: therapyTypes = [] } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      notes: "",
      observations: "",
      progress: "",
      duration: "60",
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/sessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", therapistId] });
      toast({ title: "Sesión registrada exitosamente" });
      setShowNewSessionModal(false);
      setSelectedAppointment(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error al registrar sesión", variant: "destructive" });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SessionFormValues> }) => {
      const res = await apiRequest("PATCH", `/api/sessions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", therapistId] });
      toast({ title: "Sesión actualizada exitosamente" });
      setShowSessionModal(false);
      setEditingSession(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error al actualizar sesión", variant: "destructive" });
    },
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Paciente desconocido";
  };

  const getTherapyTypeName = (therapyTypeId: string) => {
    const type = therapyTypes.find((t) => t.id === therapyTypeId);
    return type?.name || "Sin tipo";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      scheduled: { label: "Programada", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      confirmed: { label: "Confirmada", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      in_progress: { label: "En progreso", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      completed: { label: "Completada", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
      cancelled: { label: "Cancelada", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      no_show: { label: "No asistió", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
    };
    const variant = variants[status] || variants.scheduled;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const todayAppointments = appointments.filter((a) => isToday(new Date(a.startTime)));
  const tomorrowAppointments = appointments.filter((a) => isTomorrow(new Date(a.startTime)));
  const upcomingAppointments = appointments.filter((a) => {
    const date = new Date(a.startTime);
    return isFuture(date) && !isToday(date) && !isTomorrow(date);
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const pastAppointments = appointments.filter((a) => isPast(new Date(a.endTime)) && !isToday(new Date(a.startTime)))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const handleOpenAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const existingSession = sessions.find(
      (s) => s.patientId === appointment.patientId && 
             format(new Date(s.sessionDate), "yyyy-MM-dd") === format(new Date(appointment.startTime), "yyyy-MM-dd")
    );
    if (existingSession) {
      setEditingSession(existingSession);
      form.reset({
        notes: existingSession.notes || "",
        observations: existingSession.observations || "",
        progress: existingSession.progress || "",
        duration: existingSession.duration || "60",
      });
      setShowSessionModal(true);
    } else {
      form.reset({
        notes: "",
        observations: "",
        progress: "",
        duration: "60",
      });
      setShowNewSessionModal(true);
    }
  };

  const handleCreateSession = (values: SessionFormValues) => {
    if (!selectedAppointment || !therapistId) return;
    
    createSessionMutation.mutate({
      patientId: selectedAppointment.patientId,
      therapistId: therapistId,
      therapyTypeId: selectedAppointment.therapyTypeId,
      sessionDate: new Date(selectedAppointment.startTime).toISOString(),
      notes: values.notes || null,
      observations: values.observations || null,
      progress: values.progress || null,
      duration: values.duration || "60",
    });
  };

  const handleUpdateSession = (values: SessionFormValues) => {
    if (!editingSession) return;
    updateSessionMutation.mutate({
      id: editingSession.id,
      data: values,
    });
  };

  if (!therapistId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Acceso Restringido</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Esta vista está disponible solo para usuarios con perfil de terapeuta vinculado.
          Contacta al administrador para vincular tu cuenta con un perfil de terapeuta.
        </p>
      </div>
    );
  }

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="hover-elevate cursor-pointer" onClick={() => handleOpenAppointment(appointment)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate" data-testid={`text-patient-${appointment.id}`}>
                {getPatientName(appointment.patientId)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>
                {format(new Date(appointment.startTime), "HH:mm")} - {format(new Date(appointment.endTime), "HH:mm")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{getTherapyTypeName(appointment.therapyTypeId)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(appointment.status)}
            <Button size="sm" variant="outline" data-testid={`button-open-${appointment.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              Abrir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AppointmentList = ({ appointments, emptyMessage }: { appointments: Appointment[]; emptyMessage: string }) => (
    <div className="space-y-3">
      {appointments.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
      ) : (
        appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Mi Agenda</h1>
          <p className="text-muted-foreground">Gestiona tus citas y registra sesiones clínicas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{todayAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Citas Hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{tomorrowAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Citas Mañana</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">Sesiones Registradas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" data-testid="tab-today">
            Hoy ({todayAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="tomorrow" data-testid="tab-tomorrow">
            Mañana ({tomorrowAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">
            Próximas ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past" data-testid="tab-past">
            Pasadas ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Citas de Hoy - {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <p className="text-center py-4">Cargando...</p>
              ) : (
                <AppointmentList 
                  appointments={todayAppointments} 
                  emptyMessage="No tienes citas programadas para hoy" 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tomorrow" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Citas de Mañana - {format(addDays(new Date(), 1), "EEEE d 'de' MMMM", { locale: es })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <p className="text-center py-4">Cargando...</p>
              ) : (
                <AppointmentList 
                  appointments={tomorrowAppointments} 
                  emptyMessage="No tienes citas programadas para mañana" 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <p className="text-center py-4">Cargando...</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No tienes citas próximas programadas</p>
                  ) : (
                    upcomingAppointments.map((appointment) => (
                      <div key={appointment.id}>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {format(new Date(appointment.startTime), "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                        <AppointmentCard appointment={appointment} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Citas Pasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <p className="text-center py-4">Cargando...</p>
              ) : (
                <div className="space-y-3">
                  {pastAppointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No hay citas pasadas</p>
                  ) : (
                    pastAppointments.slice(0, 20).map((appointment) => (
                      <div key={appointment.id}>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {format(new Date(appointment.startTime), "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                        <AppointmentCard appointment={appointment} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showNewSessionModal} onOpenChange={setShowNewSessionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Registrar Nueva Sesión
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">{getPatientName(selectedAppointment.patientId)}</p>
              <p className="text-sm text-muted-foreground">
                {getTherapyTypeName(selectedAppointment.therapyTypeId)} - {format(new Date(selectedAppointment.startTime), "d/MM/yyyy HH:mm")}
              </p>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-duration" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas de la Sesión</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción del tratamiento aplicado..." 
                        className="min-h-[100px]"
                        {...field} 
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones Clínicas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones relevantes del paciente..." 
                        className="min-h-[80px]"
                        {...field} 
                        data-testid="input-observations"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progreso del Paciente</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Evolución y mejoras observadas..." 
                        className="min-h-[80px]"
                        {...field} 
                        data-testid="input-progress"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewSessionModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createSessionMutation.isPending} data-testid="button-save-session">
                  {createSessionMutation.isPending ? "Guardando..." : "Registrar Sesión"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Editar Sesión
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">{getPatientName(selectedAppointment.patientId)}</p>
              <p className="text-sm text-muted-foreground">
                {getTherapyTypeName(selectedAppointment.therapyTypeId)} - {format(new Date(selectedAppointment.startTime), "d/MM/yyyy HH:mm")}
              </p>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateSession)} className="space-y-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-edit-duration" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas de la Sesión</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción del tratamiento aplicado..." 
                        className="min-h-[100px]"
                        {...field} 
                        data-testid="input-edit-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones Clínicas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones relevantes del paciente..." 
                        className="min-h-[80px]"
                        {...field} 
                        data-testid="input-edit-observations"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progreso del Paciente</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Evolución y mejoras observadas..." 
                        className="min-h-[80px]"
                        {...field} 
                        data-testid="input-edit-progress"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowSessionModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateSessionMutation.isPending} data-testid="button-update-session">
                  {updateSessionMutation.isPending ? "Guardando..." : "Actualizar Sesión"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
