import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AddVehicleDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    immatriculation: "",
    marque: "",
    modele: "",
    type: "",
    annee: "",
    kilometrage: "",
    heuresTravail: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/vehicles", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Véhicule ajouté",
        description: "Le véhicule a été ajouté avec succès",
      });
      setFormData({
        immatriculation: "",
        marque: "",
        modele: "",
        type: "",
        annee: "",
        kilometrage: "",
        heuresTravail: "",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le véhicule",
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
    };

    mutation.mutate(vehicleData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-vehicle">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Véhicule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau véhicule</DialogTitle>
          <DialogDescription>
            Remplissez les informations du véhicule à ajouter au parc.
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
                data-testid="input-immatriculation"
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
                data-testid="input-marque"
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
                data-testid="input-modele"
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
                data-testid="input-annee"
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
                <SelectTrigger data-testid="select-type">
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
                data-testid="input-kilometrage"
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
                data-testid="input-heures-travail"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" data-testid="button-submit-vehicle" disabled={mutation.isPending}>
              {mutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
