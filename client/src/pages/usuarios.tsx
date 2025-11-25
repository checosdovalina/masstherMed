import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Users, Shield, UserCircle, Crown } from "lucide-react";
import type { User, Therapist } from "@shared/schema";
import { USER_ROLES } from "@shared/schema";
import { useState } from "react";
import { z } from "zod";

type UserWithoutPassword = Omit<User, "passwordHash">;

const userFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
  role: z.enum([USER_ROLES.DIRECTOR, USER_ROLES.THERAPIST, USER_ROLES.COORDINATOR]),
  therapistId: z.string().optional(),
});

type UserFormInput = z.infer<typeof userFormSchema>;

function getRoleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  switch (role) {
    case USER_ROLES.DIRECTOR:
      return "default";
    case USER_ROLES.THERAPIST:
      return "secondary";
    case USER_ROLES.COORDINATOR:
      return "outline";
    default:
      return "outline";
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case USER_ROLES.DIRECTOR:
      return <Crown className="h-3 w-3" />;
    case USER_ROLES.THERAPIST:
      return <UserCircle className="h-3 w-3" />;
    case USER_ROLES.COORDINATOR:
      return <Shield className="h-3 w-3" />;
    default:
      return <Users className="h-3 w-3" />;
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case USER_ROLES.DIRECTOR:
      return "Director Clínico";
    case USER_ROLES.THERAPIST:
      return "Terapeuta";
    case USER_ROLES.COORDINATOR:
      return "Coordinador(a)";
    default:
      return role;
  }
}

function UserFormDialog({ 
  user, 
  therapists, 
  onClose 
}: { 
  user?: UserWithoutPassword; 
  therapists: Therapist[]; 
  onClose: () => void 
}) {
  const { toast } = useToast();
  const isEditing = !!user;

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: (user?.role as UserFormInput["role"]) || USER_ROLES.COORDINATOR,
      therapistId: user?.therapistId || undefined,
    },
  });

  const watchRole = form.watch("role");

  const createMutation = useMutation({
    mutationFn: async (data: UserFormInput) => {
      return await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UserFormInput) => {
      const payload: any = { ...data };
      if (!payload.password) delete payload.password;
      return await apiRequest("PATCH", `/api/users/${user?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormInput) => {
    if (data.role !== USER_ROLES.THERAPIST) {
      data.therapistId = undefined;
    }
    
    if (isEditing) {
      if (!data.password || data.password === "") {
        delete (data as any).password;
      }
      updateMutation.mutate(data);
    } else {
      if (!data.password) {
        toast({
          title: "Error",
          description: "La contraseña es requerida para nuevos usuarios.",
          variant: "destructive",
        });
        return;
      }
      createMutation.mutate(data);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle data-testid="dialog-title-user">
          {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
        </DialogTitle>
        <DialogDescription>
          {isEditing 
            ? "Actualice los datos del usuario. Deje la contraseña vacía para mantener la actual." 
            : "Complete los datos para crear un nuevo usuario del sistema."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Ej: María García López"
                    data-testid="input-user-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="usuario@massthermed.com"
                    data-testid="input-user-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password"
                    placeholder={isEditing ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"}
                    data-testid="input-user-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-user-role">
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={USER_ROLES.DIRECTOR} data-testid="option-role-director">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        <span>Director Clínico</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={USER_ROLES.THERAPIST} data-testid="option-role-terapeuta">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        <span>Terapeuta</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={USER_ROLES.COORDINATOR} data-testid="option-role-coordinador">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Coordinador(a)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchRole === USER_ROLES.THERAPIST && (
            <FormField
              control={form.control}
              name="therapistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terapeuta asociado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger data-testid="select-user-therapist">
                        <SelectValue placeholder="Seleccione un terapeuta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {therapists.map((therapist) => (
                        <SelectItem 
                          key={therapist.id} 
                          value={therapist.id}
                          data-testid={`option-therapist-${therapist.id}`}
                        >
                          {therapist.name} - {therapist.specialties?.join(", ") || "Sin especialidad"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-user">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-user"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Guardando..."
                : isEditing
                ? "Actualizar"
                : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}

export default function Usuarios() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | undefined>();

  const { data: users = [], isLoading: usersLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/users"],
  });

  const { data: therapists = [] } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
    },
  });

  const handleOpenNew = () => {
    setEditingUser(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (user: UserWithoutPassword) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(undefined);
  };

  const roleGroups = {
    [USER_ROLES.DIRECTOR]: users.filter(u => u.role === USER_ROLES.DIRECTOR),
    [USER_ROLES.THERAPIST]: users.filter(u => u.role === USER_ROLES.THERAPIST),
    [USER_ROLES.COORDINATOR]: users.filter(u => u.role === USER_ROLES.COORDINATOR),
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-usuarios">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Administre los usuarios del sistema y sus roles de acceso
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew} data-testid="button-new-user">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <UserFormDialog
            user={editingUser}
            therapists={therapists}
            onClose={handleCloseDialog}
          />
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Directores</CardTitle>
            </div>
            <CardDescription>Acceso completo al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="count-directors">
              {roleGroups[USER_ROLES.DIRECTOR].length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-secondary-foreground" />
              <CardTitle className="text-lg">Terapeutas</CardTitle>
            </div>
            <CardDescription>Gestión de pacientes y sesiones</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="count-therapists">
              {roleGroups[USER_ROLES.THERAPIST].length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Coordinadores</CardTitle>
            </div>
            <CardDescription>Gestión de citas y agenda</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="count-coordinators">
              {roleGroups[USER_ROLES.COORDINATOR].length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando usuarios...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                  data-testid={`row-user-${user.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`text-user-name-${user.id}`}>
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-user-email-${user.id}`}>
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={getRoleBadgeVariant(user.role)}
                      data-testid={`badge-role-${user.id}`}
                    >
                      {getRoleLabel(user.role)}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        data-testid={`button-edit-user-${user.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
                              <strong>{user.name}</strong> del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid="button-cancel-delete">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(user.id)}
                              className="bg-destructive text-destructive-foreground hover-elevate"
                              data-testid="button-confirm-delete"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos por Rol</CardTitle>
          <CardDescription>
            Descripción de los permisos de cada rol del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <Crown className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Director Clínico</h3>
                <p className="text-sm text-muted-foreground">
                  Acceso completo a todas las funciones: gestión de usuarios, pacientes, 
                  terapeutas, citas, expedientes, protocolos, servicios y reportes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <UserCircle className="h-6 w-6 text-secondary-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Terapeuta</h3>
                <p className="text-sm text-muted-foreground">
                  Acceso a sus pacientes asignados, expedientes clínicos, sesiones 
                  y protocolos de tratamiento. Vista de su agenda personal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <Shield className="h-6 w-6 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Coordinador(a)</h3>
                <p className="text-sm text-muted-foreground">
                  Gestión de citas y agenda general. Registro de pacientes. 
                  Acceso limitado a expedientes clínicos (solo vista).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
