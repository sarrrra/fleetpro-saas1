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
import type { Vehicle, Client } from "@shared/schema";

interface AddTransactionDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddTransactionDialog({ trigger, open: controlledOpen, onOpenChange }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : open;
  const setDialogOpen = isControlled ? onOpenChange : setOpen;

  const [formData, setFormData] = useState({
    type: "recette",
    montant: "",
    date: new Date().toISOString().split('T')[0],
    categorie: "",
    description: "",
    vehiculeId: "",
    clientId: "",
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Transaction ajoutée",
        description: "La transaction a été ajoutée avec succès",
      });
      setFormData({
        type: "recette",
        montant: "",
        date: new Date().toISOString().split('T')[0],
        categorie: "",
        description: "",
        vehiculeId: "",
        clientId: "",
      });
      setDialogOpen?.(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la transaction",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      type: formData.type,
      montant: formData.montant,
      date: new Date(formData.date).toISOString(),
      categorie: formData.categorie,
    };

    if (formData.description) submitData.description = formData.description;
    if (formData.vehiculeId) submitData.vehiculeId = formData.vehiculeId;
    if (formData.clientId) submitData.clientId = formData.clientId;

    mutation.mutate(submitData);
  };

  const categories = formData.type === "recette" 
    ? [
        { value: "location", label: "Location" },
        { value: "vente", label: "Vente" },
        { value: "service", label: "Service" },
        { value: "autre", label: "Autre" },
      ]
    : [
        { value: "carburant", label: "Carburant" },
        { value: "maintenance", label: "Maintenance" },
        { value: "assurance", label: "Assurance" },
        { value: "taxe", label: "Taxe" },
        { value: "salaire", label: "Salaire" },
        { value: "autre", label: "Autre" },
      ];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value, categorie: "" })}
                required
              >
                <SelectTrigger id="type" data-testid="select-type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recette">Recette</SelectItem>
                  <SelectItem value="depense">Dépense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie *</Label>
              <Select
                value={formData.categorie}
                onValueChange={(value) => setFormData({ ...formData, categorie: value })}
                required
              >
                <SelectTrigger id="categorie" data-testid="select-categorie">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montant">Montant (€) *</Label>
              <Input
                id="montant"
                data-testid="input-montant"
                type="number"
                step="0.01"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                required
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicule">Véhicule (optionnel)</Label>
              <Select
                value={formData.vehiculeId}
                onValueChange={(value) => setFormData({ ...formData, vehiculeId: value })}
              >
                <SelectTrigger id="vehicule" data-testid="select-vehicule">
                  <SelectValue placeholder="Aucun" />
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
              <Label htmlFor="client">Client (optionnel)</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger id="client" data-testid="select-client">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              data-testid="input-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              data-testid="button-submit-transaction"
            >
              {mutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
