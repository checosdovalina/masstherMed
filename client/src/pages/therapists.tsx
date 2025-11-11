import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
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
import { TherapistForm } from "@/components/therapist-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Therapist } from "@shared/schema";

export default function Therapists() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [deletingTherapist, setDeletingTherapist] = useState<Therapist | null>(null);
  const { toast } = useToast();

  const { data: therapists, isLoading } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const deleteTherapistMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/therapists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapists"] });
      toast({
        title: "Terapeuta eliminado",
        description: "El terapeuta ha sido eliminado exitosamente.",
      });
      setDeletingTherapist(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el terapeuta. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Terapeutas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el equipo de profesionales
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-therapist">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Terapeuta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Terapeuta</DialogTitle>
            </DialogHeader>
            <TherapistForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingTherapist} onOpenChange={(open) => !open && setEditingTherapist(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Terapeuta</DialogTitle>
            </DialogHeader>
            {editingTherapist && (
              <TherapistForm 
                therapist={editingTherapist} 
                onSuccess={() => setEditingTherapist(null)} 
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingTherapist} onOpenChange={(open) => !open && setDeletingTherapist(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar terapeuta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el terapeuta{" "}
                <strong>{deletingTherapist?.name}</strong> del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={deleteTherapistMutation.isPending}
                data-testid="button-cancel-delete"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingTherapist && deleteTherapistMutation.mutate(deletingTherapist.id)}
                disabled={deleteTherapistMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteTherapistMutation.isPending ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : !therapists || therapists.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-semibold mb-2">No hay terapeutas registrados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Agrega terapeutas al equipo para comenzar a programar citas
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-empty-add-therapist">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primer Terapeuta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {therapists.map((therapist) => (
            <Card key={therapist.id} className="hover-elevate" data-testid={`card-therapist-${therapist.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-semibold text-primary">
                      {therapist.avatarInitials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {therapist.name}
                    </h3>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{therapist.email}</span>
                </div>
                {therapist.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{therapist.phone}</span>
                  </div>
                )}
                {therapist.specialties && therapist.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {therapist.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTherapist(therapist)}
                  data-testid={`button-edit-therapist-${therapist.id}`}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingTherapist(therapist)}
                  data-testid={`button-delete-therapist-${therapist.id}`}
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
