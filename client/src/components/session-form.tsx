import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertSessionSchema, type InsertSession, type Patient, type Therapist, type TherapyType, type ProtocolAssignment } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useMemo, useEffect } from "react";

interface SessionFormProps {
  onSuccess?: () => void;
}

type ProtocolAssignmentWithProtocol = ProtocolAssignment & {
  protocol: {
    name: string;
    totalSessions: number;
    therapyTypeId: string;
  } | null;
};

const formSchema = insertSessionSchema.extend({
  sessionDate: z.string().min(1, "La fecha es requerida"),
  sessionTime: z.string().min(1, "La hora es requerida"),
});

type FormData = z.infer<typeof formSchema>;

export function SessionForm({ onSuccess }: SessionFormProps) {
  const { toast } = useToast();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: therapists } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const { data: therapyTypes } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      therapistId: "",
      therapyTypeId: "",
      protocolAssignmentId: "",
      sessionDate: "",
      sessionTime: "",
      duration: "",
      notes: "",
      observations: "",
      progress: "",
    },
  });

  const selectedPatientId = form.watch("patientId");
  const selectedTherapyTypeId = form.watch("therapyTypeId");

  const { data: protocolAssignments } = useQuery<ProtocolAssignmentWithProtocol[]>({
    queryKey: ["/api/protocol-assignments/patient", selectedPatientId],
    enabled: !!selectedPatientId,
  });

  const activeProtocolAssignmentsForPatient = useMemo(() => {
    if (!protocolAssignments) return [];
    
    let filtered = protocolAssignments.filter(
      (a) => a.status === "active" && a.protocol !== null
    );
    
    if (selectedTherapyTypeId) {
      filtered = filtered.filter(a => a.protocol?.therapyTypeId === selectedTherapyTypeId);
    }
    
    filtered = filtered.filter(a => a.completedSessions < (a.protocol?.totalSessions || 0));
    
    return filtered;
  }, [selectedTherapyTypeId, protocolAssignments]);

  useEffect(() => {
    form.resetField("protocolAssignmentId");
  }, [selectedPatientId, selectedTherapyTypeId, form]);

  const createSessionMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { sessionDate, sessionTime, protocolAssignmentId, ...rest } = data;
      
      const dateTime = new Date(`${sessionDate}T${sessionTime}`);
      
      const sessionData: InsertSession = {
        ...rest,
        protocolAssignmentId: protocolAssignmentId || undefined,
        sessionDate: dateTime,
      };
      
      return await apiRequest("POST", "/api/sessions", sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/protocol-assignments"] });
      if (selectedPatientId) {
        queryClient.invalidateQueries({ queryKey: ["/api/protocol-assignments/patient", selectedPatientId] });
      }
      toast({
        title: "Sesión registrada",
        description: "La sesión ha sido registrada exitosamente.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      let errorMessage = "No se pudo registrar la sesión. Intenta nuevamente.";
      
      try {
        if (error?.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error?.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      
      toast({
        title: "Error al registrar sesión",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormData) {
    createSessionMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-session-patient">
                    <SelectValue placeholder="Selecciona un paciente" />
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

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="therapistId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terapeuta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-session-therapist">
                      <SelectValue placeholder="Selecciona un terapeuta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {therapists?.map((therapist) => (
                      <SelectItem key={therapist.id} value={therapist.id}>
                        {therapist.name}
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
            name="therapyTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Terapia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-session-therapy-type">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {therapyTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="sessionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de la Sesión</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-session-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sessionTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <FormControl>
                  <Input type="time" {...field} data-testid="input-session-time" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue placeholder="Selecciona la duración" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="30 min">30 minutos</SelectItem>
                    <SelectItem value="45 min">45 minutos</SelectItem>
                    <SelectItem value="60 min">60 minutos</SelectItem>
                    <SelectItem value="90 min">90 minutos</SelectItem>
                    <SelectItem value="120 min">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="protocolAssignmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protocolo (Opcional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                  disabled={!selectedPatientId || !selectedTherapyTypeId}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-protocol">
                      <SelectValue placeholder={
                        !selectedPatientId 
                          ? "Primero selecciona un paciente"
                          : !selectedTherapyTypeId
                          ? "Selecciona tipo de terapia primero"
                          : activeProtocolAssignmentsForPatient.length === 0
                          ? "Sin protocolos disponibles"
                          : "Selecciona un protocolo"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeProtocolAssignmentsForPatient.length > 0 ? (
                      activeProtocolAssignmentsForPatient.map((assignment) => (
                        <SelectItem key={assignment.id} value={assignment.id}>
                          {assignment.protocol?.name} ({assignment.completedSessions}/{assignment.protocol?.totalSessions})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No hay protocolos disponibles
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Solo se muestran protocolos activos con el mismo tipo de terapia. Dejar sin selección para sesión sin protocolo.
                </FormDescription>
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
              <FormLabel>Notas de la Sesión</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""} 
                  rows={4}
                  placeholder="Describe lo trabajado durante la sesión..."
                  data-testid="input-session-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""} 
                  rows={3}
                  placeholder="Observaciones sobre el comportamiento o estado del paciente..."
                  data-testid="input-observations"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progreso</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""} 
                  rows={3}
                  placeholder="Avances o mejorías observadas..."
                  data-testid="input-progress"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={createSessionMutation.isPending} data-testid="button-submit-session">
            {createSessionMutation.isPending ? "Guardando..." : "Registrar Sesión"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
