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
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Car,
  Users,
  UserCircle,
  Fuel,
  Wrench,
  Wallet,
  FileText,
  Settings,
  Shield,
  Palette,
} from "lucide-react";
import { Link, useLocation } from "wouter";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Véhicules",
    url: "/vehicules",
    icon: Car,
  },
  {
    title: "Chauffeurs",
    url: "/chauffeurs",
    icon: UserCircle,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Carburant",
    url: "/carburant",
    icon: Fuel,
  },
  {
    title: "Entretien",
    url: "/entretien",
    icon: Wrench,
  },
  {
    title: "Trésorerie",
    url: "/tresorerie",
    icon: Wallet,
  },
  {
    title: "Factures",
    url: "/factures",
    icon: FileText,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">FleetPro</h2>
            <p className="text-xs text-muted-foreground">Gestion de Parc</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-sidebar-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/parametres"}
                  data-testid="link-sidebar-parametres"
                >
                  <Link href="/parametres">
                    <Settings className="h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/administration"}
                  data-testid="link-sidebar-administration"
                >
                  <Link href="/administration">
                    <Shield className="h-4 w-4" />
                    <span>Administration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/personnalisation"}
                  data-testid="link-sidebar-personnalisation"
                >
                  <Link href="/personnalisation">
                    <Palette className="h-4 w-4" />
                    <span>Personnalisation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            AB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@fleetpro.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
