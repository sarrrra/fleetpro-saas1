import { useState } from "react";
import { AddFuelRecordDialog } from "@/components/add-fuel-record-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Fuel } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { FuelRecord, Vehicle, Driver } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Carburant() {
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filtrer les enregistrements
  const filteredRecords = fuelRecords.filter((record) => {
    const vehicleName = vehicleMap[record.vehiculeId] || "";
    const driverName = record.chauffeurId ? driverMap[record.chauffeurId] : "";
    const searchLower = searchTerm.toLowerCase();
    
    return (
      vehicleName.toLowerCase().includes(searchLower) ||
      driverName.toLowerCase().includes(searchLower) ||
      record.kilometrage.toString().includes(searchTerm)
    );
  });

  // Trier par date décroissante
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suivi Carburant</h1>
          <p className="text-muted-foreground">
            {fuelRecords.length} enregistrements
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par véhicule, chauffeur ou kilométrage..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-fuel"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Véhicule</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Kilométrage</TableHead>
              <TableHead>Quantité (L)</TableHead>
              <TableHead>Prix/L</TableHead>
              <TableHead>Coût Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecords.map((record) => (
              <TableRow key={record.id} data-testid={`row-fuel-${record.id}`}>
                <TableCell>{formatDate(record.date)}</TableCell>
                <TableCell>{vehicleMap[record.vehiculeId] || 'Inconnu'}</TableCell>
                <TableCell>
                  {record.chauffeurId ? driverMap[record.chauffeurId] : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{record.kilometrage.toLocaleString('fr-FR')} km</TableCell>
                <TableCell>{parseFloat(record.quantite).toFixed(2)} L</TableCell>
                <TableCell>{formatCurrency(record.coutUnitaire)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(record.coutTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedRecords.length === 0 && (
        <div className="text-center py-12">
          <Fuel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun enregistrement de carburant trouvé</p>
        </div>
      )}
    </div>
  );
}
