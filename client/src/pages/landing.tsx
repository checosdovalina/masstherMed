import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Calendar, Heart, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">TC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">TerapiaClinic</h1>
                <p className="text-xs text-muted-foreground">Centro de Terapias Profesional</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button data-testid="button-login">
                Acceder al Sistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Bienvenido a TerapiaClinic
            </h2>
            <p className="text-xl text-muted-foreground">
              Centro especializado en terapias físicas, ocupacionales, del lenguaje y psicológicas. 
              Comprometidos con tu bienestar y recuperación.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Atención Personalizada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Planes de tratamiento adaptados a las necesidades individuales de cada paciente
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Equipo Profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Terapeutas certificados con amplia experiencia en diferentes especialidades
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Tecnología Avanzada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Equipamiento moderno y técnicas actualizadas para mejores resultados
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Horarios Flexibles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Disponibilidad adaptada a tu agenda para facilitar tu tratamiento
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card rounded-lg border p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Nuestros Servicios</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <strong className="font-semibold">Terapia Física:</strong>
                      <span className="text-muted-foreground"> Rehabilitación y mejora de la movilidad</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <strong className="font-semibold">Terapia Ocupacional:</strong>
                      <span className="text-muted-foreground"> Desarrollo de habilidades para actividades diarias</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <strong className="font-semibold">Terapia del Lenguaje:</strong>
                      <span className="text-muted-foreground"> Mejora de comunicación y habla</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <strong className="font-semibold">Terapia Psicológica:</strong>
                      <span className="text-muted-foreground"> Apoyo emocional y salud mental</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <h4 className="text-xl font-bold mb-4">Acceso al Sistema de Gestión</h4>
                <p className="text-muted-foreground mb-6">
                  Profesionales de la salud pueden acceder al sistema de gestión para administrar pacientes, citas y expedientes clínicos.
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="w-full" data-testid="button-access-system">
                    Ingresar al Sistema
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 TerapiaClinic. Todos los derechos reservados.</p>
          <p className="mt-2">Centro de Terapias Profesional</p>
        </div>
      </footer>
    </div>
  );
}
