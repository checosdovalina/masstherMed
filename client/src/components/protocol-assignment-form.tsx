import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertProtocolAssignmentSchema, type Protocol, type ProtocolAssignment } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface ProtocolAssignmentFormProps {
  patientId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  protocolId: z.string().min(1, "El protocolo es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ProtocolAssignmentForm({ patientId, onSuccess }: ProtocolAssignmentFormProps) {
  const { toast } = useToast();

  const { data: protocols } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      protocolId: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/protocol-assignments", {
        ...data,
        patientId,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        completedSessions: 0,
        status: "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocol-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/protocol-assignments/patient", patientId] });
      toast({
        title: "Protocolo asignado",
        description: "El protocolo ha sido asignado al paciente exitosamente.",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al asignar el protocolo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createAssignmentMutation.mutate(data);
  };

  const selectedProtocol = protocols?.find(p => p.id === form.watch("protocolId"));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="protocolId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Protocolo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-assignment-protocol">
                    <SelectValue placeholder="Selecciona un protocolo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {protocols?.map((protocol) => (
                    <SelectItem 
                      key={protocol.id} 
                      value={protocol.id}
                    >
                      {protocol.name} ({protocol.totalSessions} sesiones)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProtocol?.description && (
                <FormDescription>
                  {selectedProtocol.description}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

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
                    data-testid="input-assignment-start-date"
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
                <FormLabel>Fecha de Fin (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field} 
                    data-testid="input-assignment-end-date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedProtocol && (
          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="font-medium mb-1">Detalles del Protocolo:</p>
            <p className="text-muted-foreground">
              Sesiones: {selectedProtocol.totalSessions}
            </p>
            {selectedProtocol.objectives && (
              <p className="text-muted-foreground mt-1">
                Objetivos: {selectedProtocol.objectives}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="submit" 
            disabled={createAssignmentMutation.isPending || !form.watch("protocolId")} 
            data-testid="button-submit-assignment"
          >
            {createAssignmentMutation.isPending ? "Asignando..." : "Asignar Protocolo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
