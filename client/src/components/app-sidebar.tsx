import { Calendar, Users, UserCog, LayoutDashboard, FileText, Sparkles, ClipboardList } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoHorizontal from "@assets/MM_Logo_Horizontal_Color_RGB_1762825081671.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Panel Principal",
    url: "/dashboard",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: Users,
    testId: "link-patients",
  },
  {
    title: "Citas",
    url: "/citas",
    icon: Calendar,
    testId: "link-appointments",
  },
  {
    title: "Terapeutas",
    url: "/terapeutas",
    icon: UserCog,
    testId: "link-therapists",
  },
  {
    title: "Servicios",
    url: "/servicios",
    icon: Sparkles,
    testId: "link-services",
  },
  {
    title: "Protocolos",
    url: "/protocolos",
    icon: ClipboardList,
    testId: "link-protocols",
  },
  {
    title: "Expedientes",
    url: "/expedientes",
    icon: FileText,
    testId: "link-records",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center">
          <img src={logoHorizontal} alt="Massther Med" className="h-10" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={item.testId}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
