import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Calendar, Heart, ArrowRight } from "lucide-react";
import logoHorizontal from "@assets/MM_Logo_Horizontal_Color_RGB_1762825081671.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img src={logoHorizontal} alt="Massther Med" className="h-16 md:h-20" />
            </div>
            <Link href="/dashboard" data-testid="link-dashboard-nav">
              <Button size="lg" data-testid="button-login">
                Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Massther Med°
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Centro de Masajes Terapéuticos Profesionales
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Comprometidos con tu bienestar, salud y recuperación física a través de 
              tratamientos personalizados y profesionales de alta calidad.
            </p>
            <div className="mt-10">
              <Link href="/dashboard" data-testid="link-dashboard-hero">
                <Button size="lg" className="h-14 px-8 text-lg" data-testid="button-access-hero">
                  Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
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

          <div className="bg-card rounded-lg border p-8 md:p-12 shadow-sm">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Nuestros Servicios</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <strong className="font-semibold text-lg">Masaje Terapéutico:</strong>
                      <span className="text-muted-foreground"> Tratamiento especializado para alivio del dolor y recuperación muscular</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <strong className="font-semibold text-lg">Masaje Deportivo:</strong>
                      <span className="text-muted-foreground"> Prevención de lesiones y mejora del rendimiento atlético</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <strong className="font-semibold text-lg">Masaje de Relajación:</strong>
                      <span className="text-muted-foreground"> Reducción de estrés y tensión muscular</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <strong className="font-semibold text-lg">Masaje de Tejido Profundo:</strong>
                      <span className="text-muted-foreground"> Tratamiento de dolencias crónicas y contracturas musculares</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-10 text-center border">
                <h4 className="text-2xl font-bold mb-4">Sistema de Gestión Profesional</h4>
                <p className="text-muted-foreground mb-8 text-lg">
                  Accede al sistema de gestión para administrar pacientes, citas y expedientes clínicos de manera eficiente.
                </p>
                <Link href="/dashboard" data-testid="link-dashboard-cta">
                  <Button size="lg" className="w-full h-14 text-lg" data-testid="button-access-system">
                    Login
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
          <p>© 2025 Massther Med°. Todos los derechos reservados.</p>
          <p className="mt-2">Therapeutic Massage Center</p>
        </div>
      </footer>
    </div>
  );
}
