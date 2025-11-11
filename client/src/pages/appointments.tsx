import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointment-form";
import type { Appointment, Patient, Therapist, TherapyType } from "@shared/schema";

export default function Appointments() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
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

  const groupedAppointments = appointments?.reduce((acc, apt) => {
    const date = new Date(apt.startTime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments || {}).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      scheduled: { variant: "default", label: "Programada" },
      in_progress: { variant: "outline", label: "En Progreso" },
      completed: { variant: "secondary", label: "Completada" },
      cancelled: { variant: "destructive", label: "Cancelada" },
    };
    return variants[status] || variants.scheduled;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Citas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y programa las citas de terapia
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-appointment">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Nueva Cita</DialogTitle>
            </DialogHeader>
            <AppointmentForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {appointmentsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !appointments || appointments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay citas programadas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comienza agregando una nueva cita para tus pacientes
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-empty-add-appointment">
              <Plus className="h-4 w-4 mr-2" />
              Programar Primera Cita
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => {
            const date = new Date(dateStr);
            const dayAppointments = groupedAppointments![dateStr].sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );

            return (
              <Card key={dateStr}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {date.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayAppointments.map((appointment) => {
                    const patient = patients?.find(p => p.id === appointment.patientId);
                    const therapist = therapists?.find(t => t.id === appointment.therapistId);
                    const therapyType = therapyTypes?.find(tt => tt.id === appointment.therapyTypeId);
                    const startTime = new Date(appointment.startTime);
                    const endTime = new Date(appointment.endTime);
                    const statusInfo = getStatusBadge(appointment.status);

                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-4 p-4 rounded-md bg-muted/30 hover-elevate"
                        data-testid={`appointment-item-${appointment.id}`}
                      >
                        <div className="flex-shrink-0">
                          <div className="text-center">
                            <div className="text-sm font-semibold">
                              {startTime.toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {endTime.toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="w-1 h-12 rounded-full" style={{ backgroundColor: therapyType?.color || "#888" }} />

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">
                              {patient?.firstName} {patient?.lastName}
                            </h4>
                            <Badge variant={statusInfo.variant} data-testid={`badge-status-${appointment.id}`}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {therapyType?.name} • {therapist?.name}
                          </p>
                          {appointment.notes && (
                            <p className="text-xs text-muted-foreground italic">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
