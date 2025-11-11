import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertTherapistSchema, type InsertTherapist } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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
import { useState } from "react";

interface TherapistFormProps {
  onSuccess?: () => void;
}

export function TherapistForm({ onSuccess }: TherapistFormProps) {
  const { toast } = useToast();
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);

  const form = useForm<InsertTherapist>({
    resolver: zodResolver(insertTherapistSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialties: [],
      avatarInitials: "",
    },
  });

  const createTherapistMutation = useMutation({
    mutationFn: async (data: InsertTherapist) => {
      return await apiRequest("POST", "/api/therapists", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapists"] });
      toast({
        title: "Terapeuta registrado",
        description: "El terapeuta ha sido registrado exitosamente.",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar el terapeuta. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const addSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      const newSpecialties = [...specialties, specialtyInput.trim()];
      setSpecialties(newSpecialties);
      form.setValue("specialties", newSpecialties);
      setSpecialtyInput("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    const newSpecialties = specialties.filter(s => s !== specialty);
    setSpecialties(newSpecialties);
    form.setValue("specialties", newSpecialties);
  };

  function onSubmit(data: InsertTherapist) {
    createTherapistMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-therapist-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} data-testid="input-therapist-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono (Opcional)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} data-testid="input-therapist-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="avatarInitials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Iniciales (para avatar)</FormLabel>
              <FormControl>
                <Input {...field} maxLength={3} placeholder="Ej: JD" data-testid="input-avatar-initials" />
              </FormControl>
              <FormDescription>
                Máximo 3 caracteres para mostrar en el avatar
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Especialidades</FormLabel>
          <div className="flex gap-2 mt-2">
            <Input
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSpecialty();
                }
              }}
              placeholder="Ej: Terapia Física"
              data-testid="input-specialty"
            />
            <Button type="button" onClick={addSpecialty} variant="secondary" data-testid="button-add-specialty">
              Agregar
            </Button>
          </div>
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="gap-1">
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={createTherapistMutation.isPending} data-testid="button-submit-therapist">
            {createTherapistMutation.isPending ? "Guardando..." : "Registrar Terapeuta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
