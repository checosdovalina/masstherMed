import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertTherapyTypeSchema, type InsertTherapyType, type TherapyType } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useEffect } from "react";

interface TherapyTypeFormProps {
  therapyType?: TherapyType;
  onSuccess?: () => void;
}

export function TherapyTypeForm({ therapyType, onSuccess }: TherapyTypeFormProps) {
  const { toast } = useToast();
  const isEditing = !!therapyType;

  const form = useForm<InsertTherapyType>({
    resolver: zodResolver(insertTherapyTypeSchema),
    defaultValues: {
      name: therapyType?.name || "",
      description: therapyType?.description || "",
      color: therapyType?.color || "#256BA2",
    },
  });

  useEffect(() => {
    if (therapyType) {
      form.reset({
        name: therapyType.name,
        description: therapyType.description || "",
        color: therapyType.color,
      });
    }
  }, [therapyType, form]);

  const saveTherapyTypeMutation = useMutation({
    mutationFn: async (data: InsertTherapyType) => {
      if (isEditing) {
        return await apiRequest("PATCH", `/api/therapy-types/${therapyType.id}`, data);
      }
      return await apiRequest("POST", "/api/therapy-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapy-types"] });
      toast({
        title: isEditing ? "Servicio actualizado" : "Servicio registrado",
        description: isEditing 
          ? "Los cambios se han guardado exitosamente."
          : "El servicio ha sido registrado exitosamente.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: isEditing 
          ? "No se pudo actualizar el servicio. Intenta nuevamente."
          : "No se pudo registrar el servicio. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: InsertTherapyType) {
    saveTherapyTypeMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Servicio</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: Masaje Terapéutico" data-testid="input-service-name" />
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
                  {...field} 
                  value={field.value || ""}
                  placeholder="Describe el tipo de terapia ofrecida" 
                  rows={3}
                  data-testid="input-service-description"
                />
              </FormControl>
              <FormDescription>
                Descripción breve del servicio para los pacientes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color (para identificación visual)</FormLabel>
              <div className="flex gap-3 items-center">
                <FormControl>
                  <Input 
                    type="color" 
                    {...field} 
                    className="w-20 h-10 cursor-pointer"
                    data-testid="input-service-color"
                  />
                </FormControl>
                <Input 
                  type="text" 
                  value={field.value} 
                  onChange={(e) => {
                    let value = e.target.value.trim();
                    if (value && !value.startsWith('#')) {
                      value = '#' + value;
                    }
                    value = value.toUpperCase();
                    if (/^#[0-9A-F]{0,6}$/.test(value) || value === '') {
                      field.onChange(value);
                    }
                  }}
                  placeholder="#256BA2"
                  className="font-mono"
                  maxLength={7}
                  data-testid="input-service-color-text"
                />
              </div>
              <FormDescription>
                Selecciona un color distintivo para este servicio (formato hexadecimal)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={saveTherapyTypeMutation.isPending} data-testid="button-submit-service">
            {saveTherapyTypeMutation.isPending ? "Guardando..." : (isEditing ? "Guardar Cambios" : "Registrar Servicio")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
