import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  MessageSquare, Phone, Mail, Calendar, Clock, 
  CheckCircle2, XCircle, Eye, Trash2, User, UserPlus
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentRequest } from "@shared/schema";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  scheduled: "Agendado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  contacted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  scheduled: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const TIME_LABELS: Record<string, string> = {
  morning: "Mañana (9-12)",
  afternoon: "Tarde (12-16)",
  evening: "Vespertino (16-19)",
};

const SERVICE_LABELS: Record<string, string> = {
  "masaje-terapeutico": "Masaje Terapéutico",
  "terapia-fisica": "Terapia Física",
  "rehabilitacion": "Rehabilitación",
  "consulta": "Primera Consulta",
  "otro": "Otro",
};

export default function Requests() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: requests, isLoading } = useQuery<AppointmentRequest[]>({
    queryKey: ["/api/appointment-requests"],
  });

  const createPatientMutation = useMutation({
    mutationFn: async (request: AppointmentRequest) => {
      const nameParts = request.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      const patientData = {
        firstName,
        lastName,
        phone: request.phone,
        email: request.email || "",
        dateOfBirth: new Date().toISOString().split("T")[0],
        gender: "otro",
        address: "",
        emergencyContact: "",
        emergencyPhone: "",
        medicalHistory: request.message ? `Solicitud original: ${request.message}` : "",
        allergies: "",
        medications: "",
        status: "active",
      };
      
      return await apiRequest("POST", "/api/patients", patientData);
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      
      if (selectedRequest) {
        await updateRequestMutation.mutateAsync({
          id: selectedRequest.id,
          status: "scheduled",
          notes: notes ? `${notes}\n[Paciente creado en el sistema]` : "[Paciente creado en el sistema]",
        });
      }
      
      toast({
        title: "Paciente creado",
        description: "Los datos han sido importados como nuevo paciente",
      });
      setDetailModalOpen(false);
      
      const patient = await response.json();
      setLocation(`/pacientes/${patient.id}`);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el paciente",
      });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/appointment-requests/${id}`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointment-requests"] });
      toast({
        title: "Solicitud actualizada",
        description: "El estado de la solicitud ha sido actualizado",
      });
      setDetailModalOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la solicitud",
      });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/appointment-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointment-requests"] });
      toast({
        title: "Solicitud eliminada",
        description: "La solicitud ha sido eliminada",
      });
      setDetailModalOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la solicitud",
      });
    },
  });

  const handleViewDetails = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setNotes(request.notes || "");
    setNewStatus(request.status);
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedRequest) {
      updateRequestMutation.mutate({
        id: selectedRequest.id,
        status: newStatus,
        notes: notes,
      });
    }
  };

  const pendingCount = requests?.filter(r => r.status === "pending").length || 0;
  const contactedCount = requests?.filter(r => r.status === "contacted").length || 0;
  const scheduledCount = requests?.filter(r => r.status === "scheduled").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-requests-title">Solicitudes de Cita</h1>
          <p className="text-muted-foreground">Solicitudes recibidas desde la página web</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-pending-count">{pendingCount}</p>
                <p className="text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-contacted-count">{contactedCount}</p>
                <p className="text-muted-foreground">Contactados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-scheduled-count">{scheduledCount}</p>
                <p className="text-muted-foreground">Agendados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Todas las Solicitudes
          </CardTitle>
          <CardDescription>
            Listado de solicitudes de cita recibidas desde la página pública
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando solicitudes...</div>
          ) : requests && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div 
                  key={request.id} 
                  className="p-4 border rounded-lg hover-elevate cursor-pointer"
                  onClick={() => handleViewDetails(request)}
                  data-testid={`card-request-${request.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold" data-testid={`text-request-name-${request.id}`}>
                          {request.name}
                        </span>
                        <Badge className={STATUS_COLORS[request.status]}>
                          {STATUS_LABELS[request.status]}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {request.phone}
                        </div>
                        {request.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {request.email}
                          </div>
                        )}
                        {request.preferredDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {request.preferredDate}
                            {request.preferredTime && ` - ${TIME_LABELS[request.preferredTime] || request.preferredTime}`}
                          </div>
                        )}
                      </div>

                      {request.serviceType && (
                        <div className="mt-2">
                          <Badge variant="outline">
                            {SERVICE_LABELS[request.serviceType] || request.serviceType}
                          </Badge>
                        </div>
                      )}

                      {request.message && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          "{request.message}"
                        </p>
                      )}
                    </div>

                    <div className="text-right text-xs text-muted-foreground">
                      {format(new Date(request.createdAt), "d MMM yyyy", { locale: es })}
                      <br />
                      {format(new Date(request.createdAt), "HH:mm", { locale: es })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay solicitudes</h3>
              <p className="text-muted-foreground">
                Las solicitudes de cita aparecerán aquí cuando los visitantes llenen el formulario en la página pública.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de Solicitud</DialogTitle>
            <DialogDescription>
              Gestione la solicitud de cita y actualice su estado
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nombre</Label>
                  <p className="font-semibold">{selectedRequest.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Teléfono</Label>
                  <p className="font-semibold">
                    <a href={`tel:${selectedRequest.phone}`} className="text-primary hover:underline">
                      {selectedRequest.phone}
                    </a>
                  </p>
                </div>
                {selectedRequest.email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-semibold">
                      <a href={`mailto:${selectedRequest.email}`} className="text-primary hover:underline">
                        {selectedRequest.email}
                      </a>
                    </p>
                  </div>
                )}
                {selectedRequest.preferredDate && (
                  <div>
                    <Label className="text-muted-foreground">Fecha preferida</Label>
                    <p className="font-semibold">{selectedRequest.preferredDate}</p>
                  </div>
                )}
                {selectedRequest.preferredTime && (
                  <div>
                    <Label className="text-muted-foreground">Horario preferido</Label>
                    <p className="font-semibold">{TIME_LABELS[selectedRequest.preferredTime]}</p>
                  </div>
                )}
                {selectedRequest.serviceType && (
                  <div>
                    <Label className="text-muted-foreground">Servicio</Label>
                    <p className="font-semibold">{SERVICE_LABELS[selectedRequest.serviceType]}</p>
                  </div>
                )}
              </div>

              {selectedRequest.message && (
                <div>
                  <Label className="text-muted-foreground">Mensaje del paciente</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md text-sm">{selectedRequest.message}</p>
                </div>
              )}

              <div>
                <Label>Estado</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger data-testid="select-request-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="contacted">Contactado</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notas internas</Label>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade notas sobre el seguimiento..."
                  rows={3}
                  data-testid="input-request-notes"
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full"
                  variant="secondary"
                  onClick={() => createPatientMutation.mutate(selectedRequest)}
                  disabled={createPatientMutation.isPending}
                  data-testid="button-create-patient"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {createPatientMutation.isPending ? "Creando..." : "Importar como Nuevo Paciente"}
                </Button>

                <div className="flex justify-between">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteRequestMutation.mutate(selectedRequest.id)}
                    disabled={deleteRequestMutation.isPending}
                    data-testid="button-delete-request"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleUpdateStatus}
                      disabled={updateRequestMutation.isPending}
                      data-testid="button-update-request"
                    >
                      {updateRequestMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
