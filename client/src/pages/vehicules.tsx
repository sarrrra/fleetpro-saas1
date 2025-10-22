import { useEffect, useState } from "react";
import { AddVehicleDialog } from "@/components/add-vehicle-dialog";
import { EditVehicleDialog } from "@/components/edit-vehicle-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
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
  disponible: "Disponible",
  en_location: "En location",
  en_maintenance: "En maintenance",
  hors_service: "Hors service",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  disponible: "default",
  en_location: "secondary",
  en_maintenance: "outline",
  hors_service: "destructive",
};

const typeLabels: Record<string, string> = {
  voiture: "Voiture",
  utilitaire: "Utilitaire",
  camion: "Camion",
  bus: "Bus",
  engin: "Engin",
};

export default function Vehicules() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

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

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Véhicule supprimé",
        description: "Le véhicule a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le véhicule",
        variant: "destructive",
      });
    },
  });

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "immatriculation",
      header: "Immatriculation",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("immatriculation")}</div>
      ),
    },
    {
      accessorKey: "marque",
      header: "Marque",
    },
    {
      accessorKey: "modele",
      header: "Modèle",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return typeLabels[type] || type;
      },
    },
    {
      accessorKey: "kilometrage",
      header: "Kilométrage",
      cell: ({ row }) => {
        const km = row.getValue("kilometrage") as number;
        return `${km.toLocaleString("fr-FR")} km`;
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
        const vehicle = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingVehicle(vehicle)}
              data-testid={`button-edit-vehicle-${vehicle.id}`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid={`button-delete-vehicle-${vehicle.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer le véhicule {vehicle.immatriculation} ?
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(vehicle.id)}
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
          <p className="text-muted-foreground">Chargement des véhicules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Véhicules</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {vehicles.length} véhicule(s) au total
          </p>
        </div>
        <AddVehicleDialog />
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        searchPlaceholder="Rechercher par immatriculation, marque, modèle..."
      />

      {editingVehicle && (
        <EditVehicleDialog
          vehicle={editingVehicle}
          open={!!editingVehicle}
          onOpenChange={(open) => !open && setEditingVehicle(null)}
        />
      )}
    </div>
  );
}
