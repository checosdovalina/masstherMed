import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, FileText, ClipboardList, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SessionForm } from "@/components/session-form";
import { ProtocolForm } from "@/components/protocol-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Session, Protocol, Patient, Therapist, TherapyType } from "@shared/schema";

export default function Records() {
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [editProtocol, setEditProtocol] = useState<Protocol | undefined>();
  const [deleteProtocolId, setDeleteProtocolId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: protocols, isLoading: protocolsLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
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

  const deleteProtocolMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/protocols/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({
        title: "Protocolo eliminado",
        description: "El protocolo ha sido eliminado exitosamente.",
      });
      setDeleteProtocolId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el protocolo.",
        variant: "destructive",
      });
    },
  });

  const sortedSessions = [...(sessions || [])].sort(
    (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  const sortedProtocols = [...(protocols || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expedientes Clínicos</h1>
          <p className="text-muted-foreground mt-1">
            Protocolos de tratamiento y registro de sesiones
          </p>
        </div>
      </div>

      <Tabs defaultValue="protocols" className="space-y-4">
        <TabsList data-testid="tabs-records">
          <TabsTrigger value="protocols" data-testid="tab-protocols">
            <ClipboardList className="h-4 w-4 mr-2" />
            Protocolos
          </TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions">
            <FileText className="h-4 w-4 mr-2" />
            Sesiones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={protocolDialogOpen} onOpenChange={(open) => {
              setProtocolDialogOpen(open);
              if (!open) setEditProtocol(undefined);
            }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-protocol">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Protocolo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editProtocol ? "Editar Protocolo" : "Crear Nuevo Protocolo"}
                  </DialogTitle>
                </DialogHeader>
                <ProtocolForm
                  protocol={editProtocol}
                  onSuccess={() => {
                    setProtocolDialogOpen(false);
                    setEditProtocol(undefined);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {protocolsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : !protocols || protocols.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay protocolos registrados</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea protocolos de tratamiento personalizados para tus pacientes
                </p>
                <Button onClick={() => setProtocolDialogOpen(true)} data-testid="button-empty-add-protocol">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Protocolo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedProtocols.map((protocol) => {
                const patient = patients?.find(p => p.id === protocol.patientId);
                const therapyType = therapyTypes?.find(tt => tt.id === protocol.therapyTypeId);
                const progressPercent = (protocol.completedSessions / protocol.totalSessions) * 100;
                const startDate = new Date(protocol.startDate);

                return (
                  <Card key={protocol.id} data-testid={`protocol-${protocol.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {patient?.avatarInitials || "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{protocol.name}</CardTitle>
                            <CardDescription className="truncate">
                              {patient?.firstName} {patient?.lastName}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditProtocol(protocol);
                              setProtocolDialogOpen(true);
                            }}
                            data-testid={`button-edit-protocol-${protocol.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteProtocolId(protocol.id)}
                            data-testid={`button-delete-protocol-${protocol.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(protocol.status)}>
                          {getStatusLabel(protocol.status)}
                        </Badge>
                        {therapyType && (
                          <Badge 
                            variant="outline" 
                            style={{ borderColor: therapyType.color, color: therapyType.color }}
                          >
                            {therapyType.name}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Inicio: {startDate.toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      {protocol.description && (
                        <p className="text-sm text-muted-foreground">
                          {protocol.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Progreso</span>
                          <span className="text-muted-foreground">
                            {protocol.completedSessions} / {protocol.totalSessions} sesiones
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>

                      {protocol.objectives && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Objetivos</h4>
                          <p className="text-sm text-muted-foreground font-serif whitespace-pre-wrap">
                            {protocol.objectives}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
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
                <SessionForm onSuccess={() => setSessionDialogOpen(false)} />
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
                <Button onClick={() => setSessionDialogOpen(true)} data-testid="button-empty-add-session">
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
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteProtocolId} onOpenChange={(open) => !open && setDeleteProtocolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar protocolo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El protocolo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-protocol">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProtocolId && deleteProtocolMutation.mutate(deleteProtocolId)}
              data-testid="button-confirm-delete-protocol"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
