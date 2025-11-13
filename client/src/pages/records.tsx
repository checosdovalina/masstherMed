import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionForm } from "@/components/session-form";
import type { Session, Patient, Therapist, TherapyType } from "@shared/schema";

export default function Records() {
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const sortedSessions = [...(sessions || [])].sort(
    (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expedientes Clínicos</h1>
          <p className="text-muted-foreground mt-1">
            Historial de sesiones clínicas y notas de tratamiento
          </p>
        </div>
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

      {sessionsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay sesiones registradas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Registra las sesiones realizadas para mantener un historial clínico completo
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-empty-add-session">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primera Sesión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map((session) => {
            const patient = patients?.find(p => p.id === session.patientId);
            const therapist = therapists?.find(t => t.id === session.therapistId);
            const therapyType = therapyTypes?.find(tt => tt.id === session.therapyTypeId);
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
                          {therapist?.name} • {therapyType?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">
                        {sessionDate.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {session.duration}
                      </Badge>
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
      )}
    </div>
  );
}
