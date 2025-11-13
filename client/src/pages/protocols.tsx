import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, ClipboardList, Edit, Trash2, Calendar, FileText } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { ProtocolForm } from "@/components/protocol-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Protocol, Patient, TherapyType, Session, Therapist } from "@shared/schema";

export default function Protocols() {
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [editProtocol, setEditProtocol] = useState<Protocol | undefined>();
  const [deleteProtocolId, setDeleteProtocolId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: protocols, isLoading: protocolsLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: therapyTypes } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const { data: sessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: therapists } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const sessionsByProtocol = useMemo(() => {
    if (!sessions) return new Map<string, Session[]>();
    const map = new Map<string, Session[]>();
    sessions.forEach((session) => {
      if (session.protocolId) {
        const existing = map.get(session.protocolId) || [];
        map.set(session.protocolId, [...existing, session]);
      }
    });
    map.forEach((sessions, protocolId) => {
      sessions.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
    });
    return map;
  }, [sessions]);

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
          <h1 className="text-3xl font-bold">Protocolos de Tratamiento</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona planes de tratamiento personalizados para tus pacientes
          </p>
        </div>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : !protocols || protocols.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay protocolos registrados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea protocolos de tratamiento personalizados para tus pacientes con objetivos claros y seguimiento de progreso
            </p>
            <Button onClick={() => setProtocolDialogOpen(true)} data-testid="button-empty-add-protocol">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Protocolo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedProtocols.map((protocol) => {
            const patient = patients?.find(p => p.id === protocol.patientId);
            const therapyType = therapyTypes?.find(tt => tt.id === protocol.therapyTypeId);
            const progressPercent = (protocol.completedSessions / protocol.totalSessions) * 100;
            const startDate = new Date(protocol.startDate);
            const endDate = protocol.endDate ? new Date(protocol.endDate) : null;

            return (
              <Card key={protocol.id} data-testid={`protocol-${protocol.id}`} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
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
                    <div className="flex gap-1 flex-shrink-0">
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
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {startDate.toLocaleDateString('es-ES')}
                      {endDate && ` - ${endDate.toLocaleDateString('es-ES')}`}
                    </span>
                  </div>

                  {protocol.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
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
                      <p className="text-sm text-muted-foreground font-serif line-clamp-3">
                        {protocol.objectives}
                      </p>
                    </div>
                  )}

                  {sessionsByProtocol.get(protocol.id) && sessionsByProtocol.get(protocol.id)!.length > 0 && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Ver {sessionsByProtocol.get(protocol.id)!.length} sesiones vinculadas
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {sessionsByProtocol.get(protocol.id)!.map((session) => {
                          const therapist = therapists?.find(t => t.id === session.therapistId);
                          const sessionDate = new Date(session.sessionDate);
                          return (
                            <div 
                              key={session.id} 
                              className="p-2 border rounded-md text-sm bg-background"
                              data-testid={`protocol-session-${session.id}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {sessionDate.toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {therapist?.name} • {session.duration}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  Sesión #{sessionsByProtocol.get(protocol.id)!.indexOf(session) + 1}
                                </Badge>
                              </div>
                              {session.notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {session.notes}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
