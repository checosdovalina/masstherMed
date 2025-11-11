import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Patient, Appointment, Session, Therapist, TherapyType } from "@shared/schema";

export default function PatientDetail() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;

  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: ["/api/patients", patientId],
  });

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: sessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: therapists } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const { data: therapyTypes } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const patientAppointments = appointments?.filter(a => a.patientId === patientId) || [];
  const patientSessions = sessions?.filter(s => s.patientId === patientId) || [];

  const sortedSessions = [...patientSessions].sort(
    (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  const upcomingAppointments = patientAppointments
    .filter(a => new Date(a.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (patientLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Paciente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pacientes">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-muted-foreground mt-1">Expediente del paciente</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-semibold text-primary">
                  {patient.avatarInitials}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center pb-4 border-b">
              <h3 className="font-semibold text-lg">
                {patient.firstName} {patient.lastName}
              </h3>
              <Badge 
                variant={patient.status === "active" ? "default" : "secondary"}
                className="mt-2"
              >
                {patient.status === "active" ? "Activo" : 
                 patient.status === "inactive" ? "Inactivo" : "Alta"}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Fecha de Nacimiento</p>
                <p className="font-medium">{patient.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Teléfono</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
              {patient.email && (
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{patient.email}</p>
                </div>
              )}
              {patient.address && (
                <div>
                  <p className="text-muted-foreground">Dirección</p>
                  <p className="font-medium">{patient.address}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="font-semibold text-sm">Contacto de Emergencia</h4>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{patient.emergencyContact}</p>
                <p className="text-muted-foreground">{patient.emergencyPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments" data-testid="tab-trigger-appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Citas
              </TabsTrigger>
              <TabsTrigger value="sessions" data-testid="tab-trigger-sessions">
                <FileText className="h-4 w-4 mr-2" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-4 mt-4">
              {upcomingAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <h4 className="font-semibold mb-1">No hay citas programadas</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Este paciente no tiene citas próximas
                    </p>
                    <Link href="/citas">
                      <Button variant="outline" data-testid="button-go-to-appointments">
                        Ir a Programar Citas
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((appointment) => {
                  const therapist = therapists?.find(t => t.id === appointment.therapistId);
                  const therapyType = therapyTypes?.find(tt => tt.id === appointment.therapyTypeId);
                  const startTime = new Date(appointment.startTime);
                  const endTime = new Date(appointment.endTime);

                  return (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-16 rounded-full" style={{ backgroundColor: therapyType?.color || "#888" }} />
                          <div className="flex-1">
                            <h4 className="font-semibold">{therapyType?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {therapist?.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {startTime.toLocaleDateString('es-ES')} • {' '}
                              {startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              {' - '}
                              {endTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4 mt-4">
              {sortedSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <h4 className="font-semibold mb-1">No hay sesiones registradas</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      No se han registrado sesiones clínicas para este paciente
                    </p>
                    <Link href="/expedientes">
                      <Button variant="outline" data-testid="button-go-to-records">
                        Ir a Registrar Sesiones
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                sortedSessions.map((session) => {
                  const therapist = therapists?.find(t => t.id === session.therapistId);
                  const therapyType = therapyTypes?.find(tt => tt.id === session.therapyTypeId);
                  const sessionDate = new Date(session.sessionDate);

                  return (
                    <Card key={session.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {therapyType?.name}
                          </CardTitle>
                          <Badge variant="secondary">{session.duration}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sessionDate.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} • {therapist?.name}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {session.notes && (
                          <div>
                            <h5 className="text-sm font-semibold mb-1">Notas</h5>
                            <p className="text-sm text-muted-foreground font-serif">
                              {session.notes}
                            </p>
                          </div>
                        )}
                        {session.progress && (
                          <div>
                            <h5 className="text-sm font-semibold mb-1">Progreso</h5>
                            <p className="text-sm text-muted-foreground font-serif">
                              {session.progress}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
