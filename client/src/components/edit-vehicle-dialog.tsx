import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle } from "@shared/schema";

interface EditVehicleDialogProps {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVehicleDialog({ vehicle, open, onOpenChange }: EditVehicleDialogProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    immatriculation: vehicle.immatriculation,
    marque: vehicle.marque,
    modele: vehicle.modele,
    type: vehicle.type,
    annee: vehicle.annee?.toString() || "",
    kilometrage: vehicle.kilometrage.toString(),
    heuresTravail: vehicle.heuresTravail?.toString() || "",
    status: vehicle.status,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        immatriculation: vehicle.immatriculation,
        marque: vehicle.marque,
        modele: vehicle.modele,
        type: vehicle.type,
        annee: vehicle.annee?.toString() || "",
        kilometrage: vehicle.kilometrage.toString(),
        heuresTravail: vehicle.heuresTravail?.toString() || "",
        status: vehicle.status,
      });
    }
  }, [open, vehicle]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", `/api/vehicles/${vehicle.id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Véhicule modifié",
        description: "Le véhicule a été modifié avec succès",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le véhicule",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vehicleData = {
      immatriculation: formData.immatriculation,
      marque: formData.marque,
      modele: formData.modele,
      type: formData.type,
      annee: formData.annee ? parseInt(formData.annee) : undefined,
      kilometrage: parseInt(formData.kilometrage),
      heuresTravail: formData.heuresTravail ? parseInt(formData.heuresTravail) : undefined,
      status: formData.status,
    };

    mutation.mutate(vehicleData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le véhicule</DialogTitle>
          <DialogDescription>
            Modifiez les informations du véhicule {vehicle.immatriculation}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="immatriculation">Immatriculation</Label>
              <Input
                id="immatriculation"
                placeholder="AB-123-CD"
                value={formData.immatriculation}
                onChange={(e) =>
                  setFormData({ ...formData, immatriculation: e.target.value })
                }
                data-testid="input-edit-immatriculation"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marque">Marque</Label>
              <Input
                id="marque"
                placeholder="Renault"
                value={formData.marque}
                onChange={(e) =>
                  setFormData({ ...formData, marque: e.target.value })
                }
                data-testid="input-edit-marque"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modele">Modèle</Label>
              <Input
                id="modele"
                placeholder="Trafic"
                value={formData.modele}
                onChange={(e) =>
                  setFormData({ ...formData, modele: e.target.value })
                }
                data-testid="input-edit-modele"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="annee">Année (optionnel)</Label>
              <Input
                id="annee"
                type="number"
                placeholder="2022"
                value={formData.annee}
                onChange={(e) =>
                  setFormData({ ...formData, annee: e.target.value })
                }
                data-testid="input-edit-annee"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type de véhicule</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                required
              >
                <SelectTrigger data-testid="select-edit-type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voiture">Voiture</SelectItem>
                  <SelectItem value="utilitaire">Utilitaire</SelectItem>
                  <SelectItem value="camion">Camion</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="engin">Engin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kilometrage">Kilométrage (km)</Label>
              <Input
                id="kilometrage"
                type="number"
                placeholder="50000"
                value={formData.kilometrage}
                onChange={(e) =>
                  setFormData({ ...formData, kilometrage: e.target.value })
                }
                data-testid="input-edit-kilometrage"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="heuresTravail">Heures de travail (optionnel)</Label>
              <Input
                id="heuresTravail"
                type="number"
                placeholder="1200"
                value={formData.heuresTravail}
                onChange={(e) =>
                  setFormData({ ...formData, heuresTravail: e.target.value })
                }
                data-testid="input-edit-heures-travail"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                required
              >
                <SelectTrigger data-testid="select-edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_location">En location</SelectItem>
                  <SelectItem value="en_maintenance">En maintenance</SelectItem>
                  <SelectItem value="hors_service">Hors service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" data-testid="button-submit-edit-vehicle" disabled={mutation.isPending}>
              {mutation.isPending ? "Modification..." : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
