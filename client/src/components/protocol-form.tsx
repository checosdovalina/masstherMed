import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertProtocolSchema, type InsertProtocol, type Protocol, type Patient, type TherapyType } from "@shared/schema";
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

interface ProtocolFormProps {
  protocol?: Protocol;
  patientId?: string;
  onSuccess?: () => void;
}

const formSchema = insertProtocolSchema.extend({
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ProtocolForm({ protocol, patientId, onSuccess }: ProtocolFormProps) {
  const { toast } = useToast();
  const isEditing = !!protocol;

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: therapyTypes } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: patientId || protocol?.patientId || "",
      therapyTypeId: protocol?.therapyTypeId || "",
      name: protocol?.name || "",
      description: protocol?.description || "",
      objectives: protocol?.objectives || "",
      totalSessions: protocol?.totalSessions || "",
      completedSessions: protocol?.completedSessions || "0",
      status: protocol?.status || "active",
      startDate: protocol?.startDate 
        ? new Date(protocol.startDate).toISOString().split('T')[0] 
        : "",
      endDate: protocol?.endDate 
        ? new Date(protocol.endDate).toISOString().split('T')[0] 
        : "",
    },
  });

  const saveProtocolMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { startDate, endDate, ...rest } = data;
      
      const protocolData: InsertProtocol = {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
      };
      
      if (isEditing) {
        return await apiRequest("PATCH", `/api/protocols/${protocol.id}`, protocolData);
      } else {
        return await apiRequest("POST", "/api/protocols", protocolData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      toast({
        title: isEditing ? "Protocolo actualizado" : "Protocolo creado",
        description: isEditing 
          ? "El protocolo ha sido actualizado exitosamente."
          : "El protocolo ha sido creado exitosamente.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el protocolo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    saveProtocolMutation.mutate(data);
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
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!!patientId || isEditing}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-protocol-patient">
                    <SelectValue placeholder="Selecciona un paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem 
                      key={patient.id} 
                      value={patient.id}
                    >
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
          name="therapyTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Terapia</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-protocol-therapy-type">
                    <SelectValue placeholder="Selecciona un tipo de terapia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {therapyTypes?.map((therapyType) => (
                    <SelectItem 
                      key={therapyType.id} 
                      value={therapyType.id}
                    >
                      {therapyType.name}
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
              <FormLabel>Nombre del Protocolo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="ej: Rehabilitación de Columna"
                  {...field} 
                  data-testid="input-protocol-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción del protocolo de tratamiento"
                  rows={3}
                  {...field} 
                  data-testid="input-protocol-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivos</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Objetivos terapéuticos del protocolo"
                  rows={3}
                  {...field} 
                  data-testid="input-protocol-objectives"
                />
              </FormControl>
              <FormDescription>
                Define los objetivos específicos que se buscan alcanzar con este protocolo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalSessions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total de Sesiones</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="10"
                    {...field} 
                    data-testid="input-protocol-total-sessions"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="completedSessions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sesiones Completadas</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field} 
                    data-testid="input-protocol-completed-sessions"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field} 
                    data-testid="input-protocol-start-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Finalización (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field} 
                    data-testid="input-protocol-end-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-protocol-status">
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={saveProtocolMutation.isPending} data-testid="button-submit-protocol">
            {saveProtocolMutation.isPending ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Crear Protocolo")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
