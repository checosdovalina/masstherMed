import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, ClipboardList, Edit, Trash2, FileText, Users, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
import { ProtocolForm } from "@/components/protocol-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Protocol, TherapyType, ProtocolAssignment, Patient } from "@shared/schema";

export default function Protocols() {
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [editProtocol, setEditProtocol] = useState<Protocol | undefined>();
  const [deleteProtocolId, setDeleteProtocolId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: protocols, isLoading: protocolsLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  const { data: therapyTypes } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const { data: assignments } = useQuery<ProtocolAssignment[]>({
    queryKey: ["/api/protocol-assignments"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
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

  const sortedProtocols = [...(protocols || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getAssignmentsForProtocol = (protocolId: string) => {
    return assignments?.filter(a => a.protocolId === protocolId) || [];
  };

  const getActiveAssignmentsCount = (protocolId: string) => {
    return getAssignmentsForProtocol(protocolId).filter(a => a.status === "active").length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Protocolos de Tratamiento</h1>
          <p className="text-muted-foreground mt-1">
            Plantillas de tratamiento reutilizables para aplicar a múltiples pacientes
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
              <DialogDescription>
                {editProtocol 
                  ? "Modifica los detalles de este protocolo de tratamiento"
                  : "Crea una plantilla de tratamiento que podrás asignar a múltiples pacientes"
                }
              </DialogDescription>
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
              Crea protocolos de tratamiento que podrás asignar a múltiples pacientes
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
            const therapyType = therapyTypes?.find(tt => tt.id === protocol.therapyTypeId);
            const activeAssignments = getActiveAssignmentsCount(protocol.id);
            const totalAssignments = getAssignmentsForProtocol(protocol.id).length;

            return (
              <Card key={protocol.id} data-testid={`protocol-${protocol.id}`} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: therapyType?.color ? `${therapyType.color}20` : 'var(--primary)' }}
                      >
                        <FileText 
                          className="h-6 w-6" 
                          style={{ color: therapyType?.color || 'var(--primary)' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{protocol.name}</CardTitle>
                        <CardDescription className="truncate">
                          {therapyType?.name || "Sin tipo"}
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
                    <Badge variant="secondary">
                      {protocol.totalSessions} sesiones
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

                  {protocol.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {protocol.description}
                    </p>
                  )}

                  {protocol.objectives && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Objetivos</h4>
                      <p className="text-sm text-muted-foreground font-serif line-clamp-3">
                        {protocol.objectives}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {activeAssignments > 0 
                        ? `${activeAssignments} paciente${activeAssignments > 1 ? 's' : ''} activo${activeAssignments > 1 ? 's' : ''}`
                        : "Sin pacientes asignados"
                      }
                    </span>
                    {totalAssignments > activeAssignments && (
                      <span className="text-xs">
                        ({totalAssignments} total)
                      </span>
                    )}
                  </div>
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
              {deleteProtocolId && getAssignmentsForProtocol(deleteProtocolId).length > 0 && (
                <span className="block mt-2 text-destructive">
                  Advertencia: Este protocolo tiene pacientes asignados.
                </span>
              )}
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
