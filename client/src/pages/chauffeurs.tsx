import { useState } from "react";
import { DriverTable } from "@/components/driver-table";
import { AddDriverDialog } from "@/components/add-driver-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Driver, Vehicle } from "@shared/schema";

export default function Chauffeurs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const { toast } = useToast();

  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/drivers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Chauffeur supprimé",
        description: "Le chauffeur a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le chauffeur",
        variant: "destructive",
      });
    },
  });

  const filteredDrivers = drivers.filter((driver) => {
    const fullName = `${driver.prenom} ${driver.nom}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      driver.telephone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "tous" || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Créer une map des véhicules pour afficher l'immatriculation
  const vehicleMap = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.id] = vehicle.immatriculation;
    return acc;
  }, {} as Record<string, string>);

  // Transformer les données pour le DriverTable
  const driversWithVehicles = filteredDrivers.map((driver) => ({
    ...driver,
    vehiculeAssigne: driver.vehiculeAssigneId ? vehicleMap[driver.vehiculeAssigneId] : undefined,
  }));

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce chauffeur ?")) {
      deleteMutation.mutate(id);
    }
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
          <h1 className="text-3xl font-bold">Gestion des Chauffeurs</h1>
          <p className="text-muted-foreground">
            {drivers.length} chauffeurs enregistrés
          </p>
        </div>
        <AddDriverDialog
          trigger={
            <Button data-testid="button-add-driver">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Chauffeur
            </Button>
          }
        />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-drivers"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-filter-status">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
            <SelectItem value="conge">En congé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DriverTable
        drivers={driversWithVehicles}
        onView={(id) => console.log('View driver', id)}
        onEdit={(id) => console.log('Edit driver', id)}
        onDelete={handleDelete}
      />

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun chauffeur trouvé</p>
        </div>
      )}
    </div>
  );
}
