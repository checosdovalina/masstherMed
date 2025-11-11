import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TherapistForm } from "@/components/therapist-form";
import type { Therapist } from "@shared/schema";

export default function Therapists() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: therapists, isLoading } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
