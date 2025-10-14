import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle, Driver } from "@shared/schema";

interface AddFuelRecordDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddFuelRecordDialog({ trigger, open: controlledOpen, onOpenChange }: AddFuelRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : open;
  const setDialogOpen = isControlled ? onOpenChange : setOpen;

  const [formData, setFormData] = useState({
    vehiculeId: "",
    chauffeurId: "",
    date: new Date().toISOString().split('T')[0],
    quantite: "",
    coutUnitaire: "",
    coutTotal: "0",
    kilometrage: "",
    notes: "",
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  // Calculer automatiquement le coût total
  useEffect(() => {
    if (formData.quantite && formData.coutUnitaire) {
      const total = parseFloat(formData.quantite) * parseFloat(formData.coutUnitaire);
      setFormData(prev => ({ ...prev, coutTotal: total.toFixed(2) }));
    }
  }, [formData.quantite, formData.coutUnitaire]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/fuel", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/fuel"] });
      toast({
        title: "Enregistrement ajouté",
        description: "L'enregistrement de carburant a été ajouté avec succès",
      });
      setFormData({
        vehiculeId: "",
        chauffeurId: "",
        date: new Date().toISOString().split('T')[0],
        quantite: "",
        coutUnitaire: "",
        coutTotal: "0",
        kilometrage: "",
        notes: "",
      });
      setDialogOpen?.(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'enregistrement",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      vehiculeId: formData.vehiculeId,
      date: new Date(formData.date).toISOString(),
      quantite: formData.quantite,
      coutUnitaire: formData.coutUnitaire,
      coutTotal: formData.coutTotal,
      kilometrage: parseInt(formData.kilometrage),
    };

    if (formData.chauffeurId) submitData.chauffeurId = formData.chauffeurId;
    if (formData.notes) submitData.notes = formData.notes;

    mutation.mutate(submitData);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un enregistrement de carburant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicule">Véhicule *</Label>
              <Select
                value={formData.vehiculeId}
                onValueChange={(value) => setFormData({ ...formData, vehiculeId: value })}
                required
              >
                <SelectTrigger id="vehicule" data-testid="select-vehicule">
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.immatriculation} - {vehicle.marque} {vehicle.modele}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chauffeur">Chauffeur</Label>
              <Select
                value={formData.chauffeurId}
                onValueChange={(value) => setFormData({ ...formData, chauffeurId: value })}
              >
                <SelectTrigger id="chauffeur" data-testid="select-chauffeur">
                  <SelectValue placeholder="Sélectionner un chauffeur" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.prenom} {driver.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                data-testid="input-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kilometrage">Kilométrage *</Label>
              <Input
                id="kilometrage"
                data-testid="input-kilometrage"
                type="number"
                value={formData.kilometrage}
                onChange={(e) => setFormData({ ...formData, kilometrage: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantite">Quantité (L) *</Label>
              <Input
                id="quantite"
                data-testid="input-quantite"
                type="number"
                step="0.01"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coutUnitaire">Prix/L (€) *</Label>
              <Input
                id="coutUnitaire"
                data-testid="input-cout-unitaire"
                type="number"
                step="0.01"
                value={formData.coutUnitaire}
                onChange={(e) => setFormData({ ...formData, coutUnitaire: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coutTotal">Coût total (€)</Label>
              <Input
                id="coutTotal"
                data-testid="input-cout-total"
                type="number"
                step="0.01"
                value={formData.coutTotal}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              data-testid="input-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen?.(false)}
              data-testid="button-cancel"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              data-testid="button-submit-fuel"
            >
              {mutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
