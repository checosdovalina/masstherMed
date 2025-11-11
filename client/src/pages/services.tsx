import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
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
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { TherapyTypeForm } from "@/components/therapy-type-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TherapyType } from "@shared/schema";

export default function Services() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<TherapyType | null>(null);
  const [deletingService, setDeletingService] = useState<TherapyType | null>(null);
  const { toast } = useToast();

  const { data: services, isLoading } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/therapy-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-types"] });
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado exitosamente.",
      });
      setDeletingService(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Servicios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los tipos de terapia disponibles
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-service">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Servicio</DialogTitle>
            </DialogHeader>
            <TherapyTypeForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Servicio</DialogTitle>
            </DialogHeader>
            {editingService && (
              <TherapyTypeForm 
                therapyType={editingService} 
                onSuccess={() => setEditingService(null)} 
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingService} onOpenChange={(open) => !open && setDeletingService(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el servicio{" "}
                <strong>{deletingService?.name}</strong> del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={deleteServiceMutation.isPending}
                data-testid="button-cancel-delete"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingService && deleteServiceMutation.mutate(deletingService.id)}
                disabled={deleteServiceMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteServiceMutation.isPending ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !services || services.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-semibold mb-2">No hay servicios registrados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Agrega servicios para definir los tipos de terapia disponibles
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-empty-add-service">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primer Servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="hover-elevate" data-testid={`card-service-${service.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: service.color }}
                      />
                      <span className="truncate">{service.name}</span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.description && (
                  <CardDescription className="line-clamp-3">
                    {service.description}
                  </CardDescription>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {service.color}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(service)}
                  data-testid={`button-edit-service-${service.id}`}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingService(service)}
                  data-testid={`button-delete-service-${service.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
