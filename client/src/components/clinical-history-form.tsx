import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertClinicalHistorySchema, type InsertClinicalHistory, type Patient, type ClinicalHistory } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useState, useEffect } from "react";

interface ClinicalHistoryFormProps {
  patientId?: string;
  existingHistory?: ClinicalHistory;
  onSuccess?: () => void;
}

const formSchema = insertClinicalHistorySchema.extend({
  fecha: z.string().min(1, "La fecha es requerida"),
});

type FormData = z.infer<typeof formSchema>;

interface CheckboxWithSpecify {
  tiene: boolean;
  especifique: string;
}

export function ClinicalHistoryForm({ patientId, existingHistory, onSuccess }: ClinicalHistoryFormProps) {
  const { toast } = useToast();
  const isEditMode = !!existingHistory;

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: !patientId,
  });

  const [tratamientoRestaurativo, setTratamientoRestaurativo] = useState<Record<string, CheckboxWithSpecify>>({
    terapiaFisica: { tiene: false, especifique: "" },
    yoga: { tiene: false, especifique: "" },
  });

  const [antecedentes, setAntecedentes] = useState<Record<string, CheckboxWithSpecify>>({
    diabetes: { tiene: false, especifique: "" },
    hta: { tiene: false, especifique: "" },
    eAutoinmune: { tiene: false, especifique: "" },
    asma: { tiene: false, especifique: "" },
    alergias: { tiene: false, especifique: "" },
    osteoporosis: { tiene: false, especifique: "" },
    familiarMismoPadecimiento: { tiene: false, especifique: "" },
    cardiopatias: { tiene: false, especifique: "" },
    accidentes: { tiene: false, especifique: "" },
    cirugias: { tiene: false, especifique: "" },
    fracturas: { tiene: false, especifique: "" },
    discapacidad: { tiene: false, especifique: "" },
    cancer: { tiene: false, especifique: "" },
    insuficienciaRenal: { tiene: false, especifique: "" },
  });

  const [sintomas, setSintomas] = useState({
    dolor: { tiene: false, tipo: "", frecuencia: "" },
    inflamacion: { tiene: false, tipo: "", frecuencia: "" },
    adormecimiento: { tiene: false, tipo: "", frecuencia: "" },
    hormigueo: { tiene: false },
  });

  const [estudios, setEstudios] = useState({
    rm: false,
    rx: false,
    us: false,
    laboratorio: false,
    densitometria: false,
  });

  const [diagnosticos, setDiagnosticos] = useState(["", "", ""]);
  const [medicos, setMedicos] = useState(["", "", ""]);
  const [actividadFisica, setActividadFisica] = useState({ tiene: false, especifique: "" });

  useEffect(() => {
    if (existingHistory) {
      if (existingHistory.tratamientoRestaurativo) {
        setTratamientoRestaurativo(existingHistory.tratamientoRestaurativo);
      }
      if (existingHistory.antecedentesPatologicos) {
        setAntecedentes(existingHistory.antecedentesPatologicos);
      }
      if (existingHistory.sintomatologia) {
        setSintomas(existingHistory.sintomatologia);
      }
      if (existingHistory.estudiosRealizados) {
        setEstudios(existingHistory.estudiosRealizados);
      }
      if (existingHistory.habitosSalud) {
        setActividadFisica(existingHistory.habitosSalud);
      }
      if (existingHistory.diagnosticosPrevios) {
        setDiagnosticos([...existingHistory.diagnosticosPrevios, "", ""].slice(0, 3));
      }
      if (existingHistory.medicosTratantes) {
        setMedicos([...existingHistory.medicosTratantes, "", ""].slice(0, 3));
      }
    }
  }, [existingHistory]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: patientId || existingHistory?.patientId || "",
      fecha: existingHistory?.fecha ? new Date(existingHistory.fecha).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      recomendacion: existingHistory?.recomendacion || "",
      peso: existingHistory?.peso || "",
      estatura: existingHistory?.estatura || "",
      padecimientoActual: existingHistory?.padecimientoActual || "",
      tratamientoPrevio: existingHistory?.tratamientoPrevio || "",
      nivelDolor: existingHistory?.nivelDolor ?? 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        fecha: new Date(data.fecha).toISOString(),
        tratamientoRestaurativo,
        antecedentesPatologicos: antecedentes,
        habitosSalud: actividadFisica,
        sintomatologia: sintomas,
        diagnosticosPrevios: diagnosticos.filter(d => d.trim() !== ""),
        medicosTratantes: medicos.filter(m => m.trim() !== ""),
        estudiosRealizados: estudios,
      };
      
      if (isEditMode && existingHistory) {
        return await apiRequest("PATCH", `/api/clinical-histories/${existingHistory.id}`, payload);
      }
      return await apiRequest("POST", "/api/clinical-histories", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clinical-histories"] });
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ["/api/clinical-histories/patient", patientId] });
      }
      toast({
        title: isEditMode ? "Historial actualizado" : "Historial creado",
        description: isEditMode ? "El historial clínico ha sido actualizado exitosamente." : "El historial clínico ha sido registrado exitosamente.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "No se pudo guardar el historial clínico.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormData) {
    createMutation.mutate(data);
  }

  const updateAntecedente = (key: string, field: "tiene" | "especifique", value: boolean | string) => {
    setAntecedentes(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const updateTratamiento = (key: string, field: "tiene" | "especifique", value: boolean | string) => {
    setTratamientoRestaurativo(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const antecedentesLabels: Record<string, string> = {
    diabetes: "Diabetes",
    hta: "Hipertensión Arterial",
    eAutoinmune: "Enfermedad Autoinmune",
    asma: "Asma",
    alergias: "Alergias",
    osteoporosis: "Osteoporosis",
    familiarMismoPadecimiento: "Familiar con mismo padecimiento",
    cardiopatias: "Cardiopatías",
    accidentes: "Accidentes",
    cirugias: "Cirugías",
    fracturas: "Fracturas",
    discapacidad: "Discapacidad",
    cancer: "Cáncer",
    insuficienciaRenal: "Insuficiencia Renal",
  };

  const getPainLabel = (value: number) => {
    if (value === 0) return "Sin Dolor";
    if (value <= 3) return "Leve";
    if (value <= 6) return "Moderado";
    if (value <= 8) return "Severo";
    return "Insoportable";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos Generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {!patientId && (
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode}>
                        <FormControl>
                          <SelectTrigger data-testid="select-patient">
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
              )}
              
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recomendacion"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Recomendación</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="¿Quién lo refirió?" data-testid="input-recomendacion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exploración Física</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Ej: 70" data-testid="input-peso" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estatura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estatura (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Ej: 170" data-testid="input-estatura" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Padecimiento y Tratamientos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="padecimientoActual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Padecimiento Actual</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={3} placeholder="Describe el padecimiento actual del paciente..." data-testid="input-padecimiento" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tratamientoPrevio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratamiento Previo</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={3} placeholder="Tratamientos previos que ha recibido..." data-testid="input-tratamiento-previo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tratamiento Restaurativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {["terapiaFisica", "yoga"].map((key) => (
              <div key={key} className="flex items-start gap-4">
                <div className="flex items-center gap-2 min-w-[150px]">
                  <Checkbox
                    checked={tratamientoRestaurativo[key]?.tiene || false}
                    onCheckedChange={(checked) => updateTratamiento(key, "tiene", !!checked)}
                    data-testid={`checkbox-${key}`}
                  />
                  <span className="text-sm font-medium">
                    {key === "terapiaFisica" ? "Terapia Física" : "Yoga"}
                  </span>
                </div>
                <Input
                  placeholder="Especifique..."
                  value={tratamientoRestaurativo[key]?.especifique || ""}
                  onChange={(e) => updateTratamiento(key, "especifique", e.target.value)}
                  disabled={!tratamientoRestaurativo[key]?.tiene}
                  className="flex-1"
                  data-testid={`input-${key}-especifique`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Antecedentes Patológicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(antecedentesLabels).map(([key, label]) => (
                <div key={key} className="flex items-start gap-2">
                  <div className="flex items-center gap-2 min-w-[180px]">
                    <Checkbox
                      checked={antecedentes[key]?.tiene || false}
                      onCheckedChange={(checked) => updateAntecedente(key, "tiene", !!checked)}
                      data-testid={`checkbox-${key}`}
                    />
                    <span className="text-sm">{label}</span>
                  </div>
                  <Input
                    placeholder="Especifique..."
                    value={antecedentes[key]?.especifique || ""}
                    onChange={(e) => updateAntecedente(key, "especifique", e.target.value)}
                    disabled={!antecedentes[key]?.tiene}
                    className="flex-1 h-8 text-sm"
                    data-testid={`input-${key}-especifique`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hábitos de Salud</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-[150px]">
                <Checkbox
                  checked={actividadFisica.tiene}
                  onCheckedChange={(checked) => setActividadFisica(prev => ({ ...prev, tiene: !!checked }))}
                  data-testid="checkbox-actividad-fisica"
                />
                <span className="text-sm font-medium">Actividad Física</span>
              </div>
              <Input
                placeholder="Especifique tipo y frecuencia..."
                value={actividadFisica.especifique}
                onChange={(e) => setActividadFisica(prev => ({ ...prev, especifique: e.target.value }))}
                disabled={!actividadFisica.tiene}
                className="flex-1"
                data-testid="input-actividad-fisica-especifique"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sintomatología</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Checkbox
                    checked={sintomas.dolor.tiene}
                    onCheckedChange={(checked) => setSintomas(prev => ({ ...prev, dolor: { ...prev.dolor, tiene: !!checked } }))}
                    data-testid="checkbox-dolor"
                  />
                  <span className="text-sm font-medium">Dolor</span>
                </div>
                <Select
                  value={sintomas.dolor.tipo}
                  onValueChange={(val) => setSintomas(prev => ({ ...prev, dolor: { ...prev.dolor, tipo: val } }))}
                  disabled={!sintomas.dolor.tiene}
                >
                  <SelectTrigger className="w-[140px]" data-testid="select-dolor-tipo">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ardor">Ardor</SelectItem>
                    <SelectItem value="punzante">Punzante</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sintomas.dolor.frecuencia}
                  onValueChange={(val) => setSintomas(prev => ({ ...prev, dolor: { ...prev.dolor, frecuencia: val } }))}
                  disabled={!sintomas.dolor.tiene}
                >
                  <SelectTrigger className="w-[140px]" data-testid="select-dolor-frecuencia">
                    <SelectValue placeholder="Frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diurno">Diurno</SelectItem>
                    <SelectItem value="nocturno">Nocturno</SelectItem>
                    <SelectItem value="constante">Constante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Checkbox
                    checked={sintomas.inflamacion.tiene}
                    onCheckedChange={(checked) => setSintomas(prev => ({ ...prev, inflamacion: { ...prev.inflamacion, tiene: !!checked } }))}
                    data-testid="checkbox-inflamacion"
                  />
                  <span className="text-sm font-medium">Inflamación</span>
                </div>
                <Select
                  value={sintomas.inflamacion.tipo}
                  onValueChange={(val) => setSintomas(prev => ({ ...prev, inflamacion: { ...prev.inflamacion, tipo: val } }))}
                  disabled={!sintomas.inflamacion.tiene}
                >
                  <SelectTrigger className="w-[140px]" data-testid="select-inflamacion-tipo">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="moderada">Moderada</SelectItem>
                    <SelectItem value="severa">Severa</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sintomas.inflamacion.frecuencia}
                  onValueChange={(val) => setSintomas(prev => ({ ...prev, inflamacion: { ...prev.inflamacion, frecuencia: val } }))}
                  disabled={!sintomas.inflamacion.tiene}
                >
                  <SelectTrigger className="w-[140px]" data-testid="select-inflamacion-frecuencia">
                    <SelectValue placeholder="Frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ocasional">Ocasional</SelectItem>
                    <SelectItem value="frecuente">Frecuente</SelectItem>
                    <SelectItem value="constante">Constante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Checkbox
                    checked={sintomas.adormecimiento.tiene}
                    onCheckedChange={(checked) => setSintomas(prev => ({ ...prev, adormecimiento: { ...prev.adormecimiento, tiene: !!checked } }))}
                    data-testid="checkbox-adormecimiento"
                  />
                  <span className="text-sm font-medium">Adormecimiento</span>
                </div>
                <Select
                  value={sintomas.adormecimiento.tipo}
                  onValueChange={(val) => setSintomas(prev => ({ ...prev, adormecimiento: { ...prev.adormecimiento, tipo: val } }))}
                  disabled={!sintomas.adormecimiento.tiene}
                >
                  <SelectTrigger className="w-[140px]" data-testid="select-adormecimiento-tipo">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="irradiado">Irradiado</SelectItem>
                    <SelectItem value="localizado">Localizado</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sintomas.adormecimiento.frecuencia}
                  onValueChange={(val) => setSintomas(prev => ({ ...prev, adormecimiento: { ...prev.adormecimiento, frecuencia: val } }))}
                  disabled={!sintomas.adormecimiento.tiene}
                >
                  <SelectTrigger className="w-[140px]" data-testid="select-adormecimiento-frecuencia">
                    <SelectValue placeholder="Frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="difuso">Difuso</SelectItem>
                    <SelectItem value="constante">Constante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={sintomas.hormigueo.tiene}
                  onCheckedChange={(checked) => setSintomas(prev => ({ ...prev, hormigueo: { tiene: !!checked } }))}
                  data-testid="checkbox-hormigueo"
                />
                <span className="text-sm font-medium">Hormigueo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnósticos Previos y Médicos Tratantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FormLabel>Diagnósticos Previos</FormLabel>
                <div className="space-y-2 mt-2">
                  {diagnosticos.map((d, i) => (
                    <Input
                      key={i}
                      placeholder={`Diagnóstico ${i + 1}`}
                      value={d}
                      onChange={(e) => {
                        const newDiags = [...diagnosticos];
                        newDiags[i] = e.target.value;
                        setDiagnosticos(newDiags);
                      }}
                      data-testid={`input-diagnostico-${i}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <FormLabel>Médicos Tratantes</FormLabel>
                <div className="space-y-2 mt-2">
                  {medicos.map((m, i) => (
                    <Input
                      key={i}
                      placeholder={`Médico ${i + 1}`}
                      value={m}
                      onChange={(e) => {
                        const newMeds = [...medicos];
                        newMeds[i] = e.target.value;
                        setMedicos(newMeds);
                      }}
                      data-testid={`input-medico-${i}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estudios Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              {[
                { key: "rm", label: "Resonancia Magnética" },
                { key: "rx", label: "Rayos X" },
                { key: "us", label: "Ultrasonido" },
                { key: "laboratorio", label: "Laboratorio" },
                { key: "densitometria", label: "Densitometría" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    checked={estudios[key as keyof typeof estudios]}
                    onCheckedChange={(checked) => setEstudios(prev => ({ ...prev, [key]: !!checked }))}
                    data-testid={`checkbox-estudio-${key}`}
                  />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nivel del Dolor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nivelDolor"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>1-3</span>
                      <span>4-6</span>
                      <span>7-8</span>
                      <span>9-10</span>
                    </div>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[field.value ?? 0]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      data-testid="slider-nivel-dolor"
                    />
                    <div className="flex justify-between text-xs">
                      <span>Sin Dolor</span>
                      <span>Leve</span>
                      <span>Moderado</span>
                      <span>Severo</span>
                      <span>Insoportable</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold">{field.value ?? 0}</span>
                      <span className="ml-2 text-muted-foreground">- {getPainLabel(field.value ?? 0)}</span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-history">
            {createMutation.isPending ? "Guardando..." : isEditMode ? "Actualizar Historial" : "Registrar Historial"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
