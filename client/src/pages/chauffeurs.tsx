import { useState } from "react";
import { DriverTable } from "@/components/driver-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

// TODO: Remove mock data when connecting to backend
const mockDrivers = [
  {
    id: "1",
    nom: "Dubois",
    prenom: "Jean",
    telephone: "06 12 34 56 78",
    vehiculeAssigne: "AB-123-CD",
    status: "actif" as const,
  },
  {
    id: "2",
    nom: "Martin",
    prenom: "Sophie",
    telephone: "06 98 76 54 32",
    vehiculeAssigne: "EF-456-GH",
    status: "actif" as const,
  },
  {
    id: "3",
    nom: "Bernard",
    prenom: "Pierre",
    telephone: "06 11 22 33 44",
    status: "conge" as const,
  },
  {
    id: "4",
    nom: "Petit",
    prenom: "Marie",
    telephone: "06 55 66 77 88",
    vehiculeAssigne: "IJ-789-KL",
    status: "actif" as const,
  },
  {
    id: "5",
    nom: "Leroy",
    prenom: "Paul",
    telephone: "06 33 44 55 66",
    status: "inactif" as const,
  },
];

export default function Chauffeurs() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDrivers = mockDrivers.filter((driver) => {
    const fullName = `${driver.prenom} ${driver.nom}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      driver.telephone.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Chauffeurs</h1>
          <p className="text-muted-foreground">
            {mockDrivers.length} chauffeurs enregistrés
          </p>
        </div>
        <Button data-testid="button-add-driver">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Chauffeur
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou téléphone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-drivers"
        />
      </div>

      <DriverTable
        drivers={filteredDrivers}
        onView={(id) => console.log('View driver', id)}
        onEdit={(id) => console.log('Edit driver', id)}
        onDelete={(id) => console.log('Delete driver', id)}
      />

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun chauffeur trouvé</p>
        </div>
      )}
    </div>
  );
}
