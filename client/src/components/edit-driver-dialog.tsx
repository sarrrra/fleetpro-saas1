import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Driver, Vehicle } from "@shared/schema";

interface EditDriverDialogProps {
  driver: Driver;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDriverDialog({ driver, open, onOpenChange }: EditDriverDialogProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nom: driver.nom,
    prenom: driver.prenom,
    telephone: driver.telephone,
    email: driver.email || "",
    numeroPermis: driver.numeroPermis || "",
    dateExpirationPermis: driver.dateExpirationPermis 
      ? new Date(driver.dateExpirationPermis).toISOString().split("T")[0] 
      : "",
    vehiculeAssigneId: driver.vehiculeAssigneId || "",
    status: driver.status,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        nom: driver.nom,
        prenom: driver.prenom,
        telephone: driver.telephone,
        email: driver.email || "",
        numeroPermis: driver.numeroPermis || "",
        dateExpirationPermis: driver.dateExpirationPermis 
          ? new Date(driver.dateExpirationPermis).toISOString().split("T")[0] 
          : "",
        vehiculeAssigneId: driver.vehiculeAssigneId || "",
        status: driver.status,
      });
    }
  }, [open, driver]);

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", `/api/drivers/${driver.id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Chauffeur modifié",
        description: "Le chauffeur a été modifié avec succès",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le chauffeur",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      nom: formData.nom,
      prenom: formData.prenom,
      telephone: formData.telephone,
      status: formData.status,
    };

    if (formData.email) submitData.email = formData.email;
    if (formData.numeroPermis) submitData.numeroPermis = formData.numeroPermis;
    if (formData.dateExpirationPermis) submitData.dateExpirationPermis = new Date(formData.dateExpirationPermis).toISOString();
    if (formData.vehiculeAssigneId && formData.vehiculeAssigneId !== "" && formData.vehiculeAssigneId !== "none") {
      submitData.vehiculeAssigneId = formData.vehiculeAssigneId;
    } else {
      submitData.vehiculeAssigneId = null;
    }

    mutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le chauffeur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                data-testid="input-edit-prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                data-testid="input-edit-nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                data-testid="input-edit-telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="input-edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroPermis">Numéro de permis</Label>
              <Input
                id="numeroPermis"
                data-testid="input-edit-numero-permis"
                value={formData.numeroPermis}
                onChange={(e) => setFormData({ ...formData, numeroPermis: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateExpirationPermis">Date d'expiration du permis</Label>
              <Input
                id="dateExpirationPermis"
                data-testid="input-edit-date-expiration-permis"
                type="date"
                value={formData.dateExpirationPermis}
                onChange={(e) => setFormData({ ...formData, dateExpirationPermis: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicule">Véhicule assigné</Label>
              <Select
                value={formData.vehiculeAssigneId || "none"}
                onValueChange={(value) => setFormData({ ...formData, vehiculeAssigneId: value === "none" ? "" : value })}
              >
                <SelectTrigger id="vehicule" data-testid="select-edit-vehicule">
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun véhicule</SelectItem>
                  {vehicles
                    .filter((v) => v.status === "disponible" || v.id === driver.vehiculeAssigneId)
                    .map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.immatriculation} - {vehicle.marque} {vehicle.modele}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status" data-testid="select-edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="conge">En congé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-edit"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              data-testid="button-submit-edit-driver"
            >
              {mutation.isPending ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
