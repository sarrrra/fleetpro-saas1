import { StatCard } from "@/components/stat-card";
import { VehicleCard } from "@/components/vehicle-card";
import { MaintenanceAlert } from "@/components/maintenance-alert";
import { AddVehicleDialog } from "@/components/add-vehicle-dialog";
import { SubscriptionAlerts } from "@/components/subscription-alerts";
import { Car, Users, Wrench, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Vehicle, MaintenanceRecord } from "@shared/schema";
import { format } from "date-fns";

interface DashboardStats {
  activeVehicles: number;
  totalVehicles: number;
  activeDrivers: number;
  upcomingMaintenance: number;
  monthlyRevenue: number;
}

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous êtes déconnecté. Reconnexion...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    retry: false,
  });

  const { data: maintenance = [], isLoading: maintenanceLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance/upcoming"],
    retry: false,
  });

  if (authLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  const recentVehicles = vehicles.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Vue d'ensemble de votre parc automobile</p>
        </div>
        <AddVehicleDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Véhicules Actifs"
          value={stats?.activeVehicles?.toString() || "0"}
          icon={Car}
          description={`Sur ${stats?.totalVehicles || 0} véhicules total`}
        />
        <StatCard
          title="Chauffeurs Actifs"
          value={stats?.activeDrivers?.toString() || "0"}
          icon={Users}
          description="Disponibles aujourd'hui"
        />
        <StatCard
          title="Entretiens Planifiés"
          value={stats?.upcomingMaintenance?.toString() || "0"}
          icon={Wrench}
        />
        <StatCard
          title="Revenus Mensuel"
          value={`${stats?.monthlyRevenue?.toLocaleString('fr-FR') || "0"} €`}
          icon={TrendingUp}
        />
      </div>

      {user?.role === "super_admin" && <SubscriptionAlerts />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Alertes d'entretien</CardTitle>
            <AlertCircle className="h-5 w-5 text-chart-5" />
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenanceLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : maintenance.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Aucune alerte d'entretien</p>
              </div>
            ) : (
              maintenance.slice(0, 3).map((m) => (
                <MaintenanceAlert
                  key={m.id}
                  vehicleId={m.vehiculeId}
                  immatriculation={m.vehiculeId}
                  type={m.type}
                  dueDate={m.datePrevu ? format(new Date(m.datePrevu), "dd/MM/yyyy") : "Non défini"}
                  kilometrage={m.kilometragePrevu || 0}
                  urgency={m.urgency}
                  onSchedule={(id) => console.log('Schedule maintenance for', id)}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Véhicules récents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vehiclesLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : recentVehicles.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Aucun véhicule</p>
              </div>
            ) : (
              recentVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  id={vehicle.id}
                  immatriculation={vehicle.immatriculation}
                  modele={`${vehicle.marque} ${vehicle.modele}`}
                  type={vehicle.type}
                  kilometrage={vehicle.kilometrage}
                  status={vehicle.status}
                  onView={(id) => console.log('View vehicle', id)}
                  onEdit={(id) => console.log('Edit vehicle', id)}
                  onDelete={(id) => console.log('Delete vehicle', id)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
