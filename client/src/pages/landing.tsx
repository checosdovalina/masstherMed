import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Calendar, Heart, ArrowRight, Award, Clock, Shield, Target, TrendingUp, CheckCircle2, MapPin, Phone, Mail, Star } from "lucide-react";
import logoHorizontal from "@assets/MM_Logo_Horizontal_Color_RGB_1762825081671.png";
import heroImage from "@assets/stock_images/professional_therape_1de7ca21.jpg";
import treatmentImage from "@assets/stock_images/professional_therape_b5bc45ef.jpg";
import clinicImage from "@assets/stock_images/professional_therape_d11a459b.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img src={logoHorizontal} alt="Massther Med" className="h-12 md:h-16" />
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#servicios" className="text-muted-foreground hover:text-foreground transition-colors">Servicios</a>
              <a href="#nosotros" className="text-muted-foreground hover:text-foreground transition-colors">Nosotros</a>
              <a href="#ubicacion" className="text-muted-foreground hover:text-foreground transition-colors">Ubicación</a>
              <a href="#contacto" className="text-muted-foreground hover:text-foreground transition-colors">Contacto</a>
            </div>
            <Link href="/login" data-testid="link-login-nav">
              <Button data-testid="button-login">
                Acceso Personal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative h-[90vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Centro de Masajes Terapéuticos Massther Med" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-white/90 text-sm">Excelencia en atención</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Centro de Masajes
              <span className="block text-primary">Terapéuticos Profesionales</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              En Massther Med° nos dedicamos a tu bienestar y recuperación física 
              con tratamientos personalizados de alta calidad.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contacto">
                <Button size="lg" className="text-lg px-8" data-testid="button-contact-hero">
                  Agenda tu Cita
                  <Calendar className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="#servicios">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20" data-testid="button-services-hero">
                  Ver Servicios
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</p>
              <p className="text-muted-foreground">Pacientes Atendidos</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">10+</p>
              <p className="text-muted-foreground">Años de Experiencia</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</p>
              <p className="text-muted-foreground">Satisfacción</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">15+</p>
              <p className="text-muted-foreground">Tipos de Terapia</p>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Servicios</h2>
            <p className="text-lg text-muted-foreground">
              Ofrecemos una amplia gama de tratamientos terapéuticos adaptados a tus necesidades específicas
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-bold mb-6">Masaje Terapéutico</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Nuestro servicio principal está diseñado para tratar dolencias específicas, 
                aliviar el dolor muscular y mejorar la movilidad. Utilizamos técnicas 
                profesionales respaldadas por la evidencia científica.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Tratamiento de contracturas y tensiones</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Alivio del dolor crónico</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Mejora de la circulación sanguínea</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Rehabilitación post-lesión</span>
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src={treatmentImage} 
                alt="Tratamiento de masaje terapéutico profesional" 
                className="rounded-lg shadow-lg w-full h-80 object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Masaje Deportivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Especializado para atletas y personas activas. Prevención de lesiones y mejora del rendimiento.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Masaje Relajante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Técnicas suaves para reducir el estrés, la ansiedad y promover la relajación profunda.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Tejido Profundo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trabajo intensivo en capas musculares profundas para dolencias crónicas y contracturas severas.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Rehabilitación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Programas de recuperación post-quirúrgica y tratamiento de lesiones específicas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="nosotros" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={clinicImage} 
                alt="Instalaciones de Massther Med" 
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Por qué elegir Massther Med°?</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Somos un equipo de profesionales comprometidos con tu bienestar. 
                Combinamos técnicas tradicionales con tecnología moderna para 
                ofrecerte los mejores resultados en tu tratamiento.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Profesionales Certificados</h4>
                    <p className="text-sm text-muted-foreground">Terapeutas con formación continua</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Ambiente Seguro</h4>
                    <p className="text-sm text-muted-foreground">Protocolos de higiene estrictos</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Atención Personalizada</h4>
                    <p className="text-sm text-muted-foreground">Tratamientos a tu medida</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Horarios Flexibles</h4>
                    <p className="text-sm text-muted-foreground">Adaptados a tu agenda</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Campos de Tratamiento</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Especialistas en diversas áreas terapéuticas para atender tus necesidades
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Lesiones Deportivas", desc: "Recuperación y prevención atlética" },
              { title: "Dolor Crónico", desc: "Tratamiento de dolencias persistentes" },
              { title: "Rehabilitación", desc: "Recuperación post-quirúrgica" },
              { title: "Estrés y Tensión", desc: "Alivio de tensión muscular" },
              { title: "Postura Corporal", desc: "Corrección de problemas posturales" },
              { title: "Movilidad Articular", desc: "Mejora de rango de movimiento" },
              { title: "Fatiga Muscular", desc: "Recuperación y revitalización" },
              { title: "Bienestar General", desc: "Prevención y mantenimiento" },
            ].map((item, index) => (
              <div key={index} className="bg-card border rounded-lg p-6 hover-elevate">
                <CheckCircle2 className="h-6 w-6 text-primary mb-3" />
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ubicacion" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestra Ubicación</h2>
            <p className="text-lg text-muted-foreground">
              Visítanos en nuestras instalaciones en Torreón, Coahuila
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-card border rounded-lg overflow-hidden shadow-lg">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3597.7285!2d-103.4293123!3d25.537782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x868fdbbfea470a53%3A0xc7927fa962b8c154!2sMassther%20Med!5e0!3m2!1ses!2smx!4v1700000000000!5m2!1ses!2smx"
                width="100%" 
                height="400" 
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Massther Med"
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col justify-center space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Dirección</h4>
                      <p className="text-muted-foreground">
                        Torreón, Coahuila, México
                      </p>
                      <a 
                        href="https://www.google.com/maps/place/Massther+Med/@25.537782,-103.4293123,17z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm mt-2 inline-block"
                      >
                        Ver en Google Maps
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Horarios de Atención</h4>
                      <div className="text-muted-foreground space-y-1">
                        <p>Lunes a Viernes: 9:00 AM - 7:00 PM</p>
                        <p>Sábado: 9:00 AM - 2:00 PM</p>
                        <p>Domingo: Cerrado</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <a 
                href="https://www.google.com/maps/dir//Massther+Med,+Torreón,+Coah."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="w-full" data-testid="button-directions">
                  <MapPin className="mr-2 h-5 w-5" />
                  Cómo Llegar
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contacto</h2>
            <p className="text-lg text-muted-foreground">
              Estamos aquí para ayudarte. Contáctanos para agendar tu cita
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Teléfono</h4>
                <p className="text-muted-foreground">Llámanos para agendar</p>
                <a href="tel:+528717000000" className="text-primary font-medium hover:underline mt-2 block">
                  (871) 700 0000
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-muted-foreground">Escríbenos tus dudas</p>
                <a href="mailto:contacto@massthermed.com" className="text-primary font-medium hover:underline mt-2 block">
                  contacto@massthermed.com
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover-elevate">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Cita Online</h4>
                <p className="text-muted-foreground">Agenda desde aquí</p>
                <Link href="/login" className="text-primary font-medium hover:underline mt-2 block">
                  Sistema de Citas
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            ¿Listo para sentirte mejor?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Agenda tu primera consulta y comienza tu camino hacia el bienestar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+528717000000">
              <Button size="lg" variant="secondary" className="text-lg px-8" data-testid="button-call-cta">
                <Phone className="mr-2 h-5 w-5" />
                Llamar Ahora
              </Button>
            </a>
            <a href="#ubicacion">
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-visit-cta">
                <MapPin className="mr-2 h-5 w-5" />
                Visítanos
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <img src={logoHorizontal} alt="Massther Med" className="h-12 mb-4" />
              <p className="text-muted-foreground max-w-md">
                Centro de Masajes Terapéuticos Profesionales. Comprometidos con tu 
                bienestar, salud y recuperación física desde hace más de 10 años.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#servicios" className="hover:text-foreground transition-colors">Servicios</a></li>
                <li><a href="#nosotros" className="hover:text-foreground transition-colors">Nosotros</a></li>
                <li><a href="#ubicacion" className="hover:text-foreground transition-colors">Ubicación</a></li>
                <li><a href="#contacto" className="hover:text-foreground transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Torreón, Coahuila
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  (871) 700 0000
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  contacto@massthermed.com
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Massther Med°. Todos los derechos reservados.</p>
            <p className="mt-1">Therapeutic Massage Center - Torreón, Coahuila, México</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
