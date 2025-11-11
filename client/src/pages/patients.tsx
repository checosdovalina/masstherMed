import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientForm } from "@/components/patient-form";
import type { Patient } from "@shared/schema";
import { Link } from "wouter";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const filteredPatients = patients?.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchLower) || 
           patient.email?.toLowerCase().includes(searchLower) ||
           patient.phone.includes(searchQuery);
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona la información de tus pacientes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-patient">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
            </DialogHeader>
            <PatientForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-patients"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            {searchQuery ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No se encontraron pacientes</h3>
                <p className="text-sm text-muted-foreground">
                  No hay pacientes que coincidan con "{searchQuery}"
                </p>
              </>
            ) : (
              <>
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay pacientes registrados</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comienza registrando tu primer paciente para gestionar sus terapias
                </p>
                <Button onClick={() => setDialogOpen(true)} data-testid="button-empty-add-patient">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Paciente
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Link key={patient.id} href={`/pacientes/${patient.id}`}>
              <Card className="hover-elevate cursor-pointer" data-testid={`card-patient-${patient.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {patient.avatarInitials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {patient.email || patient.phone}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge 
                      variant={patient.status === "active" ? "default" : "secondary"}
                      data-testid={`badge-status-${patient.id}`}
                    >
                      {patient.status === "active" ? "Activo" : 
                       patient.status === "inactive" ? "Inactivo" : "Alta"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Teléfono:</span>
                    <span className="font-medium">{patient.phone}</span>
                  </div>
                  {patient.emergencyContact && (
                    <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                      <div>Contacto emergencia: {patient.emergencyContact}</div>
                      <div>{patient.emergencyPhone}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
