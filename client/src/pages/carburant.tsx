import { AddFuelRecordDialog } from "@/components/add-fuel-record-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { FuelRecord, Vehicle, Driver } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function Carburant() {
  const { data: fuelRecords = [], isLoading } = useQuery<FuelRecord[]>({
    queryKey: ["/api/fuel"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  // Créer des maps pour affichage rapide
  const vehicleMap = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.id] = `${vehicle.immatriculation} - ${vehicle.marque} ${vehicle.modele}`;
    return acc;
  }, {} as Record<string, string>);

  const driverMap = drivers.reduce((acc, driver) => {
    acc[driver.id] = `${driver.prenom} ${driver.nom}`;
    return acc;
  }, {} as Record<string, string>);

  // Calculer les statistiques
  const stats = fuelRecords.reduce(
    (acc, record) => {
      acc.totalCost += parseFloat(record.coutTotal);
      acc.totalQuantity += parseFloat(record.quantite);
      acc.totalRecords += 1;
      return acc;
    },
    { totalCost: 0, totalQuantity: 0, totalRecords: 0 }
  );

  const avgCostPerLiter = stats.totalQuantity > 0 ? stats.totalCost / stats.totalQuantity : 0;

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  type FuelRecordWithNames = FuelRecord & {
    vehiculeNom: string;
    chauffeurNom?: string;
  };

  const recordsWithNames: FuelRecordWithNames[] = fuelRecords.map((record) => ({
    ...record,
    vehiculeNom: vehicleMap[record.vehiculeId] || 'Inconnu',
    chauffeurNom: record.chauffeurId ? driverMap[record.chauffeurId] : undefined,
  }));

  const columns: ColumnDef<FuelRecordWithNames>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        return formatDate(date);
      },
    },
    {
      accessorKey: "vehiculeNom",
      header: "Véhicule",
    },
    {
      accessorKey: "chauffeurNom",
      header: "Chauffeur",
      cell: ({ row }) => {
        const chauffeur = row.getValue("chauffeurNom") as string | undefined;
        return chauffeur || <span className="text-muted-foreground text-sm">Non spécifié</span>;
      },
    },
    {
      accessorKey: "kilometrage",
      header: "Kilométrage",
      cell: ({ row }) => {
        const km = row.getValue("kilometrage") as string;
        return `${parseInt(km).toLocaleString("fr-FR")} km`;
      },
    },
    {
      accessorKey: "quantite",
      header: "Quantité",
      cell: ({ row }) => {
        const qte = row.getValue("quantite") as string;
        return `${parseFloat(qte).toFixed(2)} L`;
      },
    },
    {
      accessorKey: "prixUnitaire",
      header: "Prix/L",
      cell: ({ row }) => {
        const prix = row.getValue("prixUnitaire") as string;
        return formatCurrency(prix);
      },
    },
    {
      accessorKey: "coutTotal",
      header: "Coût Total",
      cell: ({ row }) => {
        const cout = row.getValue("coutTotal") as string;
        return <span className="font-medium">{formatCurrency(cout)}</span>;
      },
    },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suivi Carburant</h1>
          <p className="text-muted-foreground">
            {fuelRecords.length} enregistrement(s)
          </p>
        </div>
        <AddFuelRecordDialog
          trigger={
            <Button data-testid="button-add-fuel">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Enregistrement
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quantité Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuantity.toFixed(2)} L</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Prix Moyen/L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgCostPerLiter)}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={recordsWithNames}
        searchPlaceholder="Rechercher par véhicule, chauffeur..."
      />
    </div>
  );
}
