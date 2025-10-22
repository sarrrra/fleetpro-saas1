import { AddMaintenanceDialog } from "@/components/add-maintenance-dialog";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { MaintenanceRecord, Vehicle } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function Maintenance() {
  const { data: maintenanceRecords = [], isLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const vehicleMap = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.id] = `${vehicle.immatriculation} - ${vehicle.marque} ${vehicle.modele}`;
    return acc;
  }, {} as Record<string, string>);

  const getMaintenanceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      vidange: "Vidange",
      filtres: "Filtres",
      pneus: "Pneus",
      freins: "Freins",
      batterie: "Batterie",
      courroie: "Courroie",
      revision: "Révision",
      autre: "Autre",
    };
    return types[type] || type;
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  type MaintenanceWithVehicle = MaintenanceRecord & { vehiculeNom: string };

  const recordsWithVehicles: MaintenanceWithVehicle[] = maintenanceRecords.map((record) => ({
    ...record,
    vehiculeNom: vehicleMap[record.vehiculeId] || 'Inconnu',
  }));

  const columns: ColumnDef<MaintenanceWithVehicle>[] = [
    {
      accessorKey: "vehiculeNom",
      header: "Véhicule",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return getMaintenanceTypeLabel(type);
      },
    },
    {
      accessorKey: "datePrevu",
      header: "Date Prévue",
      cell: ({ row }) => {
        const date = row.getValue("datePrevu") as string | null;
        return formatDate(date);
      },
    },
    {
      accessorKey: "kilometragePrevu",
      header: "Kilométrage",
      cell: ({ row }) => {
        const km = row.getValue("kilometragePrevu") as string | null;
        return km ? `${parseInt(km).toLocaleString("fr-FR")} km` : "-";
      },
    },
    {
      accessorKey: "urgency",
      header: "Urgence",
      cell: ({ row }) => {
        const record = row.original;
        if (record.complete) {
          return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Terminé</Badge>;
        }
        
        switch (record.urgency) {
          case "scheduled":
            return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"><Clock className="h-3 w-3 mr-1" />Planifié</Badge>;
          case "soon":
            return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"><AlertTriangle className="h-3 w-3 mr-1" />Bientôt</Badge>;
          case "urgent":
            return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"><AlertTriangle className="h-3 w-3 mr-1" />Urgent</Badge>;
          default:
            return <Badge variant="outline">{record.urgency}</Badge>;
        }
      },
    },
    {
      accessorKey: "cout",
      header: "Coût",
      cell: ({ row }) => {
        const cout = row.getValue("cout") as string | null;
        return formatCurrency(cout);
      },
    },
  ];

  const stats = {
    scheduled: maintenanceRecords.filter(r => !r.complete && r.urgency === "scheduled").length,
    soon: maintenanceRecords.filter(r => !r.complete && r.urgency === "soon").length,
    urgent: maintenanceRecords.filter(r => !r.complete && r.urgency === "urgent").length,
    complete: maintenanceRecords.filter(r => r.complete).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Planification Maintenance</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {maintenanceRecords.length} enregistrement(s)
          </p>
        </div>
        <AddMaintenanceDialog
          trigger={
            <Button data-testid="button-add-maintenance">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Planifier </span>Maintenance
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Planifiés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bientôt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soon}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.urgent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complete}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={recordsWithVehicles}
        searchPlaceholder="Rechercher par véhicule, type..."
      />
    </div>
  );
}
