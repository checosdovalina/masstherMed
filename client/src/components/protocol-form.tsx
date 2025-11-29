import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertProtocolSchema, type InsertProtocol, type Protocol, type TherapyType } from "@shared/schema";
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
  onSuccess?: () => void;
}

const formSchema = z.object({
  therapyTypeId: z.string().min(1, "El tipo de terapia es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  objectives: z.string().optional(),
  totalSessions: z.coerce.number().int().min(1, "Debe tener al menos 1 sesión"),
});

type FormData = z.infer<typeof formSchema>;

export function ProtocolForm({ protocol, onSuccess }: ProtocolFormProps) {
  const { toast } = useToast();
  const isEditing = !!protocol;

  const { data: therapyTypes } = useQuery<TherapyType[]>({
    queryKey: ["/api/therapy-types"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      therapyTypeId: protocol?.therapyTypeId || "",
      name: protocol?.name || "",
      description: protocol?.description ?? "",
      objectives: protocol?.objectives ?? "",
      totalSessions: protocol?.totalSessions || 10,
    },
  });

  const saveProtocolMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) {
        return await apiRequest("PATCH", `/api/protocols/${protocol.id}`, data);
      } else {
        return await apiRequest("POST", "/api/protocols", data);
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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el protocolo.",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Protocolo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="ej: Rehabilitación de Columna Lumbar"
                  {...field} 
                  data-testid="input-protocol-name"
                />
              </FormControl>
              <FormDescription>
                Nombre descriptivo para identificar este protocolo
              </FormDescription>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción del protocolo de tratamiento..."
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
                  placeholder="Objetivos terapéuticos del protocolo..."
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

        <FormField
          control={form.control}
          name="totalSessions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total de Sesiones Recomendadas</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min="1"
                  placeholder="10"
                  {...field}
                  value={field.value ?? ""}
                  data-testid="input-protocol-total-sessions"
                />
              </FormControl>
              <FormDescription>
                Número de sesiones estándar para este protocolo
              </FormDescription>
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
