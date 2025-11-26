import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Package, AlertTriangle, Bell, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TherapyPackage, Patient, PackageAlert } from "@shared/schema";

const packageFormSchema = z.object({
  patientId: z.string().min(1, "Seleccione un paciente"),
  name: z.string().min(1, "El nombre es requerido"),
  totalSessions: z.number().min(1, "Debe tener al menos 1 sesión"),
  purchaseDate: z.string().min(1, "La fecha de compra es requerida"),
  expirationDate: z.string().optional(),
  notes: z.string().optional(),
});

type PackageFormData = z.infer<typeof packageFormSchema>;

function PackageStatusBadge({ status, remaining }: { status: string; remaining: number }) {
  const getVariant = () => {
    switch (status) {
      case "active":
        return "default";
      case "warning":
        return "secondary";
      case "critical":
        return "destructive";
      case "finished":
      case "expired":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "active":
        return `${remaining} sesiones`;
      case "warning":
        return `${remaining} sesiones`;
      case "critical":
        return `${remaining} restantes`;
      case "finished":
        return "Finalizado";
      case "expired":
        return "Expirado";
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant()} data-testid="badge-package-status">
      {getLabel()}
    </Badge>
  );
}

function PackageForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      patientId: "",
      name: "",
      totalSessions: 10,
      purchaseDate: new Date().toISOString().split("T")[0],
      expirationDate: "",
      notes: "",
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      return await apiRequest("POST", "/api/packages", {
        ...data,
        purchaseDate: data.purchaseDate,
        expirationDate: data.expirationDate || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Paquete creado",
        description: "El paquete se ha creado exitosamente",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear el paquete",
      });
    },
  });

  const onSubmit = (data: PackageFormData) => {
    createPackageMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-patient">
                    <SelectValue placeholder="Seleccione un paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Paquete</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Paquete 10 Sesiones" {...field} data-testid="input-package-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalSessions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total de Sesiones</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  data-testid="input-total-sessions"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Compra</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-purchase-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Expiración (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-expiration-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Notas adicionales..." {...field} data-testid="input-package-notes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={createPackageMutation.isPending} data-testid="button-submit-package">
            {createPackageMutation.isPending ? "Creando..." : "Crear Paquete"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function AlertsList() {
  const { data: alerts, isLoading } = useQuery<PackageAlert[]>({
    queryKey: ["/api/package-alerts"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PATCH", `/api/package-alerts/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/package-alerts"] });
    },
  });

  const getPatientName = (patientId: string) => {
    const patient = patients?.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Paciente";
  };

  const getAlertBadge = (alertType: string) => {
    switch (alertType) {
      case "priority_red":
        return <Badge variant="destructive">Urgente</Badge>;
      case "red":
        return <Badge variant="destructive">Alerta</Badge>;
      case "yellow":
        return <Badge variant="secondary">Aviso</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const unreadAlerts = alerts?.filter((a) => a.isRead === "false") || [];
  const readAlerts = alerts?.filter((a) => a.isRead === "true") || [];

  if (unreadAlerts.length === 0 && readAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin alertas</h3>
          <p className="text-sm text-muted-foreground">
            No hay alertas de paquetes en este momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {unreadAlerts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">No leídas</h3>
          <div className="space-y-3">
            {unreadAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-destructive" data-testid={`alert-${alert.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getAlertBadge(alert.alertType)}
                          <span className="text-sm font-medium">{getPatientName(alert.patientId)}</span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(alert.createdAt), "PPp", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(alert.id)}
                      disabled={markAsReadMutation.isPending}
                      data-testid={`button-mark-read-${alert.id}`}
                    >
                      Marcar leída
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {readAlerts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Historial</h3>
          <div className="space-y-3">
            {readAlerts.slice(0, 5).map((alert) => (
              <Card key={alert.id} className="opacity-70" data-testid={`alert-read-${alert.id}`}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getAlertBadge(alert.alertType)}
                        <span className="text-sm">{getPatientName(alert.patientId)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(alert.createdAt), "PP", { locale: es })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Packages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: packages, isLoading: packagesLoading } = useQuery<TherapyPackage[]>({
    queryKey: ["/api/packages"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: unreadAlerts } = useQuery<PackageAlert[]>({
    queryKey: ["/api/package-alerts/unread"],
  });

  const useSessionMutation = useMutation({
    mutationFn: async (packageId: string) => {
      return await apiRequest("POST", `/api/packages/${packageId}/use-session`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/package-alerts"] });
      toast({
        title: "Sesión registrada",
        description: "Se ha descontado una sesión del paquete",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo registrar la sesión",
      });
    },
  });

  const getPatientName = (patientId: string) => {
    const patient = patients?.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Paciente";
  };

  const filteredPackages = packages?.filter((pkg) => {
    const patientName = getPatientName(pkg.patientId).toLowerCase();
    const matchesSearch =
      patientName.includes(searchQuery.toLowerCase()) ||
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const activePackages = packages?.filter((p) => ["active", "warning", "critical"].includes(p.status)) || [];
  const finishedPackages = packages?.filter((p) => ["finished", "expired"].includes(p.status)) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Paquetes de Sesiones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los paquetes de terapia de tus pacientes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-package">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paquete
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Paquete</DialogTitle>
            </DialogHeader>
            <PackageForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paquetes Activos</CardDescription>
            <CardTitle className="text-2xl">{activePackages.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Finalizados</CardDescription>
            <CardTitle className="text-2xl">{finishedPackages.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Alertas Pendientes</CardDescription>
            <CardTitle className="text-2xl text-destructive">{unreadAlerts?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Paquetes</CardDescription>
            <CardTitle className="text-2xl">{packages?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="packages">
        <TabsList>
          <TabsTrigger value="packages" data-testid="tab-packages">
            <Package className="h-4 w-4 mr-2" />
            Paquetes
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <Bell className="h-4 w-4 mr-2" />
            Alertas
            {unreadAlerts && unreadAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-packages"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="warning">Pocas sesiones</SelectItem>
                <SelectItem value="critical">Urgente</SelectItem>
                <SelectItem value="finished">Finalizados</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {packagesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredPackages.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                {searchQuery || statusFilter !== "all" ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2">No se encontraron paquetes</h3>
                    <p className="text-sm text-muted-foreground">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </>
                ) : (
                  <>
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sin paquetes registrados</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Crea el primer paquete de sesiones para un paciente
                    </p>
                    <Button onClick={() => setDialogOpen(true)} data-testid="button-empty-add-package">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Paquete
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((pkg) => {
                const remaining = pkg.totalSessions - pkg.sessionsUsed;
                const progress = (pkg.sessionsUsed / pkg.totalSessions) * 100;
                const isFinished = ["finished", "expired"].includes(pkg.status);

                return (
                  <Card key={pkg.id} data-testid={`card-package-${pkg.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getPatientName(pkg.patientId)}</span>
                          </div>
                          <CardTitle className="text-base">{pkg.name}</CardTitle>
                        </div>
                        <PackageStatusBadge status={pkg.status} remaining={remaining} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-medium">
                            {pkg.sessionsUsed} / {pkg.totalSessions} sesiones
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Compra: {format(new Date(pkg.purchaseDate), "PP", { locale: es })}
                        </span>
                      </div>

                      {pkg.expirationDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Expira: {format(new Date(pkg.expirationDate), "PP", { locale: es })}
                          </span>
                        </div>
                      )}

                      {!isFinished && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => useSessionMutation.mutate(pkg.id)}
                          disabled={useSessionMutation.isPending || remaining <= 0}
                          data-testid={`button-use-session-${pkg.id}`}
                        >
                          Registrar Sesión Usada
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <AlertsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
