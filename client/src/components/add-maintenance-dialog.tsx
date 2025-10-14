import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle } from "@shared/schema";

interface AddMaintenanceDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddMaintenanceDialog({ trigger, open: controlledOpen, onOpenChange }: AddMaintenanceDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : open;
  const setDialogOpen = isControlled ? onOpenChange : setOpen;

  const [formData, setFormData] = useState({
    vehiculeId: "",
    type: "",
    description: "",
    urgency: "scheduled",
    complete: false,
    datePrevu: "",
    dateRealise: "",
    kilometragePrevu: "",
    kilometrageRealise: "",
    cout: "",
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/maintenance", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/maintenance/upcoming"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Maintenance ajoutée",
        description: "L'enregistrement de maintenance a été ajouté avec succès",
      });
      setFormData({
        vehiculeId: "",
        type: "",
        description: "",
        urgency: "scheduled",
        complete: false,
        datePrevu: "",
        dateRealise: "",
        kilometragePrevu: "",
        kilometrageRealise: "",
        cout: "",
      });
      setDialogOpen?.(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'enregistrement de maintenance",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      vehiculeId: formData.vehiculeId,
      type: formData.type,
      urgency: formData.urgency,
      complete: formData.complete,
    };

    if (formData.description) submitData.description = formData.description;
    if (formData.datePrevu) submitData.datePrevu = new Date(formData.datePrevu).toISOString();
    if (formData.dateRealise) submitData.dateRealise = new Date(formData.dateRealise).toISOString();
    if (formData.kilometragePrevu) submitData.kilometragePrevu = parseInt(formData.kilometragePrevu);
    if (formData.kilometrageRealise) submitData.kilometrageRealise = parseInt(formData.kilometrageRealise);
    if (formData.cout) submitData.cout = formData.cout;

    mutation.mutate(submitData);
  };

  const maintenanceTypes = [
    { value: "vidange", label: "Vidange" },
    { value: "filtres", label: "Filtres" },
    { value: "pneus", label: "Pneus" },
    { value: "freins", label: "Freins" },
    { value: "batterie", label: "Batterie" },
    { value: "courroie", label: "Courroie de distribution" },
    { value: "revision", label: "Révision générale" },
    { value: "autre", label: "Autre" },
  ];

  const urgencyOptions = [
    { value: "scheduled", label: "Planifié" },
    { value: "soon", label: "Bientôt" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Planifier une maintenance</DialogTitle>
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
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger id="type" data-testid="select-type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgence *</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                required
              >
                <SelectTrigger id="urgency" data-testid="select-urgency">
                  <SelectValue placeholder="Sélectionner urgence" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.complete}
                  onChange={(e) => setFormData({ ...formData, complete: e.target.checked })}
                  className="h-4 w-4"
                  data-testid="checkbox-complete"
                />
                <span className="text-sm font-medium">Maintenance terminée</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              data-testid="input-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datePrevu">Date prévue</Label>
              <Input
                id="datePrevu"
                data-testid="input-date-prevu"
                type="date"
                value={formData.datePrevu}
                onChange={(e) => setFormData({ ...formData, datePrevu: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kilometragePrevu">Kilométrage prévu</Label>
              <Input
                id="kilometragePrevu"
                data-testid="input-km-prevu"
                type="number"
                value={formData.kilometragePrevu}
                onChange={(e) => setFormData({ ...formData, kilometragePrevu: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateRealise">Date réalisée</Label>
              <Input
                id="dateRealise"
                data-testid="input-date-realise"
                type="date"
                value={formData.dateRealise}
                onChange={(e) => setFormData({ ...formData, dateRealise: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kilometrageRealise">Kilométrage réalisé</Label>
              <Input
                id="kilometrageRealise"
                data-testid="input-km-realise"
                type="number"
                value={formData.kilometrageRealise}
                onChange={(e) => setFormData({ ...formData, kilometrageRealise: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cout">Coût (€)</Label>
            <Input
              id="cout"
              data-testid="input-cout"
              type="number"
              step="0.01"
              value={formData.cout}
              onChange={(e) => setFormData({ ...formData, cout: e.target.value })}
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
              data-testid="button-submit-maintenance"
            >
              {mutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
