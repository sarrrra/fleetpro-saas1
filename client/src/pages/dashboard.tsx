import { StatCard } from "@/components/stat-card";
import { VehicleCard } from "@/components/vehicle-card";
import { MaintenanceAlert } from "@/components/maintenance-alert";
import { AddVehicleDialog } from "@/components/add-vehicle-dialog";
import { Car, Users, Wrench, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// TODO: Remove mock data when connecting to backend
const mockVehicles = [
  {
    id: "1",
    immatriculation: "AB-123-CD",
    modele: "Renault Trafic",
    type: "Utilitaire",
    kilometrage: 45000,
    status: "disponible" as const,
  },
  {
    id: "2",
    immatriculation: "EF-456-GH",
    modele: "Mercedes Sprinter",
    type: "Camion",
    kilometrage: 120000,
    status: "en_location" as const,
  },
];

const mockMaintenances = [
  {
    vehicleId: "1",
    immatriculation: "AB-123-CD",
    type: "Vidange moteur",
    dueDate: "15/10/2024",
    kilometrage: 50000,
    urgency: "urgent" as const,
  },
  {
    vehicleId: "3",
    immatriculation: "IJ-789-KL",
    type: "Remplacement filtres",
    dueDate: "25/10/2024",
    kilometrage: 120500,
    urgency: "soon" as const,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre parc automobile</p>
        </div>
        <AddVehicleDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Véhicules Actifs"
          value="24"
          icon={Car}
          trend={{ value: 12, isPositive: true }}
          description="Sur 30 véhicules total"
        />
        <StatCard
          title="Chauffeurs"
          value="18"
          icon={Users}
          description="Disponibles aujourd'hui"
        />
        <StatCard
          title="Entretiens Planifiés"
          value="6"
          icon={Wrench}
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Revenus Mensuel"
          value="45,230 €"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Alertes d'entretien</CardTitle>
            <AlertCircle className="h-5 w-5 text-chart-5" />
          </CardHeader>
          <CardContent className="space-y-4">
            {mockMaintenances.map((maintenance) => (
              <MaintenanceAlert
                key={maintenance.vehicleId}
                {...maintenance}
                onSchedule={(id) => console.log('Schedule maintenance for', id)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Véhicules récents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                {...vehicle}
                onView={(id) => console.log('View vehicle', id)}
                onEdit={(id) => console.log('Edit vehicle', id)}
                onDelete={(id) => console.log('Delete vehicle', id)}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
