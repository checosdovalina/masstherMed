import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ClinicalHistory, type Patient } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClinicalHistoryForm } from "@/components/clinical-history-form";
import { Plus, FileText, Edit, User, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ClinicalHistoryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [editingHistory, setEditingHistory] = useState<ClinicalHistory | null>(null);

  const { data: histories, isLoading: historiesLoading } = useQuery<ClinicalHistory[]>({
    queryKey: ["/api/clinical-histories"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: patientHistory, isLoading: patientHistoryLoading } = useQuery<ClinicalHistory | null>({
    queryKey: ["/api/clinical-histories/patient", selectedPatientId],
    enabled: !!selectedPatientId,
  });

  const getPatientName = (patientId: string) => {
    const patient = patients?.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Paciente desconocido";
  };

  const getPainLevel = (level: number | null) => {
    if (level === null || level === undefined) return { text: "No registrado", color: "secondary" as const };
    if (level === 0) return { text: "Sin dolor", color: "secondary" as const };
    if (level <= 3) return { text: "Leve", color: "default" as const };
    if (level <= 6) return { text: "Moderado", color: "secondary" as const };
    if (level <= 8) return { text: "Severo", color: "destructive" as const };
    return { text: "Insoportable", color: "destructive" as const };
  };

  const handleCreateNew = () => {
    setEditingHistory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (history: ClinicalHistory) => {
    setEditingHistory(history);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingHistory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Historial Clínico</h1>
          <p className="text-muted-foreground">Gestiona los historiales clínicos de los pacientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew} data-testid="button-new-history">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Historial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingHistory ? "Editar Historial Clínico" : "Nuevo Historial Clínico"}
              </DialogTitle>
            </DialogHeader>
            <ClinicalHistoryForm 
              existingHistory={editingHistory || undefined}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Buscar por Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger data-testid="select-search-patient">
                  <SelectValue placeholder="Selecciona un paciente para ver su historial" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPatientId && (
              <Button variant="outline" onClick={() => setSelectedPatientId("")} data-testid="button-clear-search">
                Limpiar
              </Button>
            )}
          </div>

          {selectedPatientId && (
            <div className="mt-6">
              {patientHistoryLoading ? (
                <p className="text-muted-foreground">Cargando...</p>
              ) : patientHistory ? (
                <Card className="border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{getPatientName(patientHistory.patientId)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Registrado: {format(new Date(patientHistory.createdAt), "PPP", { locale: es })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(patientHistory)} data-testid="button-edit-patient-history">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Peso:</span>
                        <p className="font-medium">{patientHistory.peso || "No registrado"} {patientHistory.peso ? "kg" : ""}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Estatura:</span>
                        <p className="font-medium">{patientHistory.estatura || "No registrado"} {patientHistory.estatura ? "cm" : ""}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Nivel de Dolor:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{patientHistory.nivelDolor ?? "N/A"}/10</span>
                          <Badge variant={getPainLevel(patientHistory.nivelDolor).color}>
                            {getPainLevel(patientHistory.nivelDolor).text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {patientHistory.padecimientoActual && (
                      <div className="mt-4">
                        <span className="text-sm text-muted-foreground">Padecimiento Actual:</span>
                        <p className="mt-1">{patientHistory.padecimientoActual}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Sin historial clínico</h3>
                  <p className="mt-2 text-muted-foreground">
                    Este paciente aún no tiene un historial clínico registrado.
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      setEditingHistory(null);
                      setIsDialogOpen(true);
                    }}
                    data-testid="button-create-for-patient"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Historial
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Todos los Historiales ({histories?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historiesLoading ? (
            <p className="text-muted-foreground">Cargando historiales...</p>
          ) : histories && histories.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {histories.map((history) => (
                <Card key={history.id} className="hover-elevate" data-testid={`card-history-${history.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{getPatientName(history.patientId)}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(history)} data-testid={`button-edit-${history.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(history.fecha), "PPP", { locale: es })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Dolor:</span>
                      <Badge variant={getPainLevel(history.nivelDolor).color}>
                        {history.nivelDolor ?? "N/A"}/10 - {getPainLevel(history.nivelDolor).text}
                      </Badge>
                    </div>
                    {history.padecimientoActual && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {history.padecimientoActual}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Sin historiales</h3>
              <p className="mt-2 text-muted-foreground">
                Aún no hay historiales clínicos registrados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
