import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Activity, UserCog } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Patient, Appointment, Therapist } from "@shared/schema";

export default function Dashboard() {
  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: therapists, isLoading: therapistsLoading } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const stats = [
    {
      title: "Pacientes Activos",
      value: patients?.filter(p => p.status === "active").length || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Citas Hoy",
      value: appointments?.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.startTime).toDateString() === today;
      }).length || 0,
      icon: Calendar,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Sesiones del Mes",
      value: appointments?.filter(a => {
        const now = new Date();
        const apptDate = new Date(a.startTime);
        return apptDate.getMonth() === now.getMonth() && 
               apptDate.getFullYear() === now.getFullYear();
      }).length || 0,
      icon: Activity,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Terapeutas",
      value: therapists?.length || 0,
      icon: UserCog,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  const upcomingAppointments = appointments
    ?.filter(a => new Date(a.startTime) > new Date() && a.status === "scheduled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel Principal</h1>
        <p className="text-muted-foreground mt-1">
          Resumen general de la clínica de terapias
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isLoading = patientsLoading || appointmentsLoading || therapistsLoading;

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Próximas Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay citas programadas próximamente
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => {
                const patient = patients?.find(p => p.id === appointment.patientId);
                const therapist = therapists?.find(t => t.id === appointment.therapistId);
                const startTime = new Date(appointment.startTime);

                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-3 rounded-md bg-muted/30 hover-elevate"
                    data-testid={`appointment-${appointment.id}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {patient?.avatarInitials || "?"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {patient?.firstName} {patient?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {therapist?.name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">
                        {startTime.toLocaleDateString('es-ES', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {startTime.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
