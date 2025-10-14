import { useState } from "react";
import { VehicleCard } from "@/components/vehicle-card";
import { AddVehicleDialog } from "@/components/add-vehicle-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  {
    id: "3",
    immatriculation: "IJ-789-KL",
    modele: "Peugeot 308",
    type: "Voiture",
    kilometrage: 78000,
    status: "en_maintenance" as const,
  },
  {
    id: "4",
    immatriculation: "MN-012-OP",
    modele: "Citroën Berlingo",
    type: "Utilitaire",
    kilometrage: 92000,
    status: "disponible" as const,
  },
  {
    id: "5",
    immatriculation: "QR-345-ST",
    modele: "Ford Transit",
    type: "Camion",
    kilometrage: 156000,
    status: "hors_service" as const,
  },
  {
    id: "6",
    immatriculation: "UV-678-WX",
    modele: "Volkswagen Caddy",
    type: "Utilitaire",
    kilometrage: 34000,
    status: "disponible" as const,
  },
];

export default function Vehicules() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredVehicles = mockVehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modele.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Véhicules</h1>
          <p className="text-muted-foreground">
            {mockVehicles.length} véhicules au total
          </p>
        </div>
        <AddVehicleDialog />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par immatriculation ou modèle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-vehicles"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-status">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="disponible">Disponible</SelectItem>
            <SelectItem value="en_location">En location</SelectItem>
            <SelectItem value="en_maintenance">En maintenance</SelectItem>
            <SelectItem value="hors_service">Hors service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            {...vehicle}
            onView={(id) => console.log('View vehicle', id)}
            onEdit={(id) => console.log('Edit vehicle', id)}
            onDelete={(id) => console.log('Delete vehicle', id)}
          />
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun véhicule trouvé</p>
        </div>
      )}
    </div>
  );
}
