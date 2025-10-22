import { AddDriverDialog } from "@/components/add-driver-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Driver, Vehicle } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusLabels: Record<string, string> = {
  actif: "Actif",
  inactif: "Inactif",
  conge: "En congé",
};

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  actif: "default",
  inactif: "secondary",
  conge: "outline",
};

type DriverWithVehicle = Driver & { vehiculeAssigne?: string };

export default function Chauffeurs() {
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

  // Créer une map des véhicules pour afficher l'immatriculation
  const vehicleMap = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.id] = vehicle.immatriculation;
    return acc;
  }, {} as Record<string, string>);

  // Transformer les données pour ajouter le véhicule assigné
  const driversWithVehicles: DriverWithVehicle[] = drivers.map((driver) => ({
    ...driver,
    vehiculeAssigne: driver.vehiculeAssigneId ? vehicleMap[driver.vehiculeAssigneId] : undefined,
  }));

  const columns: ColumnDef<DriverWithVehicle>[] = [
    {
      accessorKey: "nom",
      header: "Nom",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nom")}</div>
      ),
    },
    {
      accessorKey: "prenom",
      header: "Prénom",
    },
    {
      accessorKey: "telephone",
      header: "Téléphone",
    },
    {
      accessorKey: "vehiculeAssigne",
      header: "Véhicule Assigné",
      cell: ({ row }) => {
        const vehicle = row.getValue("vehiculeAssigne") as string | undefined;
        return vehicle ? (
          <Badge variant="outline">{vehicle}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">Non assigné</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={statusColors[status] || "default"}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const driver = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => console.log("Edit", driver.id)}
              data-testid={`button-edit-driver-${driver.id}`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid={`button-delete-driver-${driver.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer le chauffeur {driver.prenom} {driver.nom} ?
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(driver.id)}
                    data-testid="button-confirm-delete"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des chauffeurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Chauffeurs</h1>
          <p className="text-muted-foreground">
            {drivers.length} chauffeur(s) enregistré(s)
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

      <DataTable
        columns={columns}
        data={driversWithVehicles}
        searchPlaceholder="Rechercher par nom, prénom, téléphone..."
      />
    </div>
  );
}
